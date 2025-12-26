// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

interface TripTrend {
    name: string;
    trips: number;
    tourists: number;
}

interface Props {
    data: TripTrend[];
}

export function AnalyticsTrendChart({ data }: Props) {
    const hasData = data && data.length > 0;

    return (
        <Card className="col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Traffic Overview
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Trips vs Tourists over time</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-0 pt-6 pr-6">
                <div className="h-[300px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    {/* Light mode gradients */}
                                    <linearGradient id="colorTripsLight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTouristsLight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    {/* Dark mode gradients (more vibrant) */}
                                    <linearGradient id="colorTripsDark" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTouristsDark" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    {/* Glow filter for dark mode */}
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="currentColor"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="currentColor"
                                    className="text-slate-500 dark:text-slate-500"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={15}
                                    fontWeight={500}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    className="text-slate-500 dark:text-slate-500"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--tooltip-border, #1e293b)',
                                        color: '#fff',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="trips"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTripsDark)"
                                    name="Trips Created"
                                    className="dark:filter dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tourists"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTouristsDark)"
                                    name="Active Tourists"
                                    className="dark:filter dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <TrendingUp className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No trend data available</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                Data will appear once trips are generated
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

