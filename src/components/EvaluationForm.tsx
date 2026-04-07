import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { submitEvaluation } from "@/lib/genlayer";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

interface EvaluationFormProps {
  onSuccess: () => void;
}

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [whitepaperText, setWhitepaperText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("");
  const { toast } = useToast();
  const { isConnected, client } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({ title: "Wallet Required", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }

    if (!description && !projectUrl) {
      toast({ title: "Error", description: "Please provide a project URL or description.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setTxStatus("Submitting transaction...");

    try {
      setTxStatus("Waiting for consensus — AI evaluation in progress...");
      const result = await submitEvaluation(client, projectUrl, description, whitepaperText);
      setTxStatus("");
      toast({ title: "Evaluation Complete", description: `Evaluation submitted successfully. ID: ${result}` });
      setProjectUrl("");
      setDescription("");
      setWhitepaperText("");
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setTxStatus("");
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Evaluate a Project</CardTitle>
        <CardDescription>Submit a Web3 project for AI-powered on-chain evaluation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              placeholder="https://example-project.io"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the project's purpose, technology, and token model..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whitepaper">Whitepaper Text (optional)</Label>
            <Textarea
              id="whitepaper"
              placeholder="Paste relevant whitepaper excerpts..."
              value={whitepaperText}
              onChange={(e) => setWhitepaperText(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {txStatus && (
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">{txStatus}</span>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || !isConnected} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !isConnected ? (
              "Connect wallet to submit"
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Evaluation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
