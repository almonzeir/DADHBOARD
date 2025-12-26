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
    Cell,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface GlobalReachProps {
    data: {
        country: string;
        visitors: number;
    }[];
}

const GlobalReach = React.memo(({ data }: GlobalReachProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const BC: any = BarChart;
    const B: any = Bar;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;
    const C: any = Cell;

    // Process data to highlight Malaysia vs Others
    const processedData = data.map(d => ({
        ...d,
        type: d.country === 'Malaysia' ? 'Domestic' : 'International',
        fill: d.country === 'Malaysia' ? '#3b82f6' : '#ec4899'
    })).slice(0, 8); // Top 8 only

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Global Reach
                </CardTitle>
                <CardDescription className="text-slate-400">Domestic vs International Visitors</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <BC
                            data={processedData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CG strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.2} />
                            <XA type="number" hide />
                            <YA
                                type="category"
                                dataKey="country"
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
                            <B dataKey="visitors" radius={[0, 4, 4, 0]} barSize={20}>
                                {processedData.map((entry, index) => (
                                    <C key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </B>
                        </BC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

GlobalReach.displayName = 'GlobalReach';
export { GlobalReach };
