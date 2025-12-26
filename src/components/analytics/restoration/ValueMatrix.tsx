'use client';

import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface ValueMatrixProps {
    data: {
        x: number; // Budget
        y: number; // Rating
        label: string;
    }[];
}

const ValueMatrix = React.memo(({ data }: ValueMatrixProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const SC: any = ScatterChart;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;
    const S: any = Scatter;
    const LL: any = LabelList;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Value Matrix
                </CardTitle>
                <CardDescription className="text-slate-400">Does Money Buy Happiness? (Budget vs Rating)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <SC margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CG strokeDasharray="3 3" opacity={0.2} />
                            <XA
                                type="number"
                                dataKey="x"
                                name="Budget"
                                unit="RM"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <YA
                                type="number"
                                dataKey="y"
                                name="Rating"
                                domain={[0, 5]}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <TT
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <S name="Trips" data={data} fill="#10b981">
                                <LL dataKey="label" position="top" style={{ fontSize: '10px', fill: '#64748b' }} />
                            </S>
                        </SC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

ValueMatrix.displayName = 'ValueMatrix';
export { ValueMatrix };
