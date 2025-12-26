'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car } from 'lucide-react';

interface TrafficPatternsProps {
    data: {
        day_name: string;
        visits: number;
        day_num?: number;
    }[];
}

const TrafficPatterns = React.memo(({ data }: TrafficPatternsProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const BC: any = BarChart;
    const B: any = Bar;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Traffic Patterns
                </CardTitle>
                <CardDescription className="text-slate-400">Weekday vs Weekend</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <BC data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CG strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XA
                                dataKey="day_name"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YA hide />
                            <TT
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <B dataKey="visits" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                        </BC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

TrafficPatterns.displayName = 'TrafficPatterns';
export { TrafficPatterns };
