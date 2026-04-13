import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet, formatAddress } from "@/lib/genlayer/wallet";
import { Wallet, LogOut, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ConnectWallet() {
  const {
    address,
    isLoading,
    isConnected,
    isMetaMaskInstalled,
    isOnCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("rejected")) {
        toast.info("Connection cancelled");
      } else if (msg.includes("not installed")) {
        toast.error("MetaMask not found", {
          description: "Please install MetaMask to connect.",
          action: {
            label: "Install",
            onClick: () => window.open("https://metamask.io/download/", "_blank"),
          },
        });
      } else {
        toast.error(msg);
      }
    }
  };

  const handleSwitch = async () => {
    try {
      await switchWalletAccount();
      toast.success("Account switched");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Switch failed";
      if (!msg.includes("rejected")) toast.error(msg);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {!isOnCorrectNetwork && (
          <Badge variant="destructive" className="text-xs">
            Wrong Network
          </Badge>
        )}
        <button
          onClick={handleSwitch}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary/80 transition-colors"
          title="Switch account"
        >
          {formatAddress(address)}
        </button>
        <Button variant="ghost" size="icon" onClick={disconnectWallet} title="Disconnect">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleConnect} disabled={isLoading} size="sm" variant="outline">
        {isLoading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : !isMetaMaskInstalled ? (
          <RefreshCw className="mr-1 h-4 w-4" />
        ) : (
          <Wallet className="mr-1 h-4 w-4" />
        )}
        {isLoading
          ? "Connecting…"
          : !isMetaMaskInstalled
            ? "Install MetaMask"
            : "Connect Wallet"}
      </Button>
    </div>
  );
}
