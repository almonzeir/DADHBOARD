// @ts-nocheck
// src/components/charts/premium-bar-chart.tsx

'use client';

import { useMemo, useState } from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumBarChartProps {
    title: string;
    description?: string;
    data: any[];
    dataKey: string;
    xAxisKey: string;
    isLoading?: boolean;
    showGradient?: boolean;
    height?: number;
    layout?: 'vertical' | 'horizontal';
}

const COLORS = [
    { main: 'hsl(142, 76%, 45%)', light: 'hsl(142, 76%, 60%)' },
    { main: 'hsl(160, 84%, 39%)', light: 'hsl(160, 84%, 54%)' },
    { main: 'hsl(82, 84%, 45%)', light: 'hsl(82, 84%, 60%)' },
    { main: 'hsl(43, 74%, 49%)', light: 'hsl(43, 74%, 64%)' },
    { main: 'hsl(27, 87%, 54%)', light: 'hsl(27, 87%, 69%)' },
    { main: 'hsl(187, 85%, 43%)', light: 'hsl(187, 85%, 58%)' },
    { main: 'hsl(262, 83%, 58%)', light: 'hsl(262, 83%, 73%)' },
    { main: 'hsl(330, 81%, 60%)', light: 'hsl(330, 81%, 75%)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl px-4 py-3 shadow-xl">
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: payload[0]?.payload?.fill }}
                    />
                    <span className="text-sm text-muted-foreground">Count:</span>
                    <span className="text-sm font-bold text-foreground">
                        {payload[0]?.value?.toLocaleString()}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function PremiumBarChart({
    title,
    description,
    data,
    dataKey,
    xAxisKey,
    isLoading = false,
    showGradient = true,
    height = 300,
    layout = 'horizontal',
}: PremiumBarChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Get max value for percentage calculation
    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 0;
        return Math.max(...data.map(item => item[dataKey] || 0));
    }, [data, dataKey]);

    if (isLoading) {
        return (
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-32 shimmer-enhanced" />
                    <Skeleton className="h-4 w-48 shimmer-enhanced" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full shimmer-enhanced rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className="glass-card glass-card-hover overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    {description && (
                        <CardDescription className="mt-0.5">{description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="pt-2">
                    <div style={{ height: `${height}px` }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                                data={data}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
                            >
                                <defs>
                                    {COLORS.map((color, i) => (
                                        <linearGradient key={i} id={`barGradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={color.light} stopOpacity={1} />
                                            <stop offset="100%" stopColor={color.main} stopOpacity={1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey={xAxisKey}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    angle={data.length > 6 ? -45 : 0}
                                    textAnchor={data.length > 6 ? "end" : "middle"}
                                    height={data.length > 6 ? 80 : 40}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                                <Bar
                                    dataKey={dataKey}
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={showGradient
                                                ? `url(#barGradient-${index % COLORS.length})`
                                                : COLORS[index % COLORS.length].main
                                            }
                                            style={{
                                                filter: activeIndex === index ? 'brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none',
                                                transition: 'filter 0.2s ease',
                                            }}
                                        />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    {data.length > 0 && data.length <= 10 && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all cursor-default",
                                        activeIndex === index
                                            ? "bg-accent scale-105"
                                            : "hover:bg-accent/50"
                                    )}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length].main }}
                                    />
                                    <span className="text-muted-foreground font-medium truncate max-w-[80px]">
                                        {item[xAxisKey]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
