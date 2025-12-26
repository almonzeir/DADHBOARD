// @ts-nocheck
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    value: string | number;
    trend: string;
    positive?: boolean;
    icon?: LucideIcon;
    sparkData?: { v: number }[];
    gradientId?: string;
}

// Default trend data for the background
const defaultSparkData = [
    { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 24 }, { v: 22 }, { v: 30 }
];

export function SparklineCard({
    title,
    value,
    trend,
    positive = true,
    icon: Icon,
    sparkData = defaultSparkData,
    gradientId
}: Props) {
    const id = gradientId || `gradient-${title.replace(/\s/g, '-')}`;

    return (
        <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {value}
                            </h3>
                            <span className={cn(
                                "text-xs font-semibold px-2.5 py-1 rounded-full transition-all",
                                positive
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/20"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 dark:border dark:border-rose-500/20"
                            )}>
                                {trend}
                            </span>
                        </div>
                    </div>

                    {Icon && (
                        <div className={cn(
                            "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                            positive
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
                                : "bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25"
                        )}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                    )}
                </div>
            </CardContent>

            {/* The "Alive" Background Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-15 dark:opacity-25 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={positive ? "#10b981" : "#f43f5e"} stopOpacity={0.6} />
                                <stop offset="100%" stopColor={positive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={positive ? "#10b981" : "#f43f5e"}
                            strokeWidth={2}
                            fill={`url(#${id})`}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Glow effect on hover (dark mode only) */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                positive
                    ? "bg-gradient-to-t from-emerald-500/5 to-transparent"
                    : "bg-gradient-to-t from-rose-500/5 to-transparent"
            )} />
        </Card>
    );
}

