"use client"

import { cn } from "@/lib/utils"
import { Lock, Unlock, Shield } from "lucide-react"

interface LockPeriodOption {
  label: string
  value: string
  description: string
  riskLevel: "low" | "medium" | "high"
}

interface LockPeriodSelectorProps {
  options: LockPeriodOption[]
  selected: string
  onChange: (value: string) => void
}

export function LockPeriodSelector({ options, selected, onChange }: LockPeriodSelectorProps) {
  const riskColors = {
    low: "text-neon-green border-neon-green/30",
    medium: "text-primary border-primary/30",
    high: "text-yellow-500 border-yellow-500/30",
  }

  const riskIcons = {
    low: Unlock,
    medium: Lock,
    high: Shield,
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Lock Period</label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = riskIcons[option.riskLevel]
          const isSelected = selected === option.value

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative p-4 rounded border transition-all duration-200 text-left",
                "hover:bg-muted/50",
                isSelected
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                  : "bg-card border-border/50 hover:border-primary/30",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : riskColors[option.riskLevel])} />
                <span className={cn("font-mono font-bold", isSelected && "text-primary")}>{option.label}</span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">{option.description}</p>

              {isSelected && (
                <>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
