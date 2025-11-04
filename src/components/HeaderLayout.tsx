import React from 'react';
import UnicornAutoConnect from './UnicornAutoConnect';
import UnicornStatus from './UnicornStatus';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import './HeaderLayout.css'; // Optional: for custom styles

interface HeaderLayoutProps {
  children: React.ReactNode;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ children }) => {
  return (
    <div className="header-layout">
      <header className="header">
        <h1>🦄 SideventS Demo </h1>
        <div className="header-section">
          <UnicornAutoConnect />
        </div>
        <div className="header-section">
          <UnicornStatus />
        </div>
        <div className="header-section">
          <ConnectButton />
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default HeaderLayout;
