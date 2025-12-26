// @ts-nocheck
// src/components/charts/premium-area-chart.tsx

'use client';

import { useMemo } from 'react';
import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PremiumAreaChartProps {
    title: string;
    description?: string;
    data: any[];
    dataKey: string;
    xAxisKey: string;
    isLoading?: boolean;
    color?: string;
    showTrend?: boolean;
    height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl px-4 py-3 shadow-xl">
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: payload[0]?.stroke }}
                    />
                    <span className="text-sm text-muted-foreground">Value:</span>
                    <span className="text-sm font-bold text-foreground">
                        {payload[0]?.value?.toLocaleString()}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function PremiumAreaChart({
    title,
    description,
    data,
    dataKey,
    xAxisKey,
    isLoading = false,
    color = 'hsl(142, 76%, 45%)',
    showTrend = true,
    height = 300,
}: PremiumAreaChartProps) {
    // Calculate trend
    const trend = useMemo(() => {
        if (!data || data.length < 2) return null;
        const first = data[0]?.[dataKey] || 0;
        const last = data[data.length - 1]?.[dataKey] || 0;
        const change = first > 0 ? ((last - first) / first) * 100 : 0;
        return {
            value: change,
            isPositive: change >= 0,
        };
    }, [data, dataKey]);

    // Calculate average for reference line
    const average = useMemo(() => {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((acc, item) => acc + (item[dataKey] || 0), 0);
        return Math.round(sum / data.length);
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

    const gradientId = `gradient-${title.replace(/\s/g, '-')}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glass-card glass-card-hover overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                            {description && (
                                <CardDescription className="mt-0.5">{description}</CardDescription>
                            )}
                        </div>
                        {showTrend && trend && (
                            <div className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                                trend.isPositive
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                            )}>
                                {trend.isPositive ? (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div style={{ height: `${height}px` }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                        <stop offset="50%" stopColor={color} stopOpacity={0.15} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    vertical={false}
                                    horizontalCoordinatesGenerator={(props) => {
                                        const { height } = props;
                                        return [height * 0.25, height * 0.5, height * 0.75];
                                    }}
                                />
                                <XAxis
                                    dataKey={xAxisKey}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {average > 0 && (
                                    <ReferenceLine
                                        y={average}
                                        stroke="hsl(var(--muted-foreground))"
                                        strokeDasharray="5 5"
                                        strokeOpacity={0.5}
                                    />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={color}
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill={`url(#${gradientId})`}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </RechartsAreaChart>
                        </ResponsiveContainer>
                    </div>
                    {average > 0 && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Average: <span className="font-semibold">{average.toLocaleString()}</span>
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
