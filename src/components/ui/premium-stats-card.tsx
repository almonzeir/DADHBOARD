// @ts-nocheck
// src/components/ui/premium-stats-card.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
} from 'recharts';

interface PremiumStatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    changeValue?: number;
    icon: LucideIcon;
    iconColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    isLoading?: boolean;
    sparklineData?: number[];
    delay?: number;
}

// Generate mock sparkline data if not provided
const generateSparklineData = (trend: 'positive' | 'negative' | 'neutral' = 'positive') => {
    const points = 12;
    const data = [];
    let value = 50;

    for (let i = 0; i < points; i++) {
        const change = trend === 'positive'
            ? Math.random() * 20 - 5
            : trend === 'negative'
                ? Math.random() * 20 - 15
                : Math.random() * 10 - 5;
        value = Math.max(10, Math.min(100, value + change));
        data.push({ value });
    }
    return data;
};

export function PremiumStatsCard({
    title,
    value,
    change,
    changeType = 'neutral',
    changeValue,
    icon: Icon,
    iconColor = 'text-primary',
    gradientFrom = 'from-primary/20',
    gradientTo = 'to-primary/5',
    isLoading = false,
    sparklineData,
    delay = 0,
}: PremiumStatsCardProps) {
    const [displayValue, setDisplayValue] = useState<string | number>('0');
    const [isVisible, setIsVisible] = useState(false);

    // Animate number counting
    useEffect(() => {
        if (isLoading) return;

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, isLoading]);

    useEffect(() => {
        if (isLoading || !isVisible) return;

        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;

        if (isNaN(numValue)) {
            setDisplayValue(value);
            return;
        }

        const duration = 1000;
        const steps = 30;
        const stepValue = numValue / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(numValue, stepValue * step);

            if (typeof value === 'string' && value.includes('.')) {
                setDisplayValue(current.toFixed(1));
            } else if (typeof value === 'string' && value.includes(',')) {
                setDisplayValue(Math.round(current).toLocaleString());
            } else {
                setDisplayValue(Math.round(current));
            }

            if (step >= steps) {
                clearInterval(timer);
                setDisplayValue(value);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, isLoading, isVisible]);

    const sparkline = useMemo(() => {
        if (sparklineData) {
            return sparklineData.map(v => ({ value: v }));
        }
        return generateSparklineData(changeType);
    }, [sparklineData, changeType]);

    const gradientColor = changeType === 'positive'
        ? 'hsl(142, 76%, 45%)'
        : changeType === 'negative'
            ? 'hsl(0, 84%, 60%)'
            : 'hsl(215, 16%, 47%)';

    if (isLoading) {
        return (
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 shimmer-enhanced" />
                        <Skeleton className="h-12 w-12 rounded-2xl shimmer-enhanced" />
                    </div>
                    <Skeleton className="h-9 w-24 mt-4 shimmer-enhanced" />
                    <Skeleton className="h-4 w-32 mt-2 shimmer-enhanced" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay / 1000,
                ease: [0.4, 0, 0.2, 1]
            }}
        >
            <Card className={cn(
                "glass-card glass-card-hover overflow-hidden relative group",
                "border-transparent hover:border-primary/20"
            )}>
                {/* Background Gradient Orb */}
                <div className={cn(
                    "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50 blur-3xl transition-all duration-500",
                    "bg-gradient-to-br",
                    gradientFrom,
                    gradientTo,
                    "group-hover:opacity-70 group-hover:scale-110"
                )} />

                {/* Sparkline Background */}
                <div className="absolute bottom-0 right-0 left-0 h-16 opacity-20 pointer-events-none overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`sparkGradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={gradientColor} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={gradientColor}
                                strokeWidth={1.5}
                                fill={`url(#sparkGradient-${title.replace(/\s/g, '')})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground tracking-wide">
                                {title}
                            </p>
                        </div>
                        <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-2xl",
                            "bg-gradient-to-br shadow-lg transition-all duration-300",
                            gradientFrom,
                            gradientTo,
                            "group-hover:scale-110 group-hover:shadow-xl",
                            "group-hover:shadow-primary/20"
                        )}>
                            <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", iconColor)} />
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        <AnimatePresence mode="wait">
                            <motion.h3
                                key={displayValue.toString()}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold tracking-tight"
                            >
                                {displayValue}
                            </motion.h3>
                        </AnimatePresence>

                        {change && (
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                                    changeType === 'positive' && "bg-green-500/10 text-green-600 dark:text-green-400",
                                    changeType === 'negative' && "bg-red-500/10 text-red-600 dark:text-red-400",
                                    changeType === 'neutral' && "bg-muted text-muted-foreground"
                                )}>
                                    {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                                    {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                                    {changeType === 'neutral' && <Minus className="h-3 w-3" />}
                                    {changeValue !== undefined ? `${changeValue >= 0 ? '+' : ''}${changeValue}%` : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {change}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
