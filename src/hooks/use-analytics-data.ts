// src/hooks/use-analytics-data.ts
// GOD MODE ANALYTICS HOOK - Mission Control Dashboard
// Uses RAW SQL property names - NO REMAPPING!

import { useState, useEffect } from 'react';
import {
    getKpiStats,
    getTrends,
    getPopularPlaces,
    getDistrictStats,
    getFinancials,
    getNationalityStats,
    getGrowthMetrics,
    getSafeInsights,
    getOperationalInsights,
    getMissingInsights,
    type DashboardKPIs,
    type Financials,
    type Interest,
    type AdvancedStats
} from '@/services/analytics.service';
import type { GrowthMetrics } from '@/types/analytics';

// Type definitions for chart data
interface TripTrend {
    name: string;
    trips: number;
    tourists: number;
}

interface PopularPlace {
    name: string;
    visits: number;
}

interface DistrictStat {
    district_name: string;
    visit_count: number;
    total_revenue?: number;
}

interface ScatterPoint {
    trip_title?: string;
    days: number;
    budget: number;
    segment?: string;
}

interface BudgetTier {
    tier: string;
    count: number;
}

interface TripPaceData {
    pace_type: string;
    count: number;
}

interface NationalityStat {
    country: string;
    visitors: number;
}

interface SegmentData {
    segment: string;
    count: number;
    percentage: number;
}

export function useAnalyticsData() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [trends, setTrends] = useState<TripTrend[]>([]);
    const [places, setPlaces] = useState<PopularPlace[]>([]);
    const [districts, setDistricts] = useState<DistrictStat[]>([]);
    const [nationalities, setNationalities] = useState<NationalityStat[]>([]);
    const [segments, setSegments] = useState<SegmentData[]>([]);
    const [scatter, setScatter] = useState<ScatterPoint[]>([]);
    const [budgetTiers, setBudgetTiers] = useState<BudgetTier[]>([]);
    const [tripPace, setTripPace] = useState<TripPaceData[]>([]);
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [psychographics, setPsychographics] = useState<Interest[]>([]);
    const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
    const [growth, setGrowth] = useState<GrowthMetrics | null>(null);

    const [safe, setSafe] = useState<any>(null);
    const [operational, setOperational] = useState<any>(null);
    const [missing, setMissing] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                console.log('🚀 Starting Mission Control Data Fetch (Restoration Edition)...');

                // Fetch all data in parallel
                const results = await Promise.allSettled([
                    getKpiStats(),
                    getTrends(),
                    getPopularPlaces(),
                    getDistrictStats(),
                    getFinancials(),
                    getNationalityStats(),
                    getSafeInsights(),        // NEW
                    getOperationalInsights(), // NEW
                    getMissingInsights(),     // NEW
                    getGrowthMetrics()        // NEW
                ]);

                // Process results
                const [
                    kpisResult,
                    trendsResult,
                    placesResult,
                    districtsResult,
                    financialsResult,
                    nationalitiesResult,
                    safeResult,
                    opsResult,
                    missingResult,
                    growthResult
                ] = results;

                // Set KPIs
                if (kpisResult.status === 'fulfilled' && kpisResult.value) {
                    setKpis(kpisResult.value);
                }

                // Set Trends
                if (trendsResult.status === 'fulfilled') setTrends(trendsResult.value || []);

                // Set Places
                if (placesResult.status === 'fulfilled') setPlaces(placesResult.value || []);

                // Set Districts
                if (districtsResult.status === 'fulfilled') setDistricts(districtsResult.value || []);

                // Set Financials
                if (financialsResult.status === 'fulfilled') setFinancials(financialsResult.value);

                // Set Nationalities
                if (nationalitiesResult.status === 'fulfilled') setNationalities(nationalitiesResult.value || []);

                // Set Safe Insights
                if (safeResult.status === 'fulfilled') {
                    setSafe(safeResult.value);
                }

                // Set Operational Insights
                if (opsResult.status === 'fulfilled') {
                    setOperational(opsResult.value);
                }

                // Set Missing Insights
                if (missingResult.status === 'fulfilled') {
                    setMissing(missingResult.value);
                }

                // Set Growth Metrics
                if (growthResult.status === 'fulfilled') {
                    setGrowth(growthResult.value);
                }

            } catch (err) {
                console.error('❌ Analytics fetch error:', err);
                setError('Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    return {
        kpis,
        trends,
        places,
        districts,
        financials,
        nationalities,
        safe,
        operational,
        missing,
        growth,
        isLoading,
        error
    };
}
