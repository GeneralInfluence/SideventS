import * as React from 'react';
import { useUniversalWallet } from '../hooks/useUniversalWallet';
import PageETHD from './PageETHD';
import PageUser from './PageUser';
import PageSponsor from './PageSponsor';

type WalletType = {
  address?: string | null;
  isUnicorn?: boolean;
  unicornWallet?: unknown;
};

function getPageForWallet(wallet: WalletType) {
  // Example: If wallet address starts with '0xethd', show PageETHD
  console.log('Wallet address:', wallet?.address);
  if (wallet?.address === '0x338DE89f3BB60444BAc39D27dDd8324A2497Cb8f') {
    return <PageETHD />;
  }
  // Add more conditions for other pages
  // Example: If wallet address is exactly '0xuser', show PageUser
  if (wallet?.address === '0xuser') {
    return <PageUser />;
  }
  // Example: If wallet address is exactly '0xsponsor', show PageSponsor
  if (wallet?.address === '0xsponsor') {
    return <PageSponsor />;
  }
  // Default fallback
  return <div>Please connect your wallet.</div>;
}

const PageHost: React.FC = () => {
  const wallet = useUniversalWallet();
  return (
    <div>
      {getPageForWallet(wallet as WalletType)}
    </div>
  );
};

export default PageHost;
