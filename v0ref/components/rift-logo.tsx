"use client"

import { cn } from "@/lib/utils"

interface RiftLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  className?: string
}

export function RiftLogo({ size = "md", animated = true, className }: RiftLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Glow effect behind logo */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-[#0066FF] blur-xl opacity-50",
          animated && "animate-pulse-glow",
        )}
      />
      {/* Logo image */}
      <img
        src="/images/image.png"
        alt="RIFT Portal"
        className={cn(
          "relative z-10 w-full h-full rounded-full",
          animated && "hover:scale-110 transition-transform duration-300",
        )}
      />
      {/* Outer ring glow */}
      <div
        className={cn("absolute inset-[-2px] rounded-full border border-[#00d4ff]/30", animated && "animate-pulse")}
      />
    </div>
  )
}
