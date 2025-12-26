// @ts-nocheck
// src/components/analytics/PopularPlacesChart.tsx

'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PlaceData {
    place_name: string;
    visit_count: number;
    avg_rating: number;
}

interface PopularPlacesChartProps {
    data: PlaceData[];
}

export function PopularPlacesChart({ data }: PopularPlacesChartProps) {
    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
                <CardTitle>Popular Attractions</CardTitle>
                <CardDescription>Top destinations by popularity score</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="place_name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                width={90}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                }}
                            />
                            <Bar
                                dataKey="visit_count"
                                radius={[0, 8, 8, 0]}
                                barSize={24}
                                name="Popularity Score"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

