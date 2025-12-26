// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InterestCategory } from '@/types/analytics';

interface Props {
    data: InterestCategory[];
}

// Nature (Green), Culture (Orange), Shopping (Blue), Beach (Cyan), Other (Gray)
const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#06b6d4', '#94a3b8'];

export function AnalyticsInterestChart({ data }: Props) {
    const displayData = data?.length > 0 ? data : [{ name: 'No Data', value: 100 }];

    return (
        <Card className="col-span-2 border border-gray-100 shadow-[0_3px_12px_-5px_rgba(0,0,0,0.06)] bg-white dark:bg-card">
            <CardHeader className="pb-2 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Interest Categories
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium mt-1">What tourists are interested in</p>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {displayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

