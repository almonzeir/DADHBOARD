// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';
import type { Financials } from '@/services/analytics.service';

interface Props {
    data: Financials | null;
}

export function FinancialPerformanceChart({ data }: Props) {
    const hasData = data && (data.avg_planned > 0 || data.avg_actual > 0);

    const safeData = data || {
        avg_planned: 0,
        avg_actual: 0,
        deviation: 0,
        total_revenue_estimated: 0
    };

    const chartData = [
        { name: 'Average Trip', planned: safeData.avg_planned, actual: safeData.avg_actual }
    ];

    const isOverBudget = safeData.avg_actual > safeData.avg_planned;

    return (
        <Card className="col-span-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            Economic Impact
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Planned vs. Actual spending analysis</p>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div> Planned
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Actual
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {hasData ? (
                    <>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={chartData} barSize={40} barGap={8}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                            borderColor: 'var(--tooltip-border, #1e293b)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                        formatter={(value: number) => [`RM ${value.toLocaleString()}`, '']}
                                    />

                                    <Bar dataKey="planned" fill="currentColor" className="fill-slate-200 dark:fill-slate-700" radius={[0, 8, 8, 0]} name="Planned" />

                                    <Bar dataKey="actual" radius={[0, 8, 8, 0]} name="Actual">
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.actual > entry.planned ? '#f59e0b' : '#10b981'}
                                                className="dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-6 grid grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Planned</p>
                                </div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">RM {safeData.avg_planned.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Actual</p>
                                </div>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">RM {safeData.avg_actual.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    {isOverBudget ? (
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-blue-500" />
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Deviation</p>
                                </div>
                                <p className={`text-xl font-bold ${safeData.deviation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {safeData.deviation >= 0 ? '+' : ''}{safeData.deviation}%
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-purple-500" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Est. Revenue</p>
                                </div>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    RM {safeData.total_revenue_estimated.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center">
                        <DollarSign className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No Financial Data</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                            Trips with budget information will appear here
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

