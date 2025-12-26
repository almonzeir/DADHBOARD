// @ts-nocheck
// src/components/analytics/TrendChart.tsx

'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TrendData {
    month: string;
    trips: number;
    tourists: number;
}

interface TrendChartProps {
    data: TrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Trip Trends</CardTitle>
                <CardDescription>Monthly comparison of planned trips and total tourists</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTourists" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                            <Area
                                type="monotone"
                                dataKey="trips"
                                name="Total Trips"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTrips)"
                            />
                            <Area
                                type="monotone"
                                dataKey="tourists"
                                name="Total Tourists"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTourists)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

