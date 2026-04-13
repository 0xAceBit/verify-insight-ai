import { getScoreLabel } from "@/lib/contracts/Web3Evaluator";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "lg";
}

export function ScoreGauge({ score, size = "lg" }: ScoreGaugeProps) {
  const radius = size === "lg" ? 80 : 40;
  const stroke = size === "lg" ? 10 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = radius + stroke;
  const svgSize = (radius + stroke) * 2;

  const hue = score <= 50 ? (score / 50) * 60 : 60 + ((score - 50) / 50) * 80;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`hsl(${hue}, 70%, 50%)`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <span
          className={`font-bold ${size === "lg" ? "text-4xl" : "text-xl"}`}
          style={{ color: `hsl(${hue}, 70%, 50%)` }}
        >
          {score}
        </span>
        {size === "lg" && (
          <span className="text-sm text-muted-foreground">{getScoreLabel(score)}</span>
        )}
      </div>
    </div>
  );
}
