import { cn } from "@/lib/utils"
import { forwardRef, type InputHTMLAttributes } from "react"
import { Search } from "lucide-react"

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: boolean
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(({ className, label, icon, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {icon && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-input border border-border rounded",
            "font-mono text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
            "transition-all duration-200",
            icon && "pl-10",
            className,
          )}
          {...props}
        />
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/0 group-focus-within:border-primary/50 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/0 group-focus-within:border-primary/50 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/0 group-focus-within:border-primary/50 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/0 group-focus-within:border-primary/50 transition-colors" />
      </div>
    </div>
  )
})

CyberInput.displayName = "CyberInput"
