"use client"

import { cn } from "@/lib/utils"

interface Tab {
    label: string
    value: string
    count?: number
}

interface TabNavigationProps {
    tabs: Tab[]
    activeTab: string
    onChange: (value: string) => void
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
    return (
        <div className="inline-flex items-center bg-muted/50 border border-border/50 rounded p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        "px-4 py-2 font-mono text-xs transition-all duration-200 rounded",
                        "flex items-center gap-2",
                        activeTab === tab.value
                            ? "bg-background text-primary shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded text-[10px]",
                                activeTab === tab.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                            )}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
