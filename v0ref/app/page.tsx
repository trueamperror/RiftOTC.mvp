"use client"

import { useState } from "react"
import { CyberHeader } from "@/components/cyber-header"
import { MatrixBackground } from "@/components/matrix-background"
import { CyberCard } from "@/components/cyber-card"
import { StatsCard } from "@/components/stats-card"
import { DealCard } from "@/components/deal-card"
import { CyberInput } from "@/components/cyber-input"
import { CyberButton } from "@/components/cyber-button"
import { LockPeriodSelector } from "@/components/lock-period-selector"
import { DiscountSlider } from "@/components/discount-slider"
import { TabNavigation } from "@/components/tab-navigation"
import { RiftLogo } from "@/components/rift-logo"
import { TerminalText } from "@/components/terminal-text"
import { Zap, Activity, CheckCircle, Plus, Terminal, RefreshCcw, ArrowRight, Shield, Cpu, Globe } from "lucide-react"

export default function RiftOTC() {
  const [activeTab, setActiveTab] = useState("open")
  const [lockPeriod, setLockPeriod] = useState("4w")
  const [discount, setDiscount] = useState(15)
  const [activeSection, setActiveSection] = useState<"dashboard" | "analyzer" | "create">("dashboard")

  const lockPeriodOptions = [
    { label: "1 Week", value: "1w", description: "Lower risk, lower discount", riskLevel: "low" as const },
    { label: "4 Weeks", value: "4w", description: "Balanced risk/reward", riskLevel: "medium" as const },
    { label: "8 Weeks", value: "8w", description: "Higher discount, more exposure", riskLevel: "high" as const },
  ]

  const tabs = [
    { label: "Open", value: "open", count: 3 },
    { label: "Active", value: "active", count: 0 },
    { label: "Completed", value: "completed", count: 0 },
    { label: "All", value: "all" },
  ]

  const deals = [
    {
      token: "AAVE",
      symbol: "A",
      amount: "500 tokens",
      discount: 10,
      totalCost: "$18,500",
      marketValue: "$17,000",
      status: "open" as const,
      lockPeriod: "4 weeks",
    },
    {
      token: "ARB",
      symbol: "A",
      amount: "50.0K tokens",
      discount: 22,
      totalCost: "$32,000",
      marketValue: "$40,000",
      status: "open" as const,
      lockPeriod: "8 weeks",
    },
    {
      token: "UNI",
      symbol: "U",
      amount: "10.0K tokens",
      discount: 15,
      totalCost: "$88,000",
      marketValue: "$57,850",
      status: "open" as const,
      lockPeriod: "4 weeks",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Matrix rain background */}
      <MatrixBackground />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header */}
      <CyberHeader />

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section id="dashboard" className="mb-12">
          <div className="text-center mb-12">
            {/* Animated logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <RiftLogo size="xl" animated />
                <div className="absolute inset-0 rounded-full bg-[#0066FF] blur-3xl opacity-20 animate-pulse scale-150" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-mono">
              <span className="text-foreground">AI-Powered</span>{" "}
              <span className="text-primary neon-text">OTC Trading</span>
            </h1>
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
              <TerminalText
                text="Get discounted tokens with AI-analyzed deals. Short-term locks, instant savings."
                speed={20}
              />
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard label="Open Deals" value="3" subtext="Available for purchase" icon={Zap} glowColor="cyan" />
            <StatsCard label="Active Deals" value="0" subtext="Currently locked" icon={Activity} glowColor="blue" />
            <StatsCard label="Completed" value="0" subtext="Successfully closed" icon={CheckCircle} glowColor="green" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <CyberButton
              variant="primary"
              size="lg"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setActiveSection("create")}
            >
              + Create New Deal
            </CyberButton>
            <CyberButton
              variant="outline"
              size="lg"
              icon={<Terminal className="w-4 h-4" />}
              onClick={() => setActiveSection("analyzer")}
            >
              Open AI Analyzer
            </CyberButton>
          </div>

          {/* Deals list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <CyberButton variant="ghost" size="sm" icon={<RefreshCcw className="w-4 h-4" />}>
                Refresh
              </CyberButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal, i) => (
                <DealCard key={i} {...deal} />
              ))}
            </div>
          </div>
        </section>

        {/* AI Analyzer Section */}
        <section id="analyzer" className="mb-12">
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
              <h2 className="text-2xl md:text-3xl font-bold font-mono mb-2">
                AI Token <span className="text-primary">Analyzer</span>
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Get AI-powered analysis for short-term OTC deal opportunities
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              <CyberInput label="Token" placeholder="Search for a token (e.g., Uniswap, Arbitrum)..." icon />

              <LockPeriodSelector options={lockPeriodOptions} selected={lockPeriod} onChange={setLockPeriod} />

              <CyberButton variant="primary" className="w-full" size="lg">
                <Cpu className="w-4 h-4" />
                Analyze Token
                <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </div>
          </CyberCard>
        </section>

        {/* Create Deal Section */}
        <section id="create" className="mb-12">
          <CyberCard
            glowColor="cyan"
            header={
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">CREATE_OTC_DEAL</span>
              </div>
            }
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-mono mb-2">
                Create <span className="text-primary">OTC Deal</span>
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Sell your tokens at a discount for immediate liquidity
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              <CyberInput label="Token to Sell" placeholder="Search for a token..." icon />

              <CyberInput label="Amount of Tokens" type="number" placeholder="1000" />

              <LockPeriodSelector options={lockPeriodOptions} selected={lockPeriod} onChange={setLockPeriod} />

              <DiscountSlider value={discount} onChange={setDiscount} />

              <CyberButton variant="primary" className="w-full" size="lg">
                <Shield className="w-4 h-4" />
                Create Deal
                <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </div>
          </CyberCard>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RiftLogo size="sm" />
              <span className="font-mono text-sm text-muted-foreground">RIFT_OTC © 2025 | DARKNET PROTOCOL</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                MAINNET
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-neon-green" />
                SECURE
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-primary" />
                ONLINE
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
