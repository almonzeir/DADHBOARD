'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MomentumChartProps {
    data: {
        date: string;
        cumulative_revenue: number;
    }[];
}

const MomentumChart = React.memo(({ data }: MomentumChartProps) => {
    // Cast components to any to bypass Recharts type compatibility issues in this environment
    const RC: any = ResponsiveContainer;
    const AC: any = AreaChart;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const A: any = Area;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;

    if (!data || data.length === 0) {
        return (
            <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10 h-[350px] flex items-center justify-center">
                <p className="text-slate-400">No momentum data available</p>
            </Card>
        );
    }

    // Calculate growth percentage
    const start = data[0]?.cumulative_revenue || 0;
    const end = data[data.length - 1]?.cumulative_revenue || 0;
    const growth = start > 0 ? ((end - start) / start) * 100 : 0;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Growth Velocity
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Cumulative Revenue Trajectory
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white tracking-tight">
                            {growth.toFixed(1)}%
                        </div>
                        <div className="text-xs text-emerald-500 font-medium">
                            Growth Rate
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <AC data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CG strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XA
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YA
                                hide
                            />
                            <TT
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                itemStyle={{ color: '#10b981' }}
                                cursor={{ stroke: '#fff', strokeDasharray: '5 5', strokeWidth: 1 }}
                                formatter={(value: any) => [formatCurrency(value as number), 'Revenue']}
                            />
                            <A
                                type="monotone"
                                dataKey="cumulative_revenue"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={1500}
                            />
                        </AC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

MomentumChart.displayName = 'MomentumChart';
export { MomentumChart };
