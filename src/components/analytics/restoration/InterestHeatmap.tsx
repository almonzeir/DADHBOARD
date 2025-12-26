'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface InterestHeatmapProps {
    data: {
        name: string;
        value: number;
    }[];
}

const InterestHeatmap = React.memo(({ data }: InterestHeatmapProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const BC: any = BarChart;
    const B: any = Bar;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;
    const C: any = Cell;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-rose-400 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Interest Heatmap
                </CardTitle>
                <CardDescription className="text-slate-400">What do they want?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <BC
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CG strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                            <XA type="number" hide />
                            <YA
                                type="category"
                                dataKey="name"
                                width={80}
                                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <TT
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <B dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <C key={`cell-${index}`} fillOpacity={0.6 + (index * 0.1)} />
                                ))}
                            </B>
                        </BC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

InterestHeatmap.displayName = 'InterestHeatmap';
export { InterestHeatmap };
