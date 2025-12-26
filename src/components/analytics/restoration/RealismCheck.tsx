'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

interface RealismCheckProps {
    data: {
        status: string;
        count: number;
    }[];
}

const RealismCheck = React.memo(({ data }: RealismCheckProps) => {
    // Find absolute max for scaling bars
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-fuchsia-400 flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    Realism Check
                </CardTitle>
                <CardDescription className="text-slate-400">Budget Accuracy (Dream vs Reality)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300 font-medium">{item.status}</span>
                                <span className="text-slate-400">{item.count} users</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.status.includes('Shock') ? 'bg-rose-500' :
                                            item.status.includes('Safe') ? 'bg-emerald-500' :
                                                'bg-blue-500'
                                        }`}
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
});

RealismCheck.displayName = 'RealismCheck';
export { RealismCheck };
