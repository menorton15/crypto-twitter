import type { User } from "@clerk/nextjs/dist/types/api";

export const filterUserForClient = (user: User) => {
  const primaryWallet = user.web3Wallets.find(
    (wallet) => wallet.id === user.primaryWeb3WalletId
  );

  if (!primaryWallet || primaryWallet === undefined)
    throw new Error("User wallet not found.");

  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
    address: primaryWallet.web3Wallet,
  };
};
