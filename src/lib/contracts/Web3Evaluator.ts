import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { getContractAddress, getStudioUrl } from "../genlayer/client";

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

/**
 * Web3Evaluator contract class — mirrors the GenLayer boilerplate's
 * contract class pattern (e.g. FootballBets).
 */
class Web3Evaluator {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(contractAddress?: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = (contractAddress || getContractAddress()) as `0x${string}`;

    const config: Record<string, unknown> = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    } else {
      config.endpoint = getStudioUrl();
    }

    this.client = createClient(config as Parameters<typeof createClient>[0]);
  }

  /**
   * Update the account used for write transactions
   */
  updateAccount(address: string): void {
    this.client = createClient({
      chain: studionet,
      account: address as `0x${string}`,
      endpoint: getStudioUrl(),
    } as Parameters<typeof createClient>[0]);
  }

  /**
   * Submit a project for evaluation (write)
   */
  async evaluateProject(
    projectUrl: string,
    description: string,
    whitepaperText: string
  ): Promise<string> {
    const hash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "evaluate_project",
      args: [projectUrl, description, whitepaperText],
      value: BigInt(0),
    });

    const receipt = await this.client.waitForTransactionReceipt({ hash });
    return String(receipt?.data ?? hash);
  }

  /**
   * Get all evaluations (read)
   */
  async getAllEvaluations(): Promise<EvaluationRecord[]> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_all_evaluations",
      args: [],
    });
    if (!result) return [];
    return parseEvaluationList(result as string);
  }

  /**
   * Get evaluation count (read)
   */
  async getEvaluationCount(): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_evaluation_count",
      args: [],
    });
    return Number(result ?? 0);
  }

  /**
   * Get a single evaluation by ID (read)
   */
  async getEvaluation(evalId: number): Promise<EvaluationRecord | null> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_evaluation",
      args: [evalId],
    });
    if (!result) return null;
    return parseEvaluationRecord(result as string);
  }
}

// ── Parsing helpers ──

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

// ── Score utilities ──

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-score-high";
  if (score >= 40) return "text-score-mid";
  return "text-score-low";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Critical";
}

export default Web3Evaluator;
