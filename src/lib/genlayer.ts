import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC_URL = import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const client = createClient({
  chain: studionet,
  endpoint: RPC_URL,
});

export const contractAddress = CONTRACT_ADDRESS as `0x${string}`;

export interface CategoryScore {
  score: number;
  assessment: string;
}

export interface EvaluationResult {
  overall_score: number;
  categories: {
    use_case_clarity: CategoryScore;
    tokenomics: CategoryScore;
    team_credibility: CategoryScore;
    market_relevance: CategoryScore;
    risk_signals: CategoryScore;
  };
  summary: string;
}

export interface EvaluationRecord {
  id: number;
  project_url: string;
  description: string;
  result: string;
  submitter: string;
  timestamp: number;
  parsed?: EvaluationResult;
}

export function parseEvaluationResult(raw: string): EvaluationResult | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as EvaluationResult;
  } catch {
    return null;
  }
}

export function parseEvaluationRecord(raw: string): EvaluationRecord | null {
  try {
    const record = JSON.parse(raw) as EvaluationRecord;
    record.parsed = parseEvaluationResult(record.result) ?? undefined;
    return record;
  } catch {
    return null;
  }
}

export function parseEvaluationList(raw: string): EvaluationRecord[] {
  try {
    const arr = JSON.parse(raw) as EvaluationRecord[];
    return arr
      .map((item) => {
        if (typeof item === "string") {
          return parseEvaluationRecord(item);
        }
        item.parsed = parseEvaluationResult(item.result) ?? undefined;
        return item;
      })
      .filter(Boolean) as EvaluationRecord[];
  } catch {
    return [];
  }
}

export async function submitEvaluation(
  projectUrl: string,
  description: string,
  whitepaperText: string
): Promise<string> {
  const hash = await client.writeContract({
    address: contractAddress,
    functionName: "evaluate_project",
    args: [projectUrl, description, whitepaperText],
    value: BigInt(0),
  });

  const receipt = await client.waitForTransactionReceipt({ hash });
  return String(receipt?.data ?? hash);
}

export async function getEvaluation(evalId: number): Promise<EvaluationRecord | null> {
  const result = await client.readContract({
    address: contractAddress,
    functionName: "get_evaluation",
    args: [evalId],
  });
  if (!result) return null;
  return parseEvaluationRecord(result as string);
}

export async function getAllEvaluations(): Promise<EvaluationRecord[]> {
  const result = await client.readContract({
    address: contractAddress,
    functionName: "get_all_evaluations",
    args: [],
  });
  if (!result) return [];
  return parseEvaluationList(result as string);
}

export async function getEvaluationCount(): Promise<number> {
  const result = await client.readContract({
    address: contractAddress,
    functionName: "get_evaluation_count",
    args: [],
  });
  return Number(result ?? 0);
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-score-high";
  if (score >= 40) return "text-score-mid";
  return "text-score-low";
}

export function getScoreBgColor(score: number): string {
  if (score >= 70) return "bg-score-high";
  if (score >= 40) return "bg-score-mid";
  return "bg-score-low";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Critical";
}
