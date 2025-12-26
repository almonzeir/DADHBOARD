// src/components/analytics/nationality-chart.tsx
// @ts-nocheck
'use client';

import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NationalityStats {
    country: string;
    visitors: number;
}

interface NationalityChartProps {
    data: NationalityStats[];
}

export function NationalityChart({ data }: NationalityChartProps) {
    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Visitor Nationality</CardTitle>
                <CardDescription>Breakdown by country (Global Reach)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="country"
                                    type="category"
                                    width={100}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="visitors" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.country === 'Malaysia' ? 'hsl(var(--primary))' : 'hsl(var(--chart-1))'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground text-sm">No nationality data available</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Domestic</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-1))]" />
                        <span>International</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
