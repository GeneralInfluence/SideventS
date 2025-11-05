"use client";
import React from 'react';
import { useUniversalWallet } from '../hooks/useUniversalWallet';

// You can replace this with your actual unicorn logo asset
const unicornLogo = (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="14" fill="#FF69B4" />
    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#fff" fontFamily="sans-serif">🦄</text>
  </svg>
);

const UnicornStatus: React.FC = () => {
  const wallet = useUniversalWallet();
  const isConnected = wallet.isUnicorn && wallet.address;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', minWidth: '120px' }}>
      {/* <span style={{ display: 'flex', alignItems: 'center' }}>{unicornLogo}</span> */}
      <span style={{ display: 'flex', alignItems: 'center' }}>🦄</span>
      <span style={{ fontWeight: 500, fontSize: '1rem', color: isConnected ? '#28a745' : '#888' }}>
        {isConnected ? 'Connected' : 'Not Connected'}
      </span>
    </div>
  );
};

export default UnicornStatus;
