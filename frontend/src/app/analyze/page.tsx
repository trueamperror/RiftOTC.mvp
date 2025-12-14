"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TokenSearch } from "@/components/TokenSearch";
import { ScoreBreakdown } from "@/components/ScoreBar";
import { RiskBadge } from "@/components/RiskBadge";
import { analyzeToken } from "@/lib/api";
import { TokenAnalysis, TokenSearchResult } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/Sparkline";
import { PriceChart } from "@/components/PriceChart";
import { ChatInterface } from "@/components/ChatInterface";

const lockPeriods = [
  { value: 1, label: "1 Week", description: "Lower risk, lower discount" },
  { value: 4, label: "4 Weeks", description: "Balanced risk/reward" },
  { value: 8, label: "8 Weeks", description: "Higher discount, more exposure" },
];

function formatCurrency(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
}

export default function AnalyzePage() {
  const [selectedToken, setSelectedToken] = useState<TokenSearchResult | null>(null);
  const [lockPeriod, setLockPeriod] = useState<number>(4);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeToken(selectedToken.id, lockPeriod);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze token");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Token Analyzer</h1>
        <p className="text-muted-foreground">
          Get AI-powered analysis for short-term OTC deal opportunities
        </p>
      </div>

      {/* Search Form */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <TokenSearch
              onSelect={(token) => {
                setSelectedToken(token);
                setAnalysis(null);
              }}
              placeholder="Search for a token (e.g., Uniswap, Arbitrum)..."
            />
            {selectedToken && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedToken.name} ({selectedToken.symbol.toUpperCase()})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lock Period</Label>
            <div className="grid grid-cols-3 gap-3">
              {lockPeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setLockPeriod(period.value)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-colors",
                    lockPeriod === period.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold">{period.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {period.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedToken || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Analyzing..." : "Analyze Token"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Token Icon */}
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {analysis.image && (
                      <img
                        src={analysis.image}
                        alt={analysis.token_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    )}
                    {!analysis.image && (
                      <span className="font-bold text-lg text-primary">
                        {analysis.token_symbol.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Token Info */}
                  <div>
                    <CardTitle className="text-2xl">
                      {analysis.token_name}
                      <span className="text-muted-foreground ml-2 text-lg font-normal">
                        ({analysis.token_symbol.toUpperCase()})
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <span className="text-foreground font-medium">
                        ${analysis.current_price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </span>
                      {analysis.market_cap && (
                        <span>MC: {formatCurrency(analysis.market_cap)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <RiskBadge
                  recommendation={analysis.recommendation}
                  size="lg"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Breakdown */}
              <div>
                <h3 className="font-semibold mb-4">Score Breakdown</h3>
                <ScoreBreakdown scores={analysis.scores} />
              </div>

              {/* Price Chart */}
              {analysis.price_history_1y && analysis.price_history_1y.length > 0 && (
                <PriceChart
                  data={analysis.price_history_1y}
                  symbol={analysis.token_symbol}
                />
              )}

              {/* Overall Score Display */}
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Overall Score
                </div>
                <div className="text-4xl font-bold">
                  {analysis.scores.overall.toFixed(1)}
                  <span className="text-lg text-muted-foreground">/10</span>
                </div>
              </div>

              {/* Expected Returns */}
              <div>
                <h3 className="font-semibold mb-4">Expected Return ({lockPeriod} week lock)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                    <div className="text-sm text-muted-foreground">Bear Case</div>
                    <div className="text-xl font-bold text-red-400">
                      {analysis.expected_return.low > 0 ? "+" : ""}
                      {analysis.expected_return.low.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <div className="text-sm text-muted-foreground">Expected</div>
                    <div className="text-xl font-bold text-primary">
                      {analysis.expected_return.mid > 0 ? "+" : ""}
                      {analysis.expected_return.mid.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                    <div className="text-sm text-muted-foreground">Bull Case</div>
                    <div className="text-xl font-bold text-green-400">
                      +{analysis.expected_return.high.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Risks */}
              {analysis.key_risks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Key Risks</h3>
                  <ul className="space-y-2">
                    {analysis.key_risks.map((risk, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                      >
                        <span className="text-yellow-500 mt-0.5">⚠️</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Reasoning */}
              <div>
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.reasoning}
                </p>
              </div>

              {/* Chat Interface */}
              <div className="mt-8">
                <ChatInterface tokenContext={analysis} />
              </div>

              {/* CTA */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedToken(null);
                    setAnalysis(null);
                  }}
                >
                  Analyze Another
                </Button>
                <Button className="flex-1" asChild>
                  <a href={`/deals/create?token=${analysis.token_id}&lock=${lockPeriod}`}>
                    Create Deal with {analysis.token_symbol.toUpperCase()}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
