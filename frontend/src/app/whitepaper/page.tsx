"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, MousePointerClick, Shield, Brain, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WhitepaperPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 py-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <h1 className="text-5xl font-bold font-mono tracking-tighter">
                    <span className="text-primary">RIFT</span>_PROTOCOL // WHITEPAPER
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    AI-Powered Liquidity Infrastructure for the Illiquid Economy.
                </p>
            </div>

            {/* 1. The Problem & Solution */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="bg-destructive/5 border-destructive/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-destructive">!</div>
                    <CardHeader>
                        <CardTitle className="text-destructive font-mono">ERROR: LOW_LIQUIDITY</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Token holders are trapped. Selling large positions ("dumps") crashes the market price due to slippage.
                        </p>
                        <p className="text-muted-foreground">
                            Buyers want exposure to assets but fear volatility and entering at the "top".
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-primary">OK</div>
                    <CardHeader>
                        <CardTitle className="text-primary font-mono">SOLUTION: AI_OTC_ESCROW</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            A secure Over-The-Counter marketplace. Deals are analyzed by AI and secured by Smart Contracts.
                        </p>
                        <p className="text-muted-foreground">
                            Sellers get instant stablecoin liquidity without crashing charts. Buyers get discounted assets with a vesting lock.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Mechanics */}
            <div className="space-y-6">
                <h2 className="text-3xl font-bold font-mono text-center">SYSTEM_MECHANICS</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            step: "01",
                            title: "Smart Analysis",
                            desc: "AI Engine scans liquidity, volatility, and FDV. Calculates 'Risk Score' (0-10) and suggests a fair discount.",
                        },
                        {
                            step: "02",
                            title: "Secure Locking",
                            desc: "Tokens are locked in a Smart Contract. They are NOT sent immediately. Flexible terms: 1, 4, or 8 weeks.",
                        },
                        {
                            step: "03",
                            title: "Instant Settlement",
                            desc: "Sellers receive funds instantly. Buyers receive vested tokens. Upside captured if token performs post-lock.",
                        },
                    ].map((item) => (
                        <Card key={item.step} className="bg-card border-border hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="text-4xl font-bold text-primary/20 mb-2">{item.step}</div>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* 3. Roadmap - Premium Cyber Vertical Timeline */}
            <div className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple tracking-wider animate-pulse-glow">
                        PROTOCOL_ROADMAP
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        EXECUTION_PATH: <span className="text-primary">v1.0</span> &rarr; <span className="text-neon-purple">SINGULARITY</span>
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto pl-4 md:pl-0">
                    {/* Central Line (Desktop) / Left Line (Mobile) */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-neon-purple/50 to-transparent md:-translate-x-1/2 shadow-[0_0_10px_rgba(0,255,255,0.3)]"></div>

                    <div className="space-y-12">
                        {/* Phase 1 */}
                        <div className="relative md:flex items-center justify-between group">
                            {/* Date/Label Desktop Left */}
                            <div className="hidden md:block w-[45%] text-right pr-8 pt-2">
                                <h3 className="text-2xl font-bold font-mono text-primary">PHASE_1</h3>
                                <p className="text-sm text-muted-foreground font-mono">VALIDATION_LAYER // COMPLETED</p>
                            </div>

                            {/* Center Node */}
                            <div className="absolute left-[31px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 shadow-[0_0_15px_rgba(0,255,255,0.8)] group-hover:scale-125 transition-transform duration-300">
                                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                            </div>

                            {/* Content Card Right */}
                            <Card className="ml-16 md:ml-0 md:w-[45%] bg-card/20 backdrop-blur-md border border-primary/20 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-bold font-mono text-primary">01</div>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent" />
                                <CardHeader className="pb-2">
                                    <div className="md:hidden">
                                        <h3 className="text-xl font-bold text-primary">PHASE_1</h3>
                                        <Badge variant="outline" className="border-primary text-primary text-[10px] font-mono mb-2">VALIDATION</Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-primary" />
                                        Protocol Foundation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground font-mono">
                                        <li className="flex items-center gap-2"><span className="text-primary">✓</span> OTC Deal Engine</li>
                                        <li className="flex items-center gap-2"><span className="text-primary">✓</span> AI Risk Scoring V1</li>
                                        <li className="flex items-center gap-2"><span className="text-primary">✓</span> Simulated Escrow</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Phase 2 (Right aligned on Desktop logic flipped for visual balance) -> Actually let's alternate sides */}
                        <div className="relative md:flex items-center justify-between flex-row-reverse group">
                            {/* Date/Label Desktop Right */}
                            <div className="hidden md:block w-[45%] text-left pl-8 pt-2">
                                <h3 className="text-2xl font-bold font-mono text-neon-cyan">PHASE_2</h3>
                                <p className="text-sm text-neon-cyan/70 font-mono">Q1 2026 // SECURITY_LAYER</p>
                            </div>

                            {/* Center Node */}
                            <div className="absolute left-[31px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-neon-cyan z-10 shadow-[0_0_15px_rgba(0,255,255,0.6)] group-hover:scale-125 transition-transform duration-300"></div>

                            {/* Content Card Left */}
                            <Card className="ml-16 md:ml-0 md:w-[45%] bg-card/20 backdrop-blur-md border border-neon-cyan/20 hover:border-neon-cyan/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-bold font-mono text-neon-cyan">02</div>
                                {/* Note: Border left on desktop left side, border right on mobile? simplify: just left border consistent */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan to-transparent" />

                                <CardHeader className="pb-2">
                                    <div className="md:hidden">
                                        <h3 className="text-xl font-bold text-neon-cyan">PHASE_2</h3>
                                        <Badge variant="outline" className="border-neon-cyan text-neon-cyan text-[10px] font-mono mb-2">ALPHA</Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                        <Shield className="w-5 h-5 text-neon-cyan" />
                                        Security & Integration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground font-mono">
                                        <li className="flex items-center gap-2"><span className="text-neon-cyan">Waitlist</span> On-Chain Contracts</li>
                                        <li className="flex items-center gap-2"><span className="text-neon-cyan">Waitlist</span> WalletConnect Support</li>
                                        <li className="flex items-center gap-2"><span className="text-neon-cyan">Planned</span> Security Audits</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Phase 3 */}
                        <div className="relative md:flex items-center justify-between group">
                            {/* Date/Label Desktop Left */}
                            <div className="hidden md:block w-[45%] text-right pr-8 pt-2">
                                <h3 className="text-2xl font-bold font-mono text-neon-green">PHASE_3</h3>
                                <p className="text-sm text-neon-green/70 font-mono">Q2 2026 // DATA_EXPANSION</p>
                            </div>

                            {/* Center Node */}
                            <div className="absolute left-[31px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-neon-green z-10 shadow-[0_0_15px_rgba(50,255,50,0.6)] group-hover:scale-125 transition-transform duration-300"></div>

                            {/* Content Card Right */}
                            <Card className="ml-16 md:ml-0 md:w-[45%] bg-card/20 backdrop-blur-md border border-neon-green/20 hover:border-neon-green/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(50,255,50,0.1)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-bold font-mono text-neon-green">03</div>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-green to-transparent" />
                                <CardHeader className="pb-2">
                                    <div className="md:hidden">
                                        <h3 className="text-xl font-bold text-neon-green">PHASE_3</h3>
                                        <Badge variant="outline" className="border-neon-green text-neon-green text-[10px] font-mono mb-2">BETA</Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                        <Activity className="w-5 h-5 text-neon-green" />
                                        Advanced Intelligence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground font-mono">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-neon-green rounded-full" /> Sentiment AI (X/Reddit)</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-neon-green rounded-full" /> Whale Watcher Alerts</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-neon-green rounded-full" /> Dynamic Pricing V2</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Phase 4 */}
                        <div className="relative md:flex items-center justify-between flex-row-reverse group">
                            {/* Date/Label Desktop Right */}
                            <div className="hidden md:block w-[45%] text-left pl-8 pt-2">
                                <h3 className="text-2xl font-bold font-mono text-neon-purple animate-pulse">PHASE_4</h3>
                                <p className="text-sm text-neon-purple/70 font-mono">Q3 2026 // AGENTIC_SWARM</p>
                            </div>

                            {/* Center Node */}
                            <div className="absolute left-[31px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-5 h-5 rounded-full bg-background border-2 border-neon-purple z-10 shadow-[0_0_20px_rgba(200,50,255,0.9)] animate-bounce"></div>

                            {/* Content Card Left */}
                            <Card className="ml-16 md:ml-0 md:w-[45%] bg-card/20 backdrop-blur-md border border-neon-purple/40 hover:border-neon-purple/80 transition-all duration-300 hover:shadow-[0_0_40px_rgba(200,50,255,0.15)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-bold font-mono text-neon-purple">04</div>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-purple to-transparent" />

                                <CardHeader className="pb-2">
                                    <div className="md:hidden">
                                        <h3 className="text-xl font-bold text-neon-purple">PHASE_4</h3>
                                        <Badge variant="outline" className="border-neon-purple text-neon-purple text-[10px] font-mono mb-2">SINGULARITY</Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                        <Brain className="w-5 h-5 text-neon-purple" />
                                        AI Singularity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-muted-foreground font-mono">
                                        <li className="flex items-start gap-2">
                                            <span className="text-neon-purple font-bold">::</span>
                                            <span><strong className="text-white">Agent Orchestration</strong><br />Swarm Intelligence distributing analysis load across nodes.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-neon-purple font-bold">::</span>
                                            <span><strong className="text-white">Deep Tech Analysis</strong><br />Cluster algos for candle/volume profile recognition.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-neon-purple font-bold">::</span>
                                            <span><strong className="text-white">Complex Data Parsing</strong><br />Aggregating CEX/DEX/OTC for unified "True Price".</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
            <div className="text-center pt-8">
                <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/deals/create">Initialize Protocol v1.0</Link>
                </Button>
            </div>
        </div>
    );
}
