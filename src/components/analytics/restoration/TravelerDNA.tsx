'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

interface TravelerDNAProps {
    data: { name: string; value: number }[];
}

const TravelerDNA = React.memo(({ data }: TravelerDNAProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const PC: any = PieChart;
    const P: any = Pie;
    const C: any = Cell;
    const TT: any = Tooltip;
    const L: any = Legend;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-violet-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Traveler DNA
                </CardTitle>
                <CardDescription className="text-slate-400">Who are they?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <RC width="100%" height="100%">
                        <PC>
                            <P
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <C key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </P>
                            <TT
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <L verticalAlign="bottom" height={36} iconType="circle" />
                        </PC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

TravelerDNA.displayName = 'TravelerDNA';
export { TravelerDNA };
