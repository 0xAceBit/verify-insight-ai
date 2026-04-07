import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EvaluationResult } from "@/lib/genlayer";
import { Shield, TrendingUp, Users, Lightbulb, AlertTriangle } from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; max: number }> = {
  use_case_clarity: { label: "Use Case Clarity", icon: <Lightbulb className="h-4 w-4" />, max: 20 },
  tokenomics: { label: "Tokenomics", icon: <TrendingUp className="h-4 w-4" />, max: 20 },
  team_credibility: { label: "Team Credibility", icon: <Users className="h-4 w-4" />, max: 20 },
  market_relevance: { label: "Market Relevance", icon: <Shield className="h-4 w-4" />, max: 20 },
  risk_signals: { label: "Risk Signals", icon: <AlertTriangle className="h-4 w-4" />, max: 20 },
};

interface CategoryBreakdownProps {
  categories: EvaluationResult["categories"];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(categories).map(([key, value]) => {
        const meta = CATEGORY_META[key];
        if (!meta) return null;
        const pct = (value.score / meta.max) * 100;
        const hue = pct <= 50 ? (pct / 50) * 60 : 60 + ((pct - 50) / 50) * 80;

        return (
          <Card key={key} className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0 p-4">
              <span style={{ color: `hsl(${hue}, 70%, 50%)` }}>{meta.icon}</span>
              <CardTitle className="text-sm font-medium">{meta.label}</CardTitle>
              <span
                className="ml-auto text-lg font-bold"
                style={{ color: `hsl(${hue}, 70%, 50%)` }}
              >
                {value.score}/{meta.max}
              </span>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <Progress value={pct} className="h-1.5 mb-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">{value.assessment}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
