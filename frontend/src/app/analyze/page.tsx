"use client";

import { useState } from "react";
import { CyberCard } from "@/components/cyber-card";
import { CyberButton } from "@/components/cyber-button";
import { MatrixBackground } from "@/components/matrix-background";
import { LockPeriodSelector } from "@/components/lock-period-selector";
import { TokenSearch } from "@/components/TokenSearch";
import { ScoreBreakdown } from "@/components/ScoreBar";
import { RiskBadge } from "@/components/RiskBadge";
import { analyzeToken } from "@/lib/api";
import { TokenAnalysis, TokenSearchResult } from "@/types";
import { cn } from "@/lib/utils";
import { PriceChart } from "@/components/PriceChart";
import { ChatInterface } from "@/components/ChatInterface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Terminal, Cpu, ArrowRight, Shield, Zap } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import NextImage from "next/image";

const lockPeriodOptions = [
  { label: "1 Week", value: "1", description: "Lower risk, lower discount", riskLevel: "low" as const },
  { label: "4 Weeks", value: "4", description: "Balanced risk/reward", riskLevel: "medium" as const },
  { label: "8 Weeks", value: "8", description: "Higher discount, more exposure", riskLevel: "high" as const },
];

function formatCurrency(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
}

export default function AnalyzePage() {
  const [selectedToken, setSelectedToken] = useState<TokenSearchResult | null>(null);
  const [lockPeriod, setLockPeriod] = useState<string>("4");
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedToken) return;

    setIsLoading(true);
    setError(null);
    setShowChat(false);
    try {
      const result = await analyzeToken(selectedToken.id, parseInt(lockPeriod));
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze token");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-foreground font-mono">
      <MatrixBackground />
      {/* Header is now in global layout */}


      <main className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Token Search Section */}
        <section className="max-w-2xl mx-auto">
          <CyberCard
            glowColor="blue"
            header={
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">AI_TOKEN_ANALYZER_v2.4</span>
              </div>
            }
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold font-mono mb-2">
                AI Token <span className="text-primary">Analyzer</span>
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                Get AI-powered analysis for short-term OTC deal opportunities
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Token</label>
                <div className="relative">
                  {/* Integrated TokenSearch with custom styling wrapper if needed, 
                        assuming TokenSearch renders an Input that we might want to style or replaces CyberInput 
                    */}
                  <TokenSearch
                    onSelect={(token) => {
                      setSelectedToken(token);
                      setAnalysis(null);
                    }}
                    placeholder="Search for a token (e.g., Uniswap, Arbitrum)..."
                  // passing class to match CyberInput style if TokenSearch uses standard Input
                  />
                </div>
                {selectedToken && (
                  <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                    <Zap className="w-3 h-3" />
                    Selected: {selectedToken.name} ({selectedToken.symbol.toUpperCase()})
                  </div>
                )}
              </div>

              <LockPeriodSelector
                options={lockPeriodOptions}
                selected={lockPeriod}
                onChange={setLockPeriod}
              />

              <CyberButton
                variant="primary"
                className="w-full min-h-[48px]"
                size="lg"
                onClick={handleAnalyze}
                loading={isLoading}
                disabled={!selectedToken}
              >
                <Cpu className="w-4 h-4" />
                Analyze Token
                <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </div>
          </CyberCard>
        </section>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto bg-destructive/10 border-destructive/50 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CyberCard glowColor="cyan" className="overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    {analysis.image && (
                      <NextImage
                        src={analysis.image}
                        alt={analysis.token_name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    {!analysis.image && (
                      <span className="font-bold text-2xl text-primary">
                        {analysis.token_symbol.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-mono">
                      {analysis.token_name}
                      <span className="text-primary ml-2 text-xl">
                        {analysis.token_symbol.toUpperCase()}
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-mono text-muted-foreground mt-1">
                      <span className="text-foreground font-bold text-base">
                        ${analysis.current_price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </span>
                      {analysis.market_cap && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          MC: {formatCurrency(analysis.market_cap)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <RiskBadge
                  recommendation={analysis.recommendation}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Breakdown */}
                <div>
                  <h3 className="font-mono font-semibold mb-4 text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Score Breakdown
                  </h3>
                  <div className="bg-background/30 rounded-lg p-4 border border-border/50">
                    <ScoreBreakdown scores={analysis.scores} />
                  </div>
                </div>



                {/* Overall Score & Chat Access */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />
                    <div className="text-sm font-mono text-muted-foreground mb-2 uppercase tracking-widest">
                      AI Confidence Score
                    </div>
                    <div className="text-5xl font-bold text-primary font-mono tabular-nums">
                      {analysis.scores.overall.toFixed(1)}
                      <span className="text-xl text-primary/50">/10</span>
                    </div>
                  </div>

                  {/* Quick Chat Access Button */}
                  <CyberButton
                    variant="secondary"
                    className="w-full min-h-[48px]"
                    icon={<Terminal className="w-4 h-4" />}
                    onClick={() => {
                      setShowChat(true);
                      // Optional: scroll to chat if it wasn't visible
                      setTimeout(() => {
                        const chatSection = document.getElementById('chat-interface-section');
                        chatSection?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    Ask AI Assistant
                  </CyberButton>
                </div>
              </div>

              {/* Price Chart */}
              {analysis.price_history_1y && analysis.price_history_1y.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border/50">
                  <h3 className="font-mono font-semibold mb-4 text-primary flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Price History (1Y)
                  </h3>
                  <div className="h-[300px] w-full bg-background/30 rounded-lg border border-border/50 p-4">
                    <PriceChart
                      data={analysis.price_history_1y}
                      symbol={analysis.token_symbol}
                    />
                  </div>
                </div>
              )}

              {/* Expected Returns */}
              <div className="mt-8">
                <h3 className="font-mono font-semibold mb-4 text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Expected Return ({lockPeriodOptions.find((p: any) => p.value === lockPeriod)?.label} lock)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Bear Case</div>
                    <div className="text-xl font-bold font-mono text-red-400">
                      {analysis.expected_return.low > 0 ? "+" : ""}
                      {analysis.expected_return.low.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-xs font-mono text-primary uppercase mb-1">Expected</div>
                    <div className="text-2xl font-bold font-mono text-primary animate-pulse-glow">
                      {analysis.expected_return.mid > 0 ? "+" : ""}
                      {analysis.expected_return.mid.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Bull Case</div>
                    <div className="text-xl font-bold font-mono text-green-400">
                      +{analysis.expected_return.high.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Risks */}
              {analysis.key_risks.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-mono font-semibold mb-4 text-destructive flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Detected Risks
                  </h3>
                  <div className="grid gap-2">
                    {analysis.key_risks.map((risk, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded bg-destructive/10 border border-destructive/20 text-sm font-mono"
                      >
                        <span className="text-destructive mt-0.5">⚠️</span>
                        <span className="text-destructive-foreground/90">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CyberCard>

            {/* Chat Interface Section */}
            <div id="chat-interface-section" className="flex justify-center">
              {!showChat ? (
                <CyberButton
                  variant="secondary"
                  size="lg"
                  icon={<Terminal className="w-4 h-4" />}
                  onClick={() => setShowChat(true)}
                >
                  Initialize AI Chat Interface
                </CyberButton>
              ) : (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CyberCard glowColor="blue" header={<div className="font-mono text-sm">AI_CHANNEL_SECURE</div>}>
                    <ChatInterface tokenContext={analysis} />
                  </CyberCard>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-8 pb-12">
              <CyberButton
                variant="outline"
                className="flex-1 min-h-[48px]"
                onClick={() => {
                  setSelectedToken(null);
                  setAnalysis(null);
                  setShowChat(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Analyze Different Token
              </CyberButton>
              <CyberButton
                className="flex-1 min-h-[48px]"
                variant="primary"
                icon={<Zap className="w-4 h-4" />}
              >
                <a href={`/deals/create?token=${analysis.token_id}&lock=${lockPeriod}`} className="w-full h-full flex items-center justify-center gap-2">
                  Proceed to Deal Creation
                </a>
              </CyberButton>
            </div>
          </div>
        )
        }
      </main >
    </div >
  );
}

// Helper components for icons not imported
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
