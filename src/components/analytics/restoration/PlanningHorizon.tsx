'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';

interface PlanningHorizonProps {
    data: {
        category: string;
        count: number;
    }[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const PlanningHorizon = React.memo(({ data }: PlanningHorizonProps) => {
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
                <CardTitle className="text-orange-400 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Planning Horizon
                </CardTitle>
                <CardDescription className="text-slate-400">Lead Time</CardDescription>
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
                                paddingAngle={2}
                                dataKey="count"
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
                            <L verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                        </PC>
                    </RC>
                </div>
            </CardContent>
        </Card>
    );
});

PlanningHorizon.displayName = 'PlanningHorizon';
export { PlanningHorizon };
