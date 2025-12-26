// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import { Sparkles } from 'lucide-react';

interface ScatterPoint {
    trip_title?: string;
    days: number;
    budget: number;
    segment?: string;
}

interface Props {
    data: ScatterPoint[];
}

export function AnalyticsScatterChart({ data }: Props) {
    const hasData = data && data.length > 0;

    return (
        <Card className="col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    Spending Power
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Duration vs Budget correlation</p>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="currentColor"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                />
                                <XAxis
                                    type="number"
                                    dataKey="days"
                                    name="Duration"
                                    unit=" days"
                                    stroke="currentColor"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    className="fill-slate-500"
                                >
                                    <Label
                                        value="Trip Duration (Days)"
                                        offset={-10}
                                        position="insideBottom"
                                        className="fill-slate-500"
                                        style={{ fontSize: 12 }}
                                    />
                                </XAxis>
                                <YAxis
                                    type="number"
                                    dataKey="budget"
                                    name="Budget"
                                    unit=" MYR"
                                    stroke="currentColor"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    className="fill-slate-500"
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--tooltip-border, #1e293b)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Scatter
                                    name="Trips"
                                    data={data}
                                    fill="#8884d8"
                                    shape="circle"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.segment === 'Family' ? '#f97316' :
                                                    entry.segment === 'Business' ? '#3b82f6' :
                                                        entry.segment === 'Couple' ? '#ec4899' :
                                                            '#22c55e'
                                            }
                                            className="dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Sparkles className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No spending data</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                Trips with budget info will appear here
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

