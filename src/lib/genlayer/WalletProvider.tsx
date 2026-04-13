import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  isMetaMaskInstalled as checkMetaMask,
  connectMetaMask,
  switchAccount,
  getAccounts,
  getCurrentChainId,
  isOnGenLayerNetwork,
  getEthereumProvider,
  GENLAYER_CHAIN_ID,
} from "./client";

const DISCONNECT_FLAG = "wallet_disconnected";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  isOnCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<string | undefined>;
  disconnectWallet: () => void;
  switchWalletAccount: () => Promise<string | undefined>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * WalletProvider — manages wallet state for the entire app.
 * Follows GenLayer boilerplate pattern with network awareness,
 * disconnect persistence, and proper event cleanup.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: true,
    isMetaMaskInstalled: false,
    isOnCorrectNetwork: false,
  });

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const installed = checkMetaMask();

      if (!installed) {
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isLoading: false,
          isMetaMaskInstalled: false,
          isOnCorrectNetwork: false,
        });
        return;
      }

      // Respect user's disconnect intent
      if (localStorage.getItem(DISCONNECT_FLAG) === "true") {
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: false,
        });
        return;
      }

      try {
        const accounts = await getAccounts();
        const chainId = await getCurrentChainId();
        const correctNetwork = await isOnGenLayerNetwork();

        setState({
          address: accounts[0] || null,
          chainId,
          isConnected: accounts.length > 0,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: correctNetwork,
        });
      } catch {
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: false,
        });
      }
    };

    init();
  }, []);

  // MetaMask event listeners
  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      if (accounts.length > 0) {
        localStorage.removeItem(DISCONNECT_FLAG);
      }

      setState((prev) => ({
        ...prev,
        address: accounts[0] || null,
        chainId,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
    };

    const handleChainChanged = async (...args: unknown[]) => {
      const chainId = args[0] as string;
      const correctNetwork = parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
      const accounts = await getAccounts();

      setState((prev) => ({
        ...prev,
        chainId,
        address: accounts[0] || null,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
    };

    const handleDisconnect = () => {
      setState((prev) => ({
        ...prev,
        address: null,
        isConnected: false,
      }));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const address = await connectMetaMask();
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      localStorage.removeItem(DISCONNECT_FLAG);

      setState({
        address,
        chainId,
        isConnected: true,
        isLoading: false,
        isMetaMaskInstalled: true,
        isOnCorrectNetwork: correctNetwork,
      });

      return address;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.setItem(DISCONNECT_FLAG, "true");
    setState((prev) => ({
      ...prev,
      address: null,
      isConnected: false,
    }));
  }, []);

  const switchWalletAccount = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const newAddress = await switchAccount();
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      localStorage.removeItem(DISCONNECT_FLAG);

      setState({
        address: newAddress,
        chainId,
        isConnected: true,
        isLoading: false,
        isMetaMaskInstalled: true,
        isOnCorrectNetwork: correctNetwork,
      });

      return newAddress;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        switchWalletAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet state. Must be used within WalletProvider.
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
