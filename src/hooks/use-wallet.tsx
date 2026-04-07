import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC_URL = import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  client: ReturnType<typeof createClient>;
}

const readClient = createClient({ chain: studionet, endpoint: RPC_URL });

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  client: readClient,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletClient, setWalletClient] = useState(readClient);

  const connect = useCallback(async () => {
    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]>; on: (event: string, cb: (...args: unknown[]) => void) => void } }).ethereum;
    if (!ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        const newClient = createClient({
          chain: studionet,
          endpoint: RPC_URL,
          provider: ethereum as never,
        });
        setWalletClient(newClient);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletClient(readClient);
    setError(null);
  }, []);

  useEffect(() => {
    const ethereum = (window as unknown as { ethereum?: { on: (event: string, cb: (...args: unknown[]) => void) => void } }).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        error,
        connect,
        disconnect,
        client: walletClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
