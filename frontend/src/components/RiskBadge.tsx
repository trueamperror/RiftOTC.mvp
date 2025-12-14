"use client";

import { Badge } from "@/components/ui/badge";
import { Recommendation } from "@/types";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
    recommendation: Recommendation;
    size?: "sm" | "md" | "lg";
}

export function RiskBadge({
    recommendation,
    size = "md",
}: RiskBadgeProps) {
    const getColor = () => {
        switch (recommendation) {
            case "STRONG_BUY":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "BUY":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "HOLD":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "HIGH_RISK":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "EXTREME_RISK":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
                return "bg-secondary text-secondary-foreground";
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case "sm":
                return "text-xs px-2 py-0.5";
            case "lg":
                return "text-base px-4 py-1.5";
            default:
                return "text-sm px-3 py-1";
        }
    };

    return (
        <Badge
            variant="outline"
            className={cn("font-medium", getColor(), getSizeClass())}
        >
            {recommendation.replace("_", " ")}
        </Badge>
    );
}
