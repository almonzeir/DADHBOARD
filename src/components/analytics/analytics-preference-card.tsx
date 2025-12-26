// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, MapPin } from 'lucide-react';
import { HiddenGemStat } from '@/types/analytics';

interface Props {
    data: HiddenGemStat | null;
}

export function AnalyticsPreferenceCard({ data: hiddenGemData }: Props) {
    // Default/Fallback data if null
    const data = hiddenGemData || { total: 100, hidden: 35, percentage: 35 };
    const popularPercentage = 100 - data.percentage;

    return (
        <Card className="col-span-2 border border-gray-100 shadow-[0_3px_12px_-5px_rgba(0,0,0,0.06)] bg-white dark:bg-card">
            <CardHeader className="pb-2 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Discovery Preference
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium mt-1">Mainstream vs. Hidden Gems</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                {/* Visual Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                        <span className="flex items-center text-blue-600">
                            <MapPin className="w-4 h-4 mr-1" /> Mainstream ({popularPercentage.toFixed(1)}%)
                        </span>
                        <span className="flex items-center text-purple-600">
                            <Gem className="w-4 h-4 mr-1" /> Hidden Gems ({data.percentage}%)
                        </span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: `${popularPercentage}%` }}
                        />
                        <div
                            className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{ width: `${data.percentage}%` }}
                        />
                    </div>
                </div>

                {/* Insight Box */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                    <h4 className="text-purple-700 dark:text-purple-300 font-bold flex items-center mb-1">
                        <Gem className="w-4 h-4 mr-2" />
                        Explorer Insight
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                        <strong>{data.hidden.toLocaleString()} visits</strong> were to locations marked as "Hidden Gems".
                        Promoting off-path locations is working effectively.
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}

