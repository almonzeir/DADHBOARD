'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface QualityTrendProps {
    data: {
        date: string;
        rating: number;
    }[];
}

const QualityTrend = React.memo(({ data }: QualityTrendProps) => {
    // Cast components to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const LC: any = LineChart;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;
    const L: any = Line;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10 h-full">
            <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Quality Trend
                </CardTitle>
                <CardDescription className="text-slate-400">Avg. Rating over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <LC data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CG strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XA
                                dataKey="date"
                                hide={true}
                            />
                            <YA
                                domain={[0, 5]}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
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
                                cursor={{ stroke: '#fff', strokeDasharray: '5 5' }}
                            />
                            <L
                                type="step"
                                dataKey="rating"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ fill: '#f59e0b', r: 4 }}
                                activeDot={{ r: 6, stroke: '#fff' }}
                            />
                        </LC>
                    </RC>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        Are our AI recommendations improving?
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

QualityTrend.displayName = 'QualityTrend';
export { QualityTrend };
