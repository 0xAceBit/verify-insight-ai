import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllEvaluations, type EvaluationRecord, getScoreColor } from "@/lib/genlayer";
import { EvaluationResultCard } from "./EvaluationResult";
import { DEMO_EVALUATIONS } from "@/lib/demo-data";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";

interface EvaluationHistoryProps {
  refreshKey: number;
}

export function EvaluationHistory({ refreshKey }: EvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [demoMode, setDemoMode] = useState(!import.meta.env.VITE_CONTRACT_ADDRESS);

  const fetchEvaluations = async () => {
    if (demoMode) {
      setEvaluations(DEMO_EVALUATIONS);
      setError("");
      return;
    }
    if (!import.meta.env.VITE_CONTRACT_ADDRESS) {
      setError("No contract address configured. Set VITE_CONTRACT_ADDRESS in your .env file.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getAllEvaluations();
      setEvaluations(data.reverse());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch evaluations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [refreshKey]);

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Evaluation History</CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchEvaluations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && evaluations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        ) : evaluations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No evaluations yet. Submit your first project above.</p>
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-40">Submitter</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev) => (
                  <>
                    <TableRow
                      key={ev.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
                    >
                      <TableCell className="font-mono text-xs">{ev.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {ev.project_url || ev.description?.slice(0, 60) || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {ev.parsed ? (
                          <span className={`font-bold ${getScoreColor(ev.parsed.overall_score)}`}>
                            {ev.parsed.overall_score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ev.submitter ? `${ev.submitter.slice(0, 6)}...${ev.submitter.slice(-4)}` : "—"}
                      </TableCell>
                      <TableCell>
                        {expandedId === ev.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === ev.id && (
                      <TableRow key={`${ev.id}-detail`}>
                        <TableCell colSpan={5} className="p-4">
                          <EvaluationResultCard evaluation={ev} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
