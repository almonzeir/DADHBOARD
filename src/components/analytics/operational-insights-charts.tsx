// src/components/analytics/operational-insights-charts.tsx
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import * as AnalyticsService from '@/services/analytics.service';
import {
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts';
import { Briefcase } from 'lucide-react';

export function OperationalInsightsCharts() {
    const [opsData, setOpsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AnalyticsService.getOperationalInsights().then(data => {
            setOpsData(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !opsData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
                        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
                        <div className="h-[250px] bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Header is handled in page.tsx or we can add it here if needed, but styling suggests it's a section wrapper */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PLOT 2: PLANNING HORIZON (Pie Chart) */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <h3 className="text-slate-400 text-sm mb-4">Planning Horizon (Lead Time)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={opsData.lead_time}
                                    dataKey="count"
                                    nameKey="category"
                                    cx="50%" cy="50%"
                                    outerRadius={80}
                                    innerRadius={40} // Donut style
                                    label
                                >
                                    {opsData.lead_time.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#10b981', '#f59e0b'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PLOT 3: DISTRICT ECONOMY (Bar Chart) */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <h3 className="text-slate-400 text-sm mb-4">District Economy (Total Revenue)</h3>
                    <div className="space-y-4">
                        {opsData.revenue.length > 0 ? (
                            opsData.revenue.map((item: any, i: number) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-slate-300 text-sm font-medium">{item.district}</span>
                                        <span className="text-emerald-400 font-bold text-sm">RM {item.total_revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-colors"
                                            style={{ width: '100%' }} // Normalized for visual simplicity as user requested
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-600 text-sm py-10">No revenue data yet.</p>
                        )}
                    </div>
                </div>

                {/* PLOT 4: BUDGET DISCIPLINE (Diverging Bar Chart) */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <h3 className="text-slate-400 text-sm mb-4">Budget Discipline (Deviation %)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={opsData.discipline} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="district" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    formatter={(value: number) => [`${value}%`, 'Deviation']}
                                />
                                <ReferenceLine x={0} stroke="#475569" />
                                <Bar dataKey="deviation_percent" barSize={20} radius={[0, 4, 4, 0]}>
                                    {opsData.discipline.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.deviation_percent > 0 ? '#ef4444' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Overspent</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Saved</span>
                    </div>
                </div>

                {/* PLOT 5: WEEKEND WARRIOR (Traffic by Day) */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <h3 className="text-slate-400 text-sm mb-4">Traffic Patterns (Day of Week)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={opsData.traffic}>
                                <XAxis dataKey="day_name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {opsData.traffic.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['Sat', 'Sun'].includes(entry.day_name) ? '#8b5cf6' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-2">Purple = Weekend • Blue = Weekday</p>
                </div>

            </div>
        </div>
    );
}
