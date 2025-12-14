
import React from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export function Sparkline({
    data,
    width = 200,
    height = 50,
    color = "#10B981", // Default green
    className
}: SparklineProps) {

    if (!data || data.length === 0) {
        return <div className={`h-[${height}px] w-[${width}px] bg-muted/20 animate-pulse rounded ${className}`} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Normalize points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    // Determine color based on trend (first vs last)
    const isUp = data[data.length - 1] >= data[0];
    const finalColor = color === 'auto' ? (isUp ? '#10B981' : '#EF4444') : color;

    return (
        <svg width={width} height={height} className={className} overflow="visible">
            <polyline
                points={points}
                fill="none"
                stroke={finalColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
