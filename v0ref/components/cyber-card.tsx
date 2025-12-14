import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CyberCardProps {
  children: ReactNode
  className?: string
  glowColor?: "cyan" | "blue" | "green" | "red"
  header?: ReactNode
  variant?: "default" | "terminal" | "highlight"
}

export function CyberCard({ children, className, glowColor = "cyan", header, variant = "default" }: CyberCardProps) {
  const glowColors = {
    cyan: "shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]",
    blue: "shadow-[0_0_20px_rgba(0,100,255,0.15)] hover:shadow-[0_0_30px_rgba(0,100,255,0.25)]",
    green: "shadow-[0_0_20px_rgba(0,255,100,0.15)] hover:shadow-[0_0_30px_rgba(0,255,100,0.25)]",
    red: "shadow-[0_0_20px_rgba(255,50,50,0.15)] hover:shadow-[0_0_30px_rgba(255,50,50,0.25)]",
  }

  const borderColors = {
    cyan: "border-[#00d4ff]/30 hover:border-[#00d4ff]/50",
    blue: "border-[#0066ff]/30 hover:border-[#0066ff]/50",
    green: "border-[#00ff66]/30 hover:border-[#00ff66]/50",
    red: "border-[#ff3333]/30 hover:border-[#ff3333]/50",
  }

  return (
    <div
      className={cn(
        "relative bg-card border rounded-lg transition-all duration-300",
        glowColors[glowColor],
        borderColors[glowColor],
        variant === "terminal" && "font-mono",
        variant === "highlight" && "bg-card/80",
        className,
      )}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />

      {header && <div className="border-b border-border/50 px-4 py-2 bg-muted/30">{header}</div>}

      <div className="p-4 md:p-6">{children}</div>
    </div>
  )
}
