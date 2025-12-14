"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScoreBreakdown } from "@/components/ScoreBar";
import { RiskBadge } from "@/components/RiskBadge";
import { getDeal, acceptDeal, claimDeal } from "@/lib/api";
import { Deal } from "@/types";
import { cn } from "@/lib/utils";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(unlockAt: string): string {
  const now = new Date();
  const unlock = new Date(unlockAt);
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return "Unlocked";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function getStatusInfo(status: Deal["status"]) {
  switch (status) {
    case "open":
      return {
        badge: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Open</Badge>,
        description: "This deal is available for purchase",
      };
    case "funded":
      return {
        badge: <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Funded</Badge>,
        description: "Tokens are locked in escrow",
      };
    case "completed":
      return {
        badge: <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>,
        description: "Deal successfully completed",
      };
    case "cancelled":
      return {
        badge: <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Cancelled</Badge>,
        description: "This deal was cancelled",
      };
    default:
      return { badge: null, description: "" };
  }
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDeal(resolvedParams.id);
      setDeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeal();
  }, [resolvedParams.id]);

  const handleAccept = async () => {
    if (!deal) return;
    setIsActioning(true);
    setError(null);
    try {
      const buyerAddress = "0xdemo_buyer_" + Math.random().toString(36).slice(2, 10);
      await acceptDeal(deal.id, buyerAddress);
      loadDeal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept deal");
    } finally {
      setIsActioning(false);
    }
  };

  const handleClaim = async () => {
    if (!deal) return;
    setIsActioning(true);
    setError(null);
    try {
      await claimDeal(deal.id);
      loadDeal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim tokens");
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card border-border animate-pulse">
          <CardHeader>
            <div className="h-8 bg-secondary rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 bg-secondary rounded" />
            <div className="h-24 bg-secondary rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const statusInfo = getStatusInfo(deal.status);
  const savings = deal.market_value - deal.total_cost;
  const canClaim = deal.status === "funded" && deal.unlock_at && new Date(deal.unlock_at) <= new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">← Back to Dashboard</Link>
      </Button>

      {/* Deal Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-2xl text-primary">
                  {deal.token_symbol.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{deal.token_symbol}</CardTitle>
                  {statusInfo.badge}
                </div>
                <p className="text-muted-foreground mt-1">{statusInfo.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
              {deal.discount}% off
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Deal Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Token Amount</p>
              <p className="text-xl font-bold">{formatNumber(deal.token_amount)}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Price per Token</p>
              <p className="text-xl font-bold">${deal.price_per_token.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-bold">{formatCurrency(deal.total_cost)}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Lock Period</p>
              <p className="text-xl font-bold">{deal.lock_period} week{deal.lock_period > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Market Value</p>
              <p className="text-2xl font-bold">{formatCurrency(deal.market_value)}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">You Save</p>
              <p className="text-2xl font-bold text-green-400">+{formatCurrency(savings)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-semibold mb-3">Deal Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(deal.created_at)}</p>
                </div>
              </div>
              {deal.funded_at && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">Funded</p>
                    <p className="text-sm text-muted-foreground">{formatDate(deal.funded_at)}</p>
                  </div>
                </div>
              )}
              {deal.unlock_at && (
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    new Date(deal.unlock_at) <= new Date() ? "bg-green-500" : "bg-yellow-500"
                  )} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {new Date(deal.unlock_at) <= new Date() ? "Unlocked" : "Unlock Date"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(deal.unlock_at)}
                      {deal.status === "funded" && (
                        <span className="ml-2 text-yellow-400">
                          ({getTimeRemaining(deal.unlock_at)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {deal.status === "completed" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Completed</p>
                    <p className="text-sm text-muted-foreground">Tokens claimed by buyer</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Seller</p>
              <p className="font-mono text-sm truncate">{deal.seller_address}</p>
            </div>
            {deal.buyer_address && (
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                <p className="font-mono text-sm truncate">{deal.buyer_address}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {deal.status === "open" && (
            <Button
              onClick={handleAccept}
              disabled={isActioning}
              className="w-full"
              size="lg"
            >
              {isActioning ? "Processing..." : `Accept Deal - Pay ${formatCurrency(deal.total_cost)}`}
            </Button>
          )}

          {deal.status === "funded" && (
            <Button
              onClick={handleClaim}
              disabled={isActioning || !canClaim}
              className="w-full"
              size="lg"
              variant={canClaim ? "default" : "secondary"}
            >
              {isActioning
                ? "Processing..."
                : canClaim
                  ? "Claim Tokens"
                  : `Tokens unlock in ${getTimeRemaining(deal.unlock_at!)}`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {deal.ai_score && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Analysis</CardTitle>
              <RiskBadge
                recommendation={deal.ai_score.recommendation}
                size="lg"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreBreakdown scores={deal.ai_score.scores} />

            {/* Expected Returns */}
            <div>
              <h3 className="font-semibold mb-3">Expected Return</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <div className="text-xs text-muted-foreground">Bear</div>
                  <div className="text-lg font-bold text-red-400">
                    {deal.ai_score.expected_return.low > 0 ? "+" : ""}
                    {deal.ai_score.expected_return.low.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <div className="text-xs text-muted-foreground">Expected</div>
                  <div className="text-lg font-bold text-primary">
                    {deal.ai_score.expected_return.mid > 0 ? "+" : ""}
                    {deal.ai_score.expected_return.mid.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-xs text-muted-foreground">Bull</div>
                  <div className="text-lg font-bold text-green-400">
                    +{deal.ai_score.expected_return.high.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Key Risks */}
            {deal.ai_score.key_risks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Key Risks</h3>
                <ul className="space-y-2">
                  {deal.ai_score.key_risks.map((risk, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-2 rounded bg-yellow-500/5 border border-yellow-500/10"
                    >
                      <span className="text-yellow-500">⚠️</span>
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            <div>
              <h3 className="font-semibold mb-2">Analysis</h3>
              <p className="text-muted-foreground">{deal.ai_score.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
