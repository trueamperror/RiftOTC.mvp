import { cn } from "@/lib/utils"
import { CyberCard } from "./cyber-card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  glowColor?: "cyan" | "blue" | "green" | "red"
}

export function StatsCard({ label, value, subtext, icon: Icon, trend, glowColor = "cyan" }: StatsCardProps) {
  return (
    <CyberCard glowColor={glowColor} className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 212, 255, 0.1) 2px,
            rgba(0, 212, 255, 0.1) 4px
          )`,
          }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
          {Icon && <Icon className="w-4 h-4 text-primary/60" />}
        </div>

        <div className="flex items-end gap-2">
          <span
            className={cn(
              "text-3xl md:text-4xl font-bold font-mono",
              trend === "up" && "text-neon-green",
              trend === "down" && "text-destructive",
              !trend && "text-primary",
            )}
          >
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-mono mb-1",
                trend === "up" && "text-neon-green",
                trend === "down" && "text-destructive",
              )}
            >
              {trend === "up" ? "▲" : "▼"}
            </span>
          )}
        </div>

        {subtext && <p className="text-xs font-mono text-muted-foreground mt-1">{subtext}</p>}
      </div>
    </CyberCard>
  )
}
