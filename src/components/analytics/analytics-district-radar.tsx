// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

interface DistrictStat {
    district_name: string;
    visit_count: number;
    total_revenue?: number;
}

interface Props {
    data: DistrictStat[];
}

export function AnalyticsDistrictRadar({ data }: Props) {
    const hasData = data && data.length > 0;

    return (
        <Card className="col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-cyan-500" />
                    District Performance
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Tourism distribution across Kedah</p>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                                <defs>
                                    <linearGradient id="districtGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <PolarGrid
                                    stroke="currentColor"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                    strokeDasharray="3 3"
                                />
                                <PolarAngleAxis
                                    dataKey="district_name"
                                    tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                                    className="fill-slate-600 dark:fill-slate-400"
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar
                                    name="Visits"
                                    dataKey="visit_count"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fill="url(#districtGradient)"
                                    className="dark:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--tooltip-border, #1e293b)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Globe className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No district data</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                Trips with district info will appear here
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

