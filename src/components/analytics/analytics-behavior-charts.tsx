// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, Zap, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdvancedStats } from '@/services/analytics.service';

interface Props {
    budgetData: { tier: string; count: number }[];
    paceData: { pace_type: string; count: number }[];
    advancedStats?: AdvancedStats | null;
}

const BUDGET_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];
const SPENDING_COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#c084fc', '#e879f9'];

export function AnalyticsBehaviorCharts({ budgetData, paceData, advancedStats }: Props) {
    // Use advanced stats budget distribution if available
    const budgetChartData = advancedStats?.budget_distribution?.map(d => ({
        tier: d.category,
        count: d.count
    })) || budgetData;

    const spendingData = advancedStats?.spending_power || [];
    const intensity = advancedStats?.intensity;

    const hasBudgetData = budgetChartData && budgetChartData.length > 0;
    const hasSpendingData = spendingData && spendingData.length > 0;
    const hasIntensity = intensity && intensity.avg_completion > 0;

    return (
        <>
            {/* Chart 1: Budget Distribution (Donut) */}
            <Card className="col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-emerald-500" />
                        Wallet Share
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Budget distribution by tier</p>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="h-[280px] w-full">
                        {hasBudgetData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={budgetChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="count"
                                        nameKey="tier"
                                    >
                                        {budgetChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={BUDGET_COLORS[index % BUDGET_COLORS.length]}
                                                strokeWidth={0}
                                                className="dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid var(--tooltip-border, #1e293b)',
                                            backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                            color: '#fff'
                                        }}
                                        formatter={(value: number, name: string) => [`${value} trips`, name]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        layout="horizontal"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '16px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Wallet className="h-14 w-14 text-slate-300 dark:text-slate-700 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No budget data</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Run the SQL to populate</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chart 2: VIP Traveler Spending (Bar) */}
            <Card className="col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                VIP Traveler
                            </CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Spending power by traveler type</p>
                        </div>

                        {/* Intensity Gauge */}
                        {hasIntensity && (
                            <div className="text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completion Rate</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        intensity.avg_completion >= 70 ? "text-emerald-500" :
                                            intensity.avg_completion >= 40 ? "text-amber-500" :
                                                "text-rose-500"
                                    )}>
                                        {intensity.avg_completion}%
                                    </div>
                                    <Zap className={cn(
                                        "h-5 w-5",
                                        intensity.avg_completion >= 70 ? "text-emerald-500" :
                                            intensity.avg_completion >= 40 ? "text-amber-500" :
                                                "text-rose-500"
                                    )} />
                                </div>
                                {intensity.avg_completion < 50 && (
                                    <p className="text-xs text-amber-500 mt-1">⚠️ Trips too packed!</p>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="h-[280px] w-full">
                        {hasSpendingData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spendingData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                    <XAxis
                                        type="number"
                                        tickFormatter={(v) => `RM ${v}`}
                                        stroke="currentColor"
                                        className="text-slate-500"
                                        fontSize={11}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="type"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 12, fontWeight: 600, fill: 'currentColor' }}
                                        axisLine={false}
                                        tickLine={false}
                                        className="fill-slate-600 dark:fill-slate-400"
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'currentColor', className: 'fill-slate-100 dark:fill-slate-800' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid var(--tooltip-border, #1e293b)',
                                            backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                            color: '#fff'
                                        }}
                                        formatter={(value: number) => [`RM ${value.toLocaleString()}`, 'Avg Spend']}
                                    />
                                    <Bar dataKey="avg_spend" radius={[0, 8, 8, 0]} barSize={28}>
                                        {spendingData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={SPENDING_COLORS[index % SPENDING_COLORS.length]}
                                                className="dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <TrendingUp className="h-14 w-14 text-slate-300 dark:text-slate-700 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No spending data</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Run the SQL to populate</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
