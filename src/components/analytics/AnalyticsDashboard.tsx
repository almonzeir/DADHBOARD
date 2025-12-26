// @ts-nocheck
// src/components/analytics/AnalyticsDashboard.tsx

'use client';

import { KpiCards } from './KpiCards';
import { TrendChart } from './TrendChart';
import { VisitorSegmentChart } from './VisitorSegmentChart';
import { PopularPlacesChart } from './PopularPlacesChart';

interface AnalyticsDashboardProps {
    kpis: {
        total_tourists: number;
        total_trips: number;
        total_revenue: number;
        avg_rating: number;
        completed_trips: number;
        active_trips: number;
    };
    trends: {
        month: string;
        trips: number;
        tourists: number;
    }[];
    segments: {
        segment: string;
        count: number;
        percentage: number;
    }[];
    popularPlaces: {
        place_name: string;
        visit_count: number;
        avg_rating: number;
    }[];
}

export function AnalyticsDashboard({ kpis, trends, segments, popularPlaces }: AnalyticsDashboardProps) {
    return (
        <div className="space-y-6">
            {/* KPI Section */}
            <KpiCards stats={kpis} />

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TrendChart data={trends} />
                <VisitorSegmentChart data={segments} />
            </div>

            {/* Popular Places Selection */}
            <div className="grid gap-6">
                <PopularPlacesChart data={popularPlaces} />
            </div>
        </div>
    );
}

