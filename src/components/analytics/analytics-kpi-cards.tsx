// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Map, DollarSign, Star, TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import type { DashboardKPIs } from '@/services/analytics.service';

interface Props {
    data: DashboardKPIs | null;
}

// Animation variants for staggered entrance
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

// Generate trend data for sparklines
const generateSparkData = (seed: number, trend: 'up' | 'down' | 'neutral') => {
    return Array.from({ length: 12 }, (_, i) => ({
        v: trend === 'up'
            ? 30 + seed + Math.sin(i * 0.8) * 15 + i * 3
            : trend === 'down'
                ? 60 + seed - i * 2 + Math.sin(i) * 10
                : 45 + seed + Math.sin(i * 1.2) * 12
    }));
};

export function AnalyticsKpiCards({ data }: Props) {
    const safeData = data || {
        tourists: 0,
        trips: 0,
        budget: 0,
        duration: 0,
        rating: 0,
        top_destination: 'No Data',
        top_visits: 0
    };

    const kpis = [
        {
            title: 'Active Tourists',
            value: (safeData.tourists || 0).toLocaleString(),
            icon: Users,
            trend: '+12.5%',
            positive: true,
            color: 'emerald',
            sparkData: generateSparkData(10, 'up'),
        },
        {
            title: 'Trips Generated',
            value: (safeData.trips || 0).toLocaleString(),
            icon: Map,
            trend: '+8.2%',
            positive: true,
            color: 'blue',
            sparkData: generateSparkData(15, 'up'),
        },
        {
            title: 'Avg Duration',
            value: `${Number(safeData.duration || 0).toFixed(1)} days`,
            icon: Clock,
            trend: '-0.3 days',
            positive: false,
            color: 'purple',
            sparkData: generateSparkData(20, 'down'),
        },
        {
            title: 'Top Destination',
            value: safeData.top_destination || 'No Data',
            subtext: `${(safeData.top_visits || 0).toLocaleString()} visits`,
            icon: MapPin,
            trend: 'Most Popular',
            positive: true,
            color: 'orange',
            sparkData: generateSparkData(5, 'up'),
        },
        {
            title: 'Avg Budget',
            value: formatCurrency(safeData.budget || 0),
            icon: DollarSign,
            trend: '+5.8%',
            positive: true,
            color: 'teal',
            sparkData: generateSparkData(8, 'up'),
        },
        {
            title: 'Overall Rating',
            value: safeData.rating > 0 ? `${Number(safeData.rating).toFixed(1)}/5` : '0/5',
            icon: Star,
            trend: safeData.rating >= 4 ? 'Excellent' : safeData.rating >= 3 ? 'Good' : 'Needs Data',
            positive: safeData.rating >= 3,
            color: 'amber',
            sparkData: generateSparkData(12, safeData.rating >= 4 ? 'up' : 'neutral'),
        },
    ];

    const colorMap: Record<string, { gradient: string; glow: string; stroke: string; text: string }> = {
        emerald: {
            gradient: 'from-emerald-500 to-teal-600',
            glow: 'shadow-emerald-500/25',
            stroke: '#10b981',
            text: 'text-emerald-400'
        },
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            glow: 'shadow-blue-500/25',
            stroke: '#3b82f6',
            text: 'text-blue-400'
        },
        purple: {
            gradient: 'from-purple-500 to-pink-600',
            glow: 'shadow-purple-500/25',
            stroke: '#a855f7',
            text: 'text-purple-400'
        },
        orange: {
            gradient: 'from-orange-500 to-red-500',
            glow: 'shadow-orange-500/25',
            stroke: '#f97316',
            text: 'text-orange-400'
        },
        teal: {
            gradient: 'from-teal-500 to-cyan-600',
            glow: 'shadow-teal-500/25',
            stroke: '#14b8a6',
            text: 'text-teal-400'
        },
        amber: {
            gradient: 'from-yellow-500 to-amber-600',
            glow: 'shadow-amber-500/25',
            stroke: '#f59e0b',
            text: 'text-amber-400'
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
            {kpis.map((kpi, index) => {
                const colors = colorMap[kpi.color];
                const Icon = kpi.icon;
                const gradientId = `spark-${kpi.color}-${index}`;

                return (
                    <motion.div key={index} variants={item}>
                        <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {kpi.title}
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                {kpi.value}
                                            </h3>
                                        </div>
                                        {kpi.subtext && (
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                {kpi.subtext}
                                            </p>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-lg",
                                        `bg-gradient-to-br ${colors.gradient} ${colors.glow}`
                                    )}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>

                                {/* Trend Badge */}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                                        kpi.positive
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
                                    )}>
                                        {kpi.positive ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {kpi.trend}
                                    </span>
                                </div>
                            </CardContent>

                            {/* Background Sparkline */}
                            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10 dark:opacity-20 pointer-events-none">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={kpi.sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.6} />
                                                <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="v"
                                            stroke={colors.stroke}
                                            strokeWidth={2}
                                            fill={`url(#${gradientId})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-slate-100/50 dark:from-slate-800/30 to-transparent" />
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

