// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain } from 'lucide-react';
import type { Interest } from '@/services/analytics.service';

interface Props {
    data: Interest[];
}

export function PsychographicsRadar({ data }: Props) {
    const hasData = data && data.length > 0;

    return (
        <Card className="col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Tourist Interests
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Psychographic preference analysis</p>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[350px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                                <defs>
                                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <PolarGrid
                                    stroke="currentColor"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                    strokeDasharray="3 3"
                                />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                                    className="fill-slate-600 dark:fill-slate-400"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #0f172a)',
                                        borderColor: 'var(--tooltip-border, #1e293b)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: number) => [`${value} tourists`, 'Interest']}
                                />
                                <Radar
                                    name="Interests"
                                    dataKey="count"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#radarGradient)"
                                    className="dark:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Brain className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No Interest Data</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                Trips with interests will appear here
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

