"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Deal, Recommendation } from "@/types";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  onAccept?: (dealId: string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function getRecommendationColor(rec: Recommendation): string {
  switch (rec) {
    case "STRONG_BUY":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "BUY":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "HOLD":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "HIGH_RISK":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "EXTREME_RISK":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function getStatusBadge(status: Deal["status"]) {
  switch (status) {
    case "open":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Open</Badge>;
    case "funded":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">Funded</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Completed</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">Cancelled</Badge>;
    default:
      return null;
  }
}

export function DealCard({ deal, onAccept }: DealCardProps) {
  const aiScore = deal.ai_score;
  const savings = deal.market_value - deal.total_cost;

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-bold text-primary">
                {deal.token_symbol.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{deal.token_symbol}</h3>
              <p className="text-sm text-muted-foreground">
                {formatNumber(deal.token_amount)} tokens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(deal.status)}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {deal.discount}% off
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Cost</p>
            <p className="font-semibold text-lg">{formatCurrency(deal.total_cost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Market Value</p>
            <p className="font-semibold text-lg">{formatCurrency(deal.market_value)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">You Save</p>
            <p className="font-semibold text-lg text-green-400">+{formatCurrency(savings)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lock Period</p>
            <p className="font-semibold text-lg">{deal.lock_period} week{deal.lock_period > 1 ? "s" : ""}</p>
          </div>
        </div>

        {aiScore && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">AI Score:</span>
                <span className="font-semibold">{aiScore.scores.overall.toFixed(1)}/10</span>
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      aiScore.scores.overall >= 7
                        ? "bg-green-500"
                        : aiScore.scores.overall >= 5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    )}
                    style={{ width: `${(aiScore.scores.overall / 10) * 100}%` }}
                  />
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs", getRecommendationColor(aiScore.recommendation))}
              >
                {aiScore.recommendation.replace("_", " ")}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/deals/${deal.id}`}>View Details</Link>
        </Button>
        {deal.status === "open" && onAccept && (
          <Button className="flex-1" onClick={() => onAccept(deal.id)}>
            Accept Deal
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
