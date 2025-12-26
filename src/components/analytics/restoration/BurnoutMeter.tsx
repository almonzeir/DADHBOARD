'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BatteryWarning } from 'lucide-react';
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis
} from 'recharts';

interface BurnoutMeterProps {
    data: {
        avg_completion: number;
        total_skipped: number;
    };
}

const BurnoutMeter = React.memo(({ data }: BurnoutMeterProps) => {
    // Cast to any to bypass Recharts type compatibility issues
    const RC: any = ResponsiveContainer;
    const RBC: any = RadialBarChart;
    const RB: any = RadialBar;
    const PAA: any = PolarAngleAxis;


    // Determine burnout level
    const completion = data.avg_completion || 0;
    const isBurnout = completion < 60;
    const color = isBurnout ? '#ef4444' : '#10b981';

    const chartData = [
        { name: 'Completion', value: completion, fill: color }
    ];

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10">
            <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                    <BatteryWarning className="h-4 w-4" />
                    Burnout Meter
                </CardTitle>
                <CardDescription className="text-slate-400">Itinerary Intensity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                <div className="h-[200px] w-full relative">
                    <RC width="100%" height="100%">
                        <RBC
                            innerRadius="80%"
                            outerRadius="100%"
                            barSize={10}
                            data={chartData}
                            startAngle={180}
                            endAngle={0}
                        >
                            <PAA type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RB
                                background
                                dataKey="value"
                                cornerRadius={5}
                            />
                        </RBC>
                    </RC>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                        <div className="text-4xl font-bold font-mono text-white tracking-tighter">
                            {completion}%
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                            Completion Rate
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-400">{data.total_skipped}</div>
                    <div className="text-xs text-red-300/80 uppercase">Places Skipped</div>
                </div>
            </CardContent>
        </Card>
    );
});

BurnoutMeter.displayName = 'BurnoutMeter';
export { BurnoutMeter };
