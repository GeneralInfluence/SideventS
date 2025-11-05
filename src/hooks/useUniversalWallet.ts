"use client";
// Coded lovingly by @cryptowampum and Claude AI
// src/hooks/useUniversalWallet.js - Bridge Unicorn wallet to work with existing Wagmi code
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { wrapUnicornWallet } from '../utils/unicornWalletWrapper';

// 🔥 GLOBAL STORE - Shared across all hook instances
// This is the key fix for the state consistency bug

export interface UnicornWallet {
  sendTransaction: (params: Record<string, unknown>) => Promise<unknown>;
  [key: string]: unknown;
}

interface WalletState {
  wallet: UnicornWallet | null;
  address: string | null;
  chain: string | null;
  chainId: number | null;
}

const unicornWalletStore = {
  wallet: null as UnicornWallet | null,
  address: null as string | null,
  chain: null as string | null,
  chainId: null as number | null,
  listeners: new Set<(state: WalletState) => void>(),

  // Update state and notify all subscribers
  setState(wallet: UnicornWallet | null, address: string | null, chain: string | null, chainId: number | null) {
    this.wallet = wallet;
    this.address = address;
    this.chain = chain;
    this.chainId = chainId;
    // Notify all subscribed components of the state change
    this.listeners.forEach(listener => {
      listener({ wallet, address, chain, chainId });
    });
  },

  // Subscribe a component to state updates
  subscribe(listener: (state: WalletState) => void) {
    this.listeners.add(listener);
    // Immediately provide current state to new subscribers
    listener({
      wallet: this.wallet,
      address: this.address,
      chain: this.chain,
      chainId: this.chainId
    });
    // Return unsubscribe function
    return () => { this.listeners.delete(listener); };
  },

  // Get current state (for initialization)
  getState(): WalletState {
    return {
      wallet: this.wallet,
      address: this.address,
      chain: this.chain,
      chainId: this.chainId
    };
  },

  // Clear all state
  clear() {
    this.setState(null, null, null, null);
  }
};

export const useUniversalWallet = () => {
  const wagmiAccount = useAccount();
  
  // Use shared store instead of isolated component state
  // Initialize with current store state
  const [unicornState, setUnicornState] = useState(() => unicornWalletStore.getState());
  
  const { wallet: unicornWallet, address: unicornAddress, chain: unicornChain, chainId: unicornChainId } = unicornState;

  // Subscribe to global store updates
  // This ensures THIS component re-renders when ANY component updates the store
  useEffect(() => {
    return unicornWalletStore.subscribe((state: WalletState) => setUnicornState(state));
  }, []);

  // Listen for Unicorn wallet events (global listener)
  useEffect(() => {
    const handleUnicornConnect = (event: Event) => {
      const customEvent = event as CustomEvent<WalletState>;
      console.log('🦄 useUniversalWallet: Unicorn connected', customEvent.detail);
      // Update global store (this will notify ALL components)
      unicornWalletStore.setState(
        customEvent.detail.wallet ? wrapUnicornWallet(customEvent.detail.wallet) : null,
        customEvent.detail.address,
        customEvent.detail.chain,
        customEvent.detail.chainId
      );
    };

    const handleUnicornDisconnect = () => {
      console.log('🦄 useUniversalWallet: Unicorn disconnected');
      
      // Clear global store (this will notify ALL components)
      unicornWalletStore.clear();
    };

    window.addEventListener('unicorn-wallet-connected', handleUnicornConnect);
    window.addEventListener('unicorn-wallet-disconnected', handleUnicornDisconnect);

    // 🔥 CRITICAL: Check if there's already a connected wallet
    // This handles components that mount AFTER the connection event fired
    if (window.__UNICORN_WALLET_STATE__) {
      const state = window.__UNICORN_WALLET_STATE__;
      console.log('🦄 useUniversalWallet: Found existing connection state', state);
      
      unicornWalletStore.setState(
        state.wallet ? wrapUnicornWallet(state.wallet) : null,
        state.address,
        state.chain,
        state.chainId
      );
    }

    return () => {
      window.removeEventListener('unicorn-wallet-connected', handleUnicornConnect);
      window.removeEventListener('unicorn-wallet-disconnected', handleUnicornDisconnect);
    };
  }, []); // Run only once on mount

  // Create a unified wallet interface that existing app code can use
  const unifiedWallet = {
    // Connection state - prioritize Wagmi, fallback to Unicorn
    isConnected: wagmiAccount.isConnected || !!unicornWallet,
    address: wagmiAccount.address || unicornAddress,
    
    // Chain info
    chain: wagmiAccount.chain?.name || unicornChain,
    chainId: wagmiAccount.chainId || unicornChainId,
    
    // Wallet info
    connector: wagmiAccount.connector || (unicornWallet ? { name: 'Unicorn', id: 'unicorn' } : null),
    isUnicorn: !!unicornWallet && !wagmiAccount.isConnected,
    isStandard: wagmiAccount.isConnected,
    
    // Raw wallet objects for advanced usage
    wagmiAccount,
    unicornWallet,
    
    // Send transaction function that works with both
    sendTransaction: async (txParams: Record<string, unknown>) => {
      if (wagmiAccount.isConnected) {
        // Use existing Wagmi transaction flow
        throw new Error('Use wagmi useSendTransaction hook for standard wallets');
      } else if (unicornWallet && typeof unicornWallet.sendTransaction === 'function') {
        // Use Unicorn wallet
        return await unicornWallet.sendTransaction(txParams);
      } else {
        throw new Error('No wallet connected');
      }
    },
    
    // Disconnect function that works with both wallet types
    disconnect: () => {
      if (wagmiAccount.isConnected) {
        // Use existing Wagmi disconnect
        if (wagmiAccount.connector?.disconnect) {
          wagmiAccount.connector.disconnect();
        }
      } else if (unicornWallet) {
        // Disconnect Unicorn wallet
        unicornWalletStore.clear();
        
        // Clear global state
        if (typeof window !== 'undefined') {
          delete window.__UNICORN_WALLET_STATE__;
        }
        
        // Dispatch disconnect event
        window.dispatchEvent(new CustomEvent('unicorn-wallet-disconnected'));
      }
    }
  };

  return unifiedWallet;
};
