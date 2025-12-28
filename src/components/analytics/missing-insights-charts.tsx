// src/components/analytics/missing-insights-charts.tsx
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import * as AnalyticsService from '@/services/analytics.service';
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Target, Gauge, MapPin } from 'lucide-react';

export function MissingInsightsCharts({ data: extraStats }: { data: any }) {
    if (!extraStats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
                        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
                        <div className="h-[200px] bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const avgCompletion = extraStats.intensity?.avg_completion || 0;
    const totalSkipped = extraStats.intensity?.total_skipped || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* CHART A: PLANNING REALISM (Are users dreaming?) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="h-4 w-4 text-blue-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Budget Planning Realism</h3>
                </div>
                <div className="h-[200px] w-full">
                    {extraStats.realism?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={extraStats.realism} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="status"
                                    type="category"
                                    width={140}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    cursor={{ fill: '#334155' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {extraStats.realism.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.status?.includes('Shock') ? '#ef4444' : entry.status?.includes('Safe') ? '#10b981' : '#3b82f6'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-600 text-sm">No budget data available</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                    "Shock" means they spent way more than planned.
                </p>
            </div>

            {/* CHART B: INTENSITY (Burnout Meter) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-2 w-full">
                    <Gauge className="h-4 w-4 text-amber-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Itinerary Intensity</h3>
                </div>

                {/* The Gauge Visual */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="15" fill="transparent" />
                        <circle
                            cx="80" cy="80" r="70"
                            stroke={avgCompletion > 80 ? '#10b981' : '#f59e0b'}
                            strokeWidth="15"
                            fill="transparent"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * avgCompletion) / 100}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-white">{avgCompletion}%</span>
                        <span className="text-xs text-slate-400">Completion</span>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-300">
                        Total Skipped Places: <span className="text-red-400 font-bold">{totalSkipped}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {avgCompletion < 70
                            ? "⚠️ Users are skipping too much. Trips are too heavy."
                            : "✅ Optimal pacing."}
                    </p>
                </div>
            </div>

            {/* CHART C: GEOGRAPHY (Where are they going?) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Top Districts</h3>
                </div>
                <div className="space-y-3">
                    {extraStats.geography?.length > 0 ? (
                        extraStats.geography.map((item: any, i: number) => (
                            <div key={i} className="group">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300">{item.name}</span>
                                    <span className="text-emerald-400">{item.visits} visits</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full group-hover:from-emerald-400 group-hover:to-teal-400 transition-colors"
                                        style={{ width: `${Math.min((item.visits / 7) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-600 text-sm py-10">No district data linked.</div>
                    )}
                </div>
            </div>

        </div>
    );
}
