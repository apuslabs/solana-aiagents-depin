import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AvatarDefault, TokenIcon, ApusLogo } from "../assets/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSPLTokens } from "../contexts/splToken";
import { FC } from "react";

const ShortAddress: FC<{ address: string }> = ({ address }) => {
  const isLongerThen8Chars = address.length > 8;
  const firstPart = address.slice(0, 4);
  const lastPart = address.slice(-4);
  const shortAddress = `${firstPart}...${lastPart}`;
  return (
    <div title={address} data-tip={address}>
      {isLongerThen8Chars ? shortAddress : address}
    </div>
  );
};

function UserInfoBox() {
  const { publicKey } = useWallet();
  const { balance } = useSPLTokens(publicKey);
  return (
    <div className="flex bg-gray-300 p-2 rounded">
      <div className="flex flex-col items-end">
        <div>
          <ShortAddress address={publicKey?.toBase58() ?? ""} />
        </div>
        <div className="flex">
          {balance} <img src={TokenIcon} alt="Token Icon" />
        </div>
      </div>
      <div className="ml-2 avatar">
        <div className="w-12 h-12 rounded">
          <img src={AvatarDefault} />
        </div>
      </div>
    </div>
  );
}

function ConnectSolanaBtn() {
  return <WalletMultiButton />;
}

export default function Header() {
  const { connected } = useWallet();
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <img src={ApusLogo} alt="Apus Logo" className="w-16 h-8 mr-1" />
        <h1 className="text-2xl font-semibold">Apus Network</h1>
      </div>
      {connected ? <UserInfoBox /> : <ConnectSolanaBtn />}
    </div>
  );
}
