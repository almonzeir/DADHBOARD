// src/components/analytics/user-stats-charts.tsx
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import * as AnalyticsService from '@/services/analytics.service';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Users, CheckCircle } from 'lucide-react';

export function UserStatsCharts() {
    const [userStats, setUserStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AnalyticsService.getUserStats().then(data => {
            setUserStats(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !userStats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[1, 2].map(i => (
                    <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
                        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
                        <div className="h-[200px] bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* CHART 1: AGE DEMOGRAPHICS */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-violet-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Traveler Age Groups</h3>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={userStats.ages}>
                            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART 2: COMPLETION RATE (Itinerary Success) */}
            <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-slate-300 text-sm font-semibold">Trip Completion Rate</h3>
                </div>
                <div className="space-y-4 pt-2">
                    {userStats.completion.length > 0 ? (
                        userStats.completion.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-300 text-sm">{item.status}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.status.includes('Perfect') ? 'bg-emerald-500' : item.status.includes('High') ? 'bg-blue-500' : 'bg-amber-500'}`}
                                            style={{ width: `${Math.min((item.count / 7) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono w-4 text-right">{item.count}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-600 text-sm py-10">No completion data available</div>
                    )}
                </div>
            </div>

        </div>
    );
}
