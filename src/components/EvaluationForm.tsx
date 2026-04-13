import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useContract } from "@/hooks/use-contract";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface EvaluationFormProps {
  onSuccess: () => void;
}

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const { isConnected, isOnCorrectNetwork } = useWallet();
  const contract = useContract();
  const { toast } = useToast();

  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [whitepaperText, setWhitepaperText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({ title: "Connect your wallet first", variant: "destructive" });
      return;
    }

    if (!isOnCorrectNetwork) {
      toast({ title: "Please switch to the GenLayer network", variant: "destructive" });
      return;
    }

    if (!projectUrl && !description) {
      toast({ title: "Provide a project URL or description", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setTxStatus("Submitting transaction…");

    try {
      setTxStatus("Waiting for AI evaluation & validator consensus…");
      await contract.evaluateProject(projectUrl, description, whitepaperText);

      toast({ title: "Evaluation complete!", description: "Results stored onchain." });
      setProjectUrl("");
      setDescription("");
      setWhitepaperText("");
      setTxStatus("");
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setTxStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Submit Project for Evaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectUrl">Project URL</Label>
            <Input
              id="projectUrl"
              placeholder="https://example-project.com"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the Web3 project you want to evaluate…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whitepaper">Whitepaper Text (optional)</Label>
            <Textarea
              id="whitepaper"
              placeholder="Paste relevant whitepaper sections…"
              value={whitepaperText}
              onChange={(e) => setWhitepaperText(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {txStatus && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {txStatus}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isConnected || !isOnCorrectNetwork}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : !isConnected ? (
              "Connect wallet to submit"
            ) : !isOnCorrectNetwork ? (
              "Switch to GenLayer network"
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Evaluation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
