// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Props {
    activeTrips: number;
    completedTrips: number;
    totalTrips: number;
}

export function AnalyticsFunnelChart({ activeTrips, completedTrips, totalTrips }: Props) {
    // Approximate funnel based on trip statuses
    const data = [
        { name: 'App Usage', value: totalTrips * 1.5, fill: '#22c55e' }, // Estimate browsing
        { name: 'Trip Generated', value: totalTrips, fill: '#4ade80' },
        { name: 'Trip Started', value: activeTrips + completedTrips, fill: '#86efac' },
        { name: 'Completed', value: completedTrips, fill: '#bbf7d0' },
    ];

    return (
        <Card className="col-span-2 border border-gray-100 shadow-[0_3px_12px_-5px_rgba(0,0,0,0.06)] bg-white dark:bg-card">
            <CardHeader className="pb-2 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    User Journey Funnel
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium mt-1">From app usage to trip completion</p>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }}>
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

