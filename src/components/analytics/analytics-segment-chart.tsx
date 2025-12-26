// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { VisitorSegment } from '@/types/analytics';

interface Props {
    data: VisitorSegment[];
}

// Colors from your Figma (Green, Orange, Purple, Blue)
const COLORS = ['#22c55e', '#f97316', '#a855f7', '#3b82f6', '#eab308'];

export function AnalyticsSegmentChart({ data }: Props) {
    // Use real data if available, otherwise show placeholder to prevent empty chart
    const hasData = data && data.length > 0;
    const displayData = hasData ? data : [
        { name: 'No Data', value: 100 }
    ];

    return (
        <Card className="col-span-2 border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Visitor Segments</CardTitle>
                <p className="text-sm text-muted-foreground">Distribution by traveler type</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {displayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={hasData ? COLORS[index % COLORS.length] : '#e2e8f0'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

