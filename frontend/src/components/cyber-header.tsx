"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RiftLogo } from "./rift-logo"
import { cn } from "@/lib/utils"
import { Terminal, Activity, Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
    active?: boolean
}

export function CyberHeader() {
    const [currentTime, setCurrentTime] = useState("")
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }))
        }
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    const navItems: NavItem[] = [
        { label: "DASHBOARD", href: "/", icon: <Activity className="w-4 h-4" /> },
        { label: "AI_ANALYZER", href: "/analyze", icon: <Terminal className="w-4 h-4" /> },
        { label: "CREATE_DEAL", href: "/deals/create", icon: <Zap className="w-4 h-4" /> },
        { label: "WHITEPAPER", href: "/whitepaper", icon: <Terminal className="w-4 h-4" /> },
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            {/* Top status bar */}
            <div className="border-b border-border/30 bg-card/50">
                <div className="container mx-auto px-4 py-1 flex items-center justify-end text-xs font-mono">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="text-neon-cyan">{currentTime}</span>
                    </div>
                </div>
            </div>

            {/* Main navigation */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo and brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <RiftLogo size="md" animated />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-wider text-foreground group-hover:text-primary transition-colors">
                                RIFT<span className="text-primary">_</span>OTC
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all",
                                    "border border-transparent hover:border-primary/50",
                                    "hover:bg-primary/10 hover:text-primary",
                                    // Simple active check could be added here if we had pathname, 
                                    // but for now we remove the hardcoded 'active: true'
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                        {/* Demo mode indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded font-mono text-xs">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            <span className="text-neon-green">DEMO_MODE</span>
                        </div>

                        {/* Wallet address */}
                        <Button
                            variant="outline"
                            className="font-mono text-sm border-primary/50 hover:bg-primary/10 hover:text-primary bg-transparent"
                        >
                            <span className="hidden sm:inline">0x71C...9A21</span>
                            <span className="sm:hidden">WALLET</span>
                        </Button>

                        {/* Mobile menu button */}
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 font-mono text-sm transition-all",
                                    "border border-transparent hover:border-primary/50",
                                    "hover:bg-primary/10 hover:text-primary",
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    )
}
