import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// GenLayer Network Configuration
export const GENLAYER_CHAIN_ID = parseInt(
  import.meta.env.VITE_GENLAYER_CHAIN_ID || "61999"
);
export const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16).toUpperCase()}`;

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: import.meta.env.VITE_GENLAYER_CHAIN_NAME || "GenLayer Studio",
  nativeCurrency: {
    name: import.meta.env.VITE_GENLAYER_SYMBOL || "GEN",
    symbol: import.meta.env.VITE_GENLAYER_SYMBOL || "GEN",
    decimals: 18,
  },
  rpcUrls: [
    import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
  ],
  blockExplorerUrls: [],
};

// Ethereum provider type
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Get the GenLayer RPC URL
 */
export function getStudioUrl(): string {
  return (
    import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
  );
}

/**
 * Get the contract address from environment
 */
export function getContractAddress(): `0x${string}` {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  return address as `0x${string}`;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return !!window.ethereum?.isMetaMask;
}

/**
 * Get the Ethereum provider (MetaMask)
 */
export function getEthereumProvider(): EthereumProvider | null {
  return window.ethereum || null;
}

/**
 * Request accounts from MetaMask
 */
export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    return accounts;
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw new Error(`Failed to connect to MetaMask: ${err.message}`);
  }
}

/**
 * Get current accounts without requesting permission
 */
export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];

  try {
    return (await provider.request({ method: "eth_accounts" })) as string[];
  } catch {
    return [];
  }
}

/**
 * Get the current chain ID from MetaMask
 */
export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;

  try {
    return (await provider.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

/**
 * Add GenLayer network to MetaMask
 */
export async function addGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [GENLAYER_NETWORK],
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) throw new Error("User rejected adding the network");
    throw new Error(`Failed to add GenLayer network: ${err.message}`);
  }
}

/**
 * Switch to GenLayer network
 */
export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4902) {
      await addGenLayerNetwork();
    } else if (err.code === 4001) {
      throw new Error("User rejected switching the network");
    } else {
      throw new Error(`Failed to switch network: ${err.message}`);
    }
  }
}

/**
 * Check if on GenLayer network
 */
export async function isOnGenLayerNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  if (!chainId) return false;
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

/**
 * Connect to MetaMask and ensure GenLayer network
 */
export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) throw new Error("MetaMask is not installed");

  const accounts = await requestAccounts();
  if (!accounts || accounts.length === 0) throw new Error("No accounts found");

  const onCorrectNetwork = await isOnGenLayerNetwork();
  if (!onCorrectNetwork) await switchToGenLayerNetwork();

  return accounts[0];
}

/**
 * Request user to switch MetaMask account
 */
export async function switchAccount(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    if (!accounts || accounts.length === 0) throw new Error("No account selected");
    return accounts[0];
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) throw new Error("User rejected account switch");
    if (err.code === -32002) throw new Error("Account switch request already pending");
    throw new Error(`Failed to switch account: ${err.message}`);
  }
}

/**
 * Create a GenLayer client with optional MetaMask account
 */
export function createGenLayerClient(address?: string) {
  const config: Record<string, unknown> = {
    chain: studionet,
    endpoint: getStudioUrl(),
  };

  if (address) {
    config.account = address as `0x${string}`;
  }

  try {
    return createClient(config as Parameters<typeof createClient>[0]);
  } catch {
    return createClient({ chain: studionet, endpoint: getStudioUrl() });
  }
}

/**
 * Read-only client (no wallet needed)
 */
export const readClient = createGenLayerClient();
