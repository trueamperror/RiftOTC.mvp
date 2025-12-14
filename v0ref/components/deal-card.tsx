import { cn } from "@/lib/utils"
import { CyberCard } from "./cyber-card"
import { Badge } from "@/components/ui/badge"
import { Zap, Lock, TrendingUp } from "lucide-react"

interface DealCardProps {
  token: string
  symbol: string
  amount: string
  discount: number
  totalCost: string
  marketValue: string
  status: "open" | "active" | "completed"
  lockPeriod?: string
}

export function DealCard({
  token,
  symbol,
  amount,
  discount,
  totalCost,
  marketValue,
  status,
  lockPeriod,
}: DealCardProps) {
  const statusColors = {
    open: "bg-neon-green/20 text-neon-green border-neon-green/50",
    active: "bg-neon-blue/20 text-neon-blue border-neon-blue/50",
    completed: "bg-muted text-muted-foreground border-muted",
  }

  return (
    <CyberCard
      glowColor={status === "open" ? "green" : status === "active" ? "blue" : "cyan"}
      className="group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Token avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-mono font-bold text-lg border border-primary/30">
              {symbol[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-primary/50 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>

          <div>
            <h3 className="font-mono font-bold text-lg group-hover:text-primary transition-colors">{token}</h3>
            <p className="text-xs font-mono text-muted-foreground">{amount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("font-mono text-xs", statusColors[status])}>
            {status.toUpperCase()}
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs bg-destructive/20 text-destructive border-destructive/50"
          >
            -{discount}%
          </Badge>
        </div>
      </div>

      {lockPeriod && (
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>LOCK: {lockPeriod}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Cost</p>
          <p className="font-mono font-bold text-foreground">{totalCost}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Market Value</p>
          <div className="flex items-center gap-1">
            <p className="font-mono font-bold text-neon-green">{marketValue}</p>
            <TrendingUp className="w-3 h-3 text-neon-green" />
          </div>
        </div>
      </div>

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </CyberCard>
  )
}
