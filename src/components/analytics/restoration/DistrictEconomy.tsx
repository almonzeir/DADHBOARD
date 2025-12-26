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
import { Landmark } from 'lucide-react';

interface DistrictEconomyProps {
    data: {
        district: string;
        total_revenue: number;
    }[];
}

const DistrictEconomy = React.memo(({ data }: DistrictEconomyProps) => {
    // Cast components to any to bypass Recharts type compatibility issues
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
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    District Economy
                </CardTitle>
                <CardDescription className="text-slate-400">Revenue Share by District</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <BC data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CG strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XA
                                dataKey="district"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
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
                            <B dataKey="total_revenue" fill="#eab308" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <C key={`cell-${index}`} fillOpacity={0.8 - (index * 0.1)} />
                                ))}
                            </B>
                        </BC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

DistrictEconomy.displayName = 'DistrictEconomy';
export { DistrictEconomy };
