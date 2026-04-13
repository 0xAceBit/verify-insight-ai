/**
 * GenLayer integration barrel export.
 * Mirrors the boilerplate's lib/genlayer/ structure.
 */
export {
  getContractAddress,
  getStudioUrl,
  isMetaMaskInstalled,
  getEthereumProvider,
  connectMetaMask,
  switchAccount,
  createGenLayerClient,
  readClient,
  GENLAYER_CHAIN_ID,
  GENLAYER_CHAIN_ID_HEX,
  GENLAYER_NETWORK,
} from "./client";

export { WalletProvider, useWallet } from "./WalletProvider";
export type { WalletState } from "./WalletProvider";

export { formatAddress } from "./wallet";
