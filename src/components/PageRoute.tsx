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
  if (wallet?.address === '0xe7446D343E357e650B74B0196307433aB920e0E8') {
    return <PageSponsor />;
  }
  if (wallet?.address === '0x338DE89f3BB60444BAc39D27dDd8324A2497Cb8f') {
    return <PageHost eventShortId={'SMu78xNR'} />;
  }
  if (wallet?.address === '0x8Ee927f5a31EbA81b02AB1Ffc74289b32a505D35') {
    return <PageETHD />;
  }
  return <PageUser />;
  // // Default fallback
  // return <div>Please connect your wallet.</div>;
}

const PageRoute: React.FC = () => {
  const wallet = useUniversalWallet();
  return (
    // <div style={{ maxWidth: 800, margin: '40px auto', padding: '24px', background: '#f3f2f3', borderRadius: 12 }}>
      <div>{getPageForWallet(wallet as WalletType)}</div>
    // </div>
  );
};

export default PageRoute;
