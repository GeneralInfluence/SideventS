"use client";
// Coded lovingly by @cryptowampum and Claude AI
// UnicornAutoConnect.jsx - Completely isolated version to avoid provider conflicts
// This version renders in a separate React root to eliminate all React warnings

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider, AutoConnect } from 'thirdweb/react';
import type { AutoConnectProps } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

import { wrapUnicornWallet } from '../utils/unicornWalletWrapper';
import { inAppWallet } from 'thirdweb/wallets';
import { base, polygon, ethereum, arbitrum, optimism } from 'thirdweb/chains';



import type { Wallet } from 'thirdweb/wallets';

interface UnicornWalletState {
  wallet: Wallet;
  address: string;
  chain: string;
  chainId: number;
  timestamp: number;
}

declare global {
  interface Window {
    __UNICORN_WALLET_STATE__?: UnicornWalletState;
  }
}

// Simple chain mapping
const chains = {
  'base': base,
  'polygon': polygon, 
  'ethereum': ethereum,
  'mainnet': ethereum,
  'arbitrum': arbitrum,
  'optimism': optimism,
} as const;

type ChainName = keyof typeof chains;

const getChainByName = (chainName: string) => {
  const key = chainName?.toLowerCase() as ChainName;
  return chains[key] || base;
};

// Simple environment detection - only runs when accessed via Unicorn portal
const isUnicornEnvironment = () => {
  console.log('typeof window is undefined', typeof window === 'undefined');
  if (typeof window === 'undefined') return false;
  
  const params = new URLSearchParams(window.location.search);
  const walletId = params.get('walletId');
  const authCookie = params.get('authCookie');
  
  // Must have both parameters to be considered Unicorn environment
  console.log('UnicornAutoConnect: walletId=', walletId, 'authCookie=', authCookie);
  console.log('is Unicorn Environment #1:', walletId === 'inApp' && authCookie);
  return walletId === 'inApp' && authCookie;
};

// Isolated AutoConnect component that renders in its own React root
type IsolatedAutoConnectProps = Omit<AutoConnectProps, 'onConnect' | 'wallets' | 'client'> & {
  onConnect?: AutoConnectProps['onConnect'];
  clientId?: string;
  factoryAddress?: string;
  defaultChain?: string;
  debug?: boolean;
  enableTransactionApproval?: boolean;
};

const IsolatedAutoConnect = ({
  onConnect,
  // onError,
  clientId,
  factoryAddress,
  defaultChain = 'base',
  timeout = 5000,
  debug = false,
  enableTransactionApproval = true,
}: IsolatedAutoConnectProps) => {
  // Configuration - use props with sensible defaults
  const finalClientId = clientId || "4e8c81182c3709ee441e30d776223354";
  const finalFactoryAddress = factoryAddress || "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
  const finalChain = getChainByName(defaultChain);

  if (debug) {
    console.log('🦄 IsolatedAutoConnect: Configuration', {
      clientId: finalClientId.slice(0, 8) + '...',
      factoryAddress: finalFactoryAddress.slice(0, 8) + '...',
      chain: finalChain.name,
      timeout
    });
  }

  const client = createThirdwebClient({
    clientId: finalClientId
  });
  
  const wallet = inAppWallet({
    smartAccount: {
      factoryAddress: finalFactoryAddress,
      chain: finalChain,
      gasless: true,
    }
  });

  return (
    <ThirdwebProvider>
      <AutoConnect
    client={client}
    wallets={[wallet]}
  onConnect={async (connectedWallet) => {
          // Extract wallet address properly
          const walletAddress = (() => {
            if (typeof connectedWallet === 'object' && connectedWallet !== null) {
              const account = typeof (connectedWallet as { getAccount?: () => { address?: string } }).getAccount === 'function'
                ? (connectedWallet as { getAccount?: () => { address?: string } }).getAccount?.()
                : undefined;
              return account?.address ?? (connectedWallet as { address?: string }).address ?? 'No address found';
            }
            return 'No address found';
          })();
          // Use walletAddress in debug log to avoid unused variable error
          if (debug) {
            console.log('Wallet address:', walletAddress);
          }
          try {
            let walletAddress = 'No address found';
            if (typeof connectedWallet === 'object' && connectedWallet !== null) {
              const account = typeof (connectedWallet as { getAccount?: () => { address?: string } }).getAccount === 'function'
                ? (connectedWallet as { getAccount?: () => { address?: string } }).getAccount?.()
                : undefined;
              walletAddress = account?.address ?? (connectedWallet as { address?: string }).address ?? 'No address found';
            }
            
            // Wrap wallet to add transaction approval if enabled
            // Pass client and finalChain to the wrapper
            const finalWallet = enableTransactionApproval 
              ? wrapUnicornWallet(connectedWallet)
              : connectedWallet;
            
            if (debug) {
              console.log('🦄 IsolatedAutoConnect: Success!');
              console.log('Chain:', finalChain.name);
              console.log('Address:', walletAddress);
              console.log('Transaction Approval:', enableTransactionApproval ? 'Enabled' : 'Disabled');
              console.log('Wallet object:', connectedWallet);
            }
            
            // 🔥 CRITICAL: Store globally for late-mounting components
            // This ensures components that mount AFTER connection can still access state
            if (typeof window !== 'undefined') {
              window.__UNICORN_WALLET_STATE__ = {
                wallet: finalWallet,
                address: walletAddress,
                chain: finalChain.name ?? '',
                chainId: finalChain.id,
                timestamp: Date.now()
              };
              if (debug) {
                console.log('🦄 Global state stored:', window.__UNICORN_WALLET_STATE__);
              }
            }
            
            // 🔥 CRITICAL: Dispatch the event so useUniversalWallet can pick it up
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('unicorn-wallet-connected', {
                detail: { 
                  wallet: finalWallet, 
                  address: walletAddress,
                  chain: finalChain.name,
                  chainId: finalChain.id
                }
              }));
              if (debug) {
                console.log('🦄 Event dispatched: unicorn-wallet-connected');
              }
            }
            
            // Call user-provided callback AFTER dispatching event and storing state
            if (onConnect) {
              try {
                onConnect(finalWallet);
              } catch (callbackError) {
                console.error('🦄 Error in onConnect callback:', callbackError);
              }
            }
            
          } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.warn('🦄 Could not extract wallet address:', error);
          }
        }}
        timeout={timeout}
      />
    </ThirdwebProvider>
  );
};

// Main UnicornAutoConnect component that creates isolated React root
const UnicornAutoConnect: React.FC<IsolatedAutoConnectProps> = (props) => {
  React.useEffect(() => {
    // Only run if in Unicorn environment
    if (!isUnicornEnvironment()) {
      console.log('is Unicorn Environment #2:', isUnicornEnvironment());
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Not in Unicorn environment, skipping');
      }
      return;
    }

    if (props.debug) {
      console.log('🦄 UnicornAutoConnect: Creating isolated React root for AutoConnect');
    }

    // Create a completely separate React root to avoid provider conflicts
    const container = document.createElement('div');
    container.style.display = 'none';
    container.id = 'unicorn-autoconnect-root';
    document.body.appendChild(container);
    
    const root = ReactDOM.createRoot(container);
    
    // Small delay to ensure other providers are ready
    const timer = setTimeout(() => {
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Rendering isolated AutoConnect');
      }
      root.render(<IsolatedAutoConnect {...props} />);
    }, 300);

    // Cleanup function
    return () => {
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Cleaning up isolated React root');
      }
      clearTimeout(timer);
      
      // Clear global state on unmount
      if (typeof window !== 'undefined') {
        window.__UNICORN_WALLET_STATE__ = undefined;
      }
      
      setTimeout(() => {
        try {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch (e) {
          console.warn('UnicornAutoConnect cleanup warning:', e);
        }
      }, 100);
    };
  }, [props]); // Add props to dependency array for strict typing

  return null; // This component doesn't render anything in the main React tree
};

export default UnicornAutoConnect;
