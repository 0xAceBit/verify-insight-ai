import { useState } from "react";
import { EvaluationForm } from "@/components/EvaluationForm";
import { EvaluationHistory } from "@/components/EvaluationHistory";
import { ConnectWallet } from "@/components/ConnectWallet";
import { WalletProvider } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { Shield, Cpu, Globe } from "lucide-react";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <WalletProvider>
      <div className="dark min-h-screen bg-background text-foreground">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight">GL Evaluator</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden text-xs text-muted-foreground sm:inline-flex">
                Powered by GenLayer
              </Badge>
              <ConnectWallet />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
          <section className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Web3 Project Evaluator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered, on-chain evaluation of blockchain projects. Submit a URL or description and
              get a verifiable score powered by GenLayer intelligent contracts.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Verifiable AI</span>
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Web-Fetching</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> On-Chain</span>
            </div>
          </section>

          <EvaluationForm onSuccess={() => setRefreshKey((k) => k + 1)} />
          <EvaluationHistory refreshKey={refreshKey} />
        </main>

        <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          Built with GenLayer · Verifiable AI · Intelligent Contracts
        </footer>
      </div>
    </WalletProvider>
  );
};

export default Index;
