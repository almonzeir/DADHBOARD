// @ts-nocheck
// src/components/analytics/KpiCards.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Users, Route, DollarSign, Star, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KpiStats {
    total_tourists: number;
    total_trips: number;
    total_revenue: number;
    avg_rating: number;
    completed_trips: number;
    active_trips: number;
}

interface KpiCardsProps {
    stats: KpiStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
    const kpis = [
        {
            title: 'Total Tourists',
            value: stats.total_tourists.toLocaleString(),
            icon: Users,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            title: 'Total Trips',
            value: stats.total_trips.toLocaleString(),
            icon: Route,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.total_revenue),
            icon: DollarSign,
            color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
        {
            title: 'Avg. Rating',
            value: stats.avg_rating.toFixed(1),
            icon: Star,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
                <Card key={kpi.title} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${kpi.color}`}>
                                <kpi.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

