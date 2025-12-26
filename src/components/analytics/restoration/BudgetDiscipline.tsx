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
    ReferenceLine,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scale } from 'lucide-react';

interface BudgetDisciplineProps {
    data: {
        district: string;
        deviation_percent: number;
    }[];
}

const BudgetDiscipline = React.memo(({ data }: BudgetDisciplineProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const BC: any = BarChart;
    const B: any = Bar;
    const XA: any = XAxis;
    const YA: any = YAxis;
    const CG: any = CartesianGrid;
    const TT: any = Tooltip;
    const RL: any = ReferenceLine;
    const C: any = Cell;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-teal-400 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Budget Discipline
                </CardTitle>
                <CardDescription className="text-slate-400">Price Shock vs Savings (%)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <BC
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CG strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.2} />
                            <XA type="number" hide />
                            <YA
                                type="category"
                                dataKey="district"
                                width={100}
                                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <TT
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Deviation']}
                            />
                            <RL x={0} stroke="#64748b" />
                            <B dataKey="deviation_percent" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <C key={`cell-${index}`} fill={entry.deviation_percent > 0 ? '#ef4444' : '#10b981'} />
                                ))}
                            </B>
                        </BC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

BudgetDiscipline.displayName = 'BudgetDiscipline';
export { BudgetDiscipline };
