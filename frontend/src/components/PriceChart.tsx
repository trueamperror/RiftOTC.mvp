"use client";

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriceChartProps {
    data: number[];
    symbol: string;
    className?: string;
}

export function PriceChart({ data, symbol, className }: PriceChartProps) {
    // Transform array of numbers into object array for Recharts
    // Assuming daily data points for the last year
    const chartData = data.map((price, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (data.length - 1 - index));
        return {
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            price: price,
        };
    });

    const startPrice = data[0];
    const endPrice = data[data.length - 1];
    const isPositive = endPrice >= startPrice;
    const color = isPositive ? "#10B981" : "#EF4444"; // emerald-500 or red-500

    return (
        <Card className={cn("bg-card border-border", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Price History (1Y)</CardTitle>
                    <div className={cn(
                        "text-sm font-bold px-2 py-0.5 rounded",
                        isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {isPositive ? "+" : ""}
                        {((endPrice - startPrice) / startPrice * 100).toFixed(2)}%
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full min-w-0">
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                hide
                            />
                            <YAxis
                                hide
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background border border-border p-2 rounded shadow-lg text-sm">
                                                <p className="text-muted-foreground">{label}</p>
                                                <p className="font-bold">
                                                    ${(payload[0].value as number).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 6
                                                    })}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={color}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
