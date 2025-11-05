"use client";
import * as React from "react";
import { useUniversalWallet } from "../hooks/useUniversalWallet";
import PageETHD from "./PageETHD";
import PageHost from "./PageHost";
import PageUser from "./PageUser";
import PageSponsor from "./PageSponsor";

// Same wallet type as PageHost
type WalletType = {
  address?: string | null;
  isUnicorn?: boolean;
  unicornWallet?: unknown;
};

function getPageForWallet(wallet: WalletType) {
  // if (wallet?.address === '0x338DE89f3BB60444BAc39D27dDd8324A2497Cb8f') {
  // return <PageUser />;
  // return <PageHost eventShortId={'SMu78xNR'} />;
  // return <PageHost walletId={'6900cb85d97bec334b6b5902'} />;
  // }
  // if (wallet?.address === '0x338DE89f3BB60444BAc39D27dDd8324A2497Cb8f') {
  // return <PageETHD />;
  // }
  // Add more conditions for other pages
  // Example: If wallet address is exactly '0xuser', show PageUser
  // if (wallet?.address === "0xuser") {
  //   return <PageUser />;
  // }
  // Example: If wallet address is exactly '0xsponsor', show PageSponsor
  // if (wallet?.address === "0xsponsor") {
    return <PageSponsor />;
  // }
  // Default fallback
  return <div>Please connect your wallet.</div>;
}

const PageRoute: React.FC = () => {
  const wallet = useUniversalWallet();
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '24px', background: '#f3f2f3', borderRadius: 12 }}>
      <div>{getPageForWallet(wallet as WalletType)}</div>
    </div>
  );
};

export default PageRoute;
