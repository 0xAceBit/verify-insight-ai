/**
 * Re-export wallet functionality from WalletProvider.
 * Maintains a clean public API matching the GenLayer boilerplate pattern.
 */
export { useWallet, WalletProvider } from "./WalletProvider";
export type { WalletState } from "./WalletProvider";

/**
 * Format an address for display
 */
export function formatAddress(
  address: string | null,
  maxLength: number = 12
): string {
  if (!address) return "";
  if (address.length <= maxLength) return address;

  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = Math.ceil((maxLength - 3) / 2);

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}
