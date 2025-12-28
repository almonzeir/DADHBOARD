// src/components/analytics/safe-insights-charts.tsx
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import * as AnalyticsService from '@/services/analytics.service';
import {
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Users, DollarSign, Heart } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

export function SafeInsightsCharts({ data: insights }: { data: any }) {
    if (!insights) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
                        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
                        <div className="h-[250px] bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* CHART 1: TRAVELER DNA (Donut) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Traveler Demographics</h3>
                </div>
                <div className="h-[250px] w-full">
                    {insights.traveler_dna?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={insights.traveler_dna}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {insights.traveler_dna.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-600 text-sm">No traveler data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CHART 2: VALUE MATRIX (Budget vs Rating Scatter) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-purple-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Does Money Buy Happiness?</h3>
                </div>
                <div className="h-[250px] w-full">
                    {insights.value_matrix?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Budget"
                                    unit=" RM"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Rating"
                                    domain={[0, 5]}
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Scatter name="Trips" data={insights.value_matrix} fill="#8884d8">
                                    {insights.value_matrix.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.y >= 4.5 ? '#10b981' : '#f59e0b'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-600 text-sm">No value matrix data available</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Higher dots = Happier travelers</p>
            </div>

            {/* CHART 3: INTEREST HEATMAP (Bar) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Top Interests</h3>
                </div>
                <div className="space-y-3 mt-4">
                    {insights.interest_map?.length > 0 ? (
                        insights.interest_map.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-300 text-sm truncate w-24">{item.name}</span>
                                <div className="flex items-center gap-2 flex-1 ml-3">
                                    <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((item.value / 7) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500 min-w-[24px] text-right">{item.value}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-600 text-sm text-center py-10">No interest data available</p>
                    )}
                </div>
            </div>

        </div>
    );
}
