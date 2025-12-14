"use client";

import { useEffect, useState } from "react";
import { Loader2, Command, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CyberLoaderProps {
    text?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function CyberLoader({ text = "LOADING_MODULE...", size = "md", className }: CyberLoaderProps) {
    const [displayText, setDisplayText] = useState("");

    // Typer effect for the text
    useEffect(() => {
        let i = 0;
        setDisplayText("");
        const interval = setInterval(() => {
            setDisplayText((prev) => {
                if (i >= text.length) return prev;
                i++;
                return text.substring(0, i);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [text]);

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const textClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-xl"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 text-primary font-mono", className)}>
            <div className="relative">
                {/* Outer Ring */}
                <div className={cn("rounded-full border-2 border-primary/30 border-t-primary animate-spin", sizeClasses[size])} />

                {/* Inner Glitch Element */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Terminal className={cn("animate-pulse text-primary/70", size === "xl" ? "w-8 h-8" : "w-1/2 h-1/2")} />
                </div>

                {/* Glow Effect */}
                <div className={cn("absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow", sizeClasses[size])} />
            </div>

            {text && (
                <div className={cn("flex items-center gap-2", textClasses[size])}>
                    <span className="text-primary/70">{">"}</span>
                    <span className="neon-text tracking-widest">{displayText}</span>
                    <span className="animate-pulse">_</span>
                </div>
            )}
        </div>
    );
}
