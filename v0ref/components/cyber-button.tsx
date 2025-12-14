import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  loading?: boolean
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", size = "md", icon, loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary",
      outline: "bg-transparent text-primary border-primary/50 hover:bg-primary/10 hover:border-primary",
      ghost: "bg-transparent text-foreground border-transparent hover:bg-muted hover:text-primary",
      danger: "bg-destructive/20 text-destructive border-destructive/50 hover:bg-destructive/30",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative font-mono font-medium border rounded",
          "transition-all duration-200 transform active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}

        {/* Scanline effect on hover */}
        <div className="absolute inset-0 overflow-hidden rounded pointer-events-none opacity-0 hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-full hover:translate-y-[-100%] transition-transform duration-500" />
        </div>
      </button>
    )
  },
)

CyberButton.displayName = "CyberButton"
