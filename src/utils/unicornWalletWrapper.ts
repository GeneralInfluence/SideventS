// unicornWalletWrapper.js
// Utility functions for wrapping unicorn wallet functionality


import type { Wallet } from 'thirdweb/wallets';

export function wrapUnicornWallet(wallet: Partial<Wallet>): Wallet {
  return {
    id: wallet.id ?? 'unicorn',
    getChain: wallet.getChain ?? (() => undefined),
    getAccount: wallet.getAccount ?? (() => ({ address: wallet.address ?? '' })),
    autoConnect: wallet.autoConnect ?? (async () => ({ address: wallet.address ?? '' })),
    connect: wallet.connect ?? (async () => ({ address: wallet.address ?? '' })),
    disconnect: wallet.disconnect ?? (async () => {}),
    switchChain: wallet.switchChain ?? (async () => {}),
    subscribe: wallet.subscribe ?? (() => {}),
    getConfig: wallet.getConfig ?? (() => ({})),
    onConnectRequested: wallet.onConnectRequested,
    getAdminAccount: wallet.getAdminAccount,
    getAuthToken: wallet.getAuthToken,
    isUnicorn: true,
    getUnicornStatus: () => 'active',
    sendTransaction: wallet.sendTransaction ?? (async () => { throw new Error('sendTransaction not implemented'); })
  };
}
// ...existing code...

// Add more utility functions as needed
