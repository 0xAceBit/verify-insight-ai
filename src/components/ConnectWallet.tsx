import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export function ConnectWallet() {
  const { address, isConnecting, isConnected, error, connect, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={connect} disabled={isConnecting} size="sm" variant="outline">
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
