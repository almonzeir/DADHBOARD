// src/types/analytics.ts

export interface AnalyticsKPIs {
    total_tourists: number;
    total_trips: number;
    avg_budget: number;
    avg_duration: number;
    avg_rating: number;
    top_name: string;
    top_visits: number;
}

export interface InterestCategory {
    name: string;
    value: number;
}

export interface TripTrend {
    name: string;
    trips: number;
    tourists: number;
}

export interface VisitorSegment {
    name: string;
    value: number;
}

export interface PopularPlace {
    name: string;
    visits: number;
}

export interface DistrictStat {
    district_name: string;
    visit_count: number;
    total_revenue: number;
}

export interface ScatterPoint {
    trip_title: string;
    days: number;
    budget: number;
    segment: string;
}

export interface HiddenGemStat {
    total: number;
    hidden: number;
    percentage: number;
}

// === NEW TYPES FOR GROWTH ENGINE ===

export interface MomentumPoint {
    date: string;
    cumulative_revenue: number;
}

export interface HeatmapPoint {
    day: string;
    hour: number;
    intensity: number;
}

export interface QualityPoint {
    date: string;
    rating: number;
}

export interface GrowthMetrics {
    momentum: MomentumPoint[];
    heatmap: HeatmapPoint[];
    quality: QualityPoint[];
}
