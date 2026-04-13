import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "./ScoreGauge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import type { EvaluationRecord } from "@/lib/contracts/Web3Evaluator";
import { ExternalLink } from "lucide-react";

interface EvaluationResultProps {
  evaluation: EvaluationRecord;
}

export function EvaluationResultCard({ evaluation }: EvaluationResultProps) {
  const parsed = evaluation.parsed;
  if (!parsed) return null;

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Overall Score</CardTitle>
          {evaluation.project_url && (
            <a
              href={evaluation.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {evaluation.project_url} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative">
            <ScoreGauge score={parsed.overall_score} />
          </div>
        </CardContent>
      </Card>

      <CategoryBreakdown categories={parsed.categories} />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{parsed.summary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
