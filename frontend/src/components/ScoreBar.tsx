"use client";

import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  inverted?: boolean; // For risk score where high = bad
  showWarning?: boolean;
}

export function ScoreBar({
  label,
  score,
  maxScore = 10,
  inverted = false,
  showWarning = false,
}: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  // Determine color based on score
  const getColor = () => {
    const effectiveScore = inverted ? maxScore - score : score;
    const ratio = effectiveScore / maxScore;

    if (ratio >= 0.7) return "bg-green-500";
    if (ratio >= 0.5) return "bg-yellow-500";
    if (ratio >= 0.3) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <span className="font-medium">{score.toFixed(1)}/{maxScore}</span>
          {showWarning && score >= 7 && (
            <span className="text-yellow-500">⚠️</span>
          )}
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ScoreBreakdownProps {
  scores: {
    technical: number;
    risk: number;
    sentiment: number;
    on_chain: number;
    fundamental: number;
    overall: number;
  };
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <ScoreBar label="Technical" score={scores.technical} />
      <ScoreBar label="Risk" score={scores.risk} inverted showWarning />
      <ScoreBar label="Sentiment" score={scores.sentiment} />
      <ScoreBar label="On-Chain" score={scores.on_chain} />
      <ScoreBar label="Fundamental" score={scores.fundamental} />
      <div className="pt-2 border-t border-border">
        <ScoreBar label="Overall" score={scores.overall} />
      </div>
    </div>
  );
}
