'use client';

import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface HeatmapProps {
    data: {
        day: string;
        hour: number;
        intensity: number;
    }[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TrafficHeatmap = React.memo(({ data }: HeatmapProps) => {
    // Transform data for Scatter Chart
    // X = Day (mapped to index), Y = Hour, Z = Intensity
    const processedData = data.map(item => ({
        ...item,
        dayIndex: DAYS.indexOf(item.day),
        // Enhance intensity for visualization size
        size: item.intensity * 20
    }));

    // Cast components to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const SC: any = ScatterChart;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const ZA: any = ZAxis;
    const TT: any = Tooltip;
    const S: any = Scatter;
    const C: any = Cell;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Traffic Heatmap
                </CardTitle>
                <CardDescription className="text-slate-400">Peak server load times (Day x Hour)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <SC margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XA
                                type="category"
                                dataKey="day"
                                name="Day"
                                allowDuplicatedCategory={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YA
                                type="number"
                                dataKey="hour"
                                name="Hour"
                                domain={[0, 24]}
                                tickCount={6}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                unit="h"
                            />
                            <ZA type="number" dataKey="size" range={[50, 400]} />
                            <TT
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                formatter={(value: any, name: any, props: any) => {
                                    if (name === 'size') return [];
                                    return [value, name];
                                }}
                            />
                            <S name="Traffic" data={processedData} fill="#3b82f6">
                                {processedData.map((entry, index) => (
                                    <C key={`cell-${index}`} fill={`rgba(59, 130, 246, ${Math.min(0.4 + (entry.intensity / 10), 1)})`} />
                                ))}
                            </S>
                        </SC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

TrafficHeatmap.displayName = 'TrafficHeatmap';
export { TrafficHeatmap };
