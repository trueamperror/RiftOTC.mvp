"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TerminalTextProps {
    text: string
    className?: string
    speed?: number
    showCursor?: boolean
    onComplete?: () => void
}

export function TerminalText({ text, className, speed = 50, showCursor = true, onComplete }: TerminalTextProps) {
    const [displayText, setDisplayText] = useState("")
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1))
                index++
            } else {
                setIsComplete(true)
                clearInterval(interval)
                onComplete?.()
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed, onComplete])

    return (
        <span className={cn("font-mono", className)}>
            {displayText}
            {showCursor && (
                <span className={cn("inline-block w-2 h-4 bg-primary ml-0.5 align-middle", isComplete && "animate-pulse")} />
            )}
        </span>
    )
}
