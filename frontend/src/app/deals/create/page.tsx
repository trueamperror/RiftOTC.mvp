"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TokenSearch } from "@/components/TokenSearch";
import { createDeal, getToken, analyzeToken, getSuggestedDiscount } from "@/lib/api";
import { TokenData, TokenSearchResult, TokenAnalysis } from "@/types";
import { cn } from "@/lib/utils";

const lockPeriods = [
  { value: 1, label: "1 Week" },
  { value: 4, label: "4 Weeks" },
  { value: 8, label: "8 Weeks" },
];

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function CreateDealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedToken, setSelectedToken] = useState<TokenSearchResult | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [amount, setAmount] = useState<string>("1000");
  const [discount, setDiscount] = useState<number>(15);
  const [lockPeriod, setLockPeriod] = useState<number>(4);
  const [suggestedDiscount, setSuggestedDiscount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load token from URL params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const lockParam = searchParams.get("lock");

    if (tokenParam) {
      handleTokenSelect({ id: tokenParam, name: "", symbol: "", market_cap_rank: undefined, thumb: undefined });
    }
    if (lockParam) {
      const lock = parseInt(lockParam);
      if ([1, 4, 8].includes(lock)) {
        setLockPeriod(lock);
      }
    }
  }, [searchParams]);

  const handleTokenSelect = async (token: TokenSearchResult) => {
    setSelectedToken(token);
    setIsAnalyzing(true);
    setError(null);

    try {
      const [data, analysisResult] = await Promise.all([
        getToken(token.id),
        analyzeToken(token.id, lockPeriod),
      ]);

      setTokenData(data);
      setAnalysis(analysisResult);

      // Get suggested discount
      try {
        const suggestion = await getSuggestedDiscount(
          token.id,
          lockPeriod,
          analysisResult.scores.risk
        );
        setSuggestedDiscount(suggestion.suggested_discount);
        setDiscount(Math.round(suggestion.suggested_discount));
      } catch {
        // Ignore suggestion errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token data");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedToken || !tokenData) return;

    setIsLoading(true);
    setError(null);

    try {
      const pricePerToken = tokenData.current_price * (1 - discount / 100);

      await createDeal({
        seller_address: "0xdemo_seller_" + Math.random().toString(36).slice(2, 10),
        token_id: selectedToken.id,
        token_symbol: tokenData.symbol.toUpperCase(),
        token_amount: parseFloat(amount),
        price_per_token: pricePerToken,
        discount: discount,
        lock_period: lockPeriod as 1 | 4 | 8,
      });

      router.push("/?created=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setIsLoading(false);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const marketPrice = tokenData?.current_price || 0;
  const discountedPrice = marketPrice * (1 - discount / 100);
  const totalCost = amountNum * discountedPrice;
  const marketValue = amountNum * marketPrice;
  const savings = marketValue - totalCost;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create OTC Deal</h1>
        <p className="text-muted-foreground">
          Sell your tokens at a discount for immediate liquidity
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Token to Sell</Label>
            <TokenSearch
              onSelect={handleTokenSelect}
              placeholder="Search for a token..."
            />
            {selectedToken && tokenData && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary text-sm">
                      {tokenData.symbol.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{tokenData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tokenData.symbol.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(marketPrice)}</p>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount of Tokens</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
            />
          </div>

          {/* Lock Period */}
          <div className="space-y-2">
            <Label>Lock Period</Label>
            <div className="grid grid-cols-3 gap-3">
              {lockPeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setLockPeriod(period.value)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-colors",
                    lockPeriod === period.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold">{period.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Discount</Label>
              <span className="text-2xl font-bold text-primary">{discount}%</span>
            </div>
            <Slider
              value={[discount]}
              onValueChange={(value) => setDiscount(value[0])}
              min={5}
              max={40}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5%</span>
              {suggestedDiscount && (
                <button
                  onClick={() => setDiscount(Math.round(suggestedDiscount))}
                  className="flex items-center gap-1 text-primary font-medium hover:underline text-sm bg-primary/10 px-2 py-1 rounded"
                >
                  ✨ Apply AI Suggestion: {suggestedDiscount.toFixed(0)}%
                </button>
              )}
              <span>40%</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Deal Summary */}
      {tokenData && amountNum > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Deal Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Market Price</p>
                <p className="text-lg font-medium">{formatCurrency(marketPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Price ({discount}% off)</p>
                <p className="text-lg font-medium text-primary">{formatCurrency(discountedPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Value</p>
                <p className="text-lg font-medium">{formatCurrency(marketValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">You Receive</p>
                <p className="text-lg font-medium">{formatCurrency(totalCost)}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Buyer&apos;s Instant Savings</p>
              <p className="text-2xl font-bold text-green-400">+{formatCurrency(savings)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {discount}% discount locked for {lockPeriod} week{lockPeriod > 1 ? "s" : ""}
              </p>
            </div>

            {analysis && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Score</span>
                  <span className="font-medium">
                    {analysis.scores.overall.toFixed(1)}/10 - {analysis.recommendation.replace("_", " ")}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading || isAnalyzing || !tokenData || amountNum <= 0}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Creating Deal..." : "Create Deal"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CreateDealPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <CreateDealContent />
    </Suspense>
  );
}
