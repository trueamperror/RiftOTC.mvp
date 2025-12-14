"use client"
import { Slider } from "@/components/ui/slider"

interface DiscountSliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
}

export function DiscountSlider({ value, onChange, min = 5, max = 40 }: DiscountSliderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Discount</label>
                <span className="text-2xl font-mono font-bold text-primary animate-pulse-glow">{value}%</span>
            </div>

            <div className="relative">
                <Slider
                    value={[value]}
                    onValueChange={([v]) => onChange(v)}
                    min={min}
                    max={max}
                    step={1}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-[0_0_10px_rgba(0,212,255,0.5)] [&_.relative]:bg-muted [&_[data-state]]:bg-gradient-to-r [&_[data-state]]:from-primary/50 [&_[data-state]]:to-primary"
                />
                <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
                    <span>{min}%</span>
                    <span>{max}%</span>
                </div>
            </div>
        </div>
    )
}
