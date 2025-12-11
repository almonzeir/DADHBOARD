// src/hooks/use-analytics.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardStats,
  getTripsByDistrict,
  getTripsByMonth,
  getTopPlaces,
  getRecentTrips,
  getRecentReviews,
} from '@/services/analytics.service';
import {
  getAdvancedAnalytics,
  DateRange,
  AnalyticsData,
} from '@/services/analytics-advanced.service';
import type { DashboardStats, TripsByDistrict, TripsByMonth, TopPlace } from '@/types';

// ============================================
// BASIC DASHBOARD HOOKS (from analytics.service)
// ============================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useTripsByDistrict() {
  const [data, setData] = useState<TripsByDistrict[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const result = await getTripsByDistrict();
      setData(result);
      setIsLoading(false);
    }
    fetch();
  }, []);

  return { data, isLoading };
}

export function useTripsByMonth() {
  const [data, setData] = useState<TripsByMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const result = await getTripsByMonth();
      setData(result);
      setIsLoading(false);
    }
    fetch();
  }, []);

  return { data, isLoading };
}

export function useTopPlaces(limit: number = 5) {
  const [data, setData] = useState<TopPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const result = await getTopPlaces(limit);
      setData(result);
      setIsLoading(false);
    }
    fetch();
  }, [limit]);

  return { data, isLoading };
}

export function useRecentTrips(limit: number = 5) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const result = await getRecentTrips(limit);
      setData(result);
      setIsLoading(false);
    }
    fetch();
  }, [limit]);

  return { data, isLoading };
}

export function useRecentReviews(limit: number = 5) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const result = await getRecentReviews(limit);
      setData(result);
      setIsLoading(false);
    }
    fetch();
  }, [limit]);

  return { data, isLoading };
}

// ============================================
// ADVANCED ANALYTICS HOOKS (from analytics-advanced.service)
// ============================================

const initialAdvancedData: AnalyticsData = {
  overview: {
    totalTrips: 0,
    totalTravelers: 0,
    totalBudget: 0,
    avgBudget: 0,
    completionRate: 0,
    avgTripDuration: 0,
  },
  comparison: {
    tripsChange: 0,
    travelersChange: 0,
    budgetChange: 0,
  },
  tripsTrend: [],
  tripsByDistrict: [],
  tripsBySegment: [],
  tripsByStatus: [],
  budgetDistribution: [],
  topPlaces: [],
  recentActivity: [],
};

export function useAdvancedAnalytics(dateRange?: DateRange) {
  const [data, setData] = useState<AnalyticsData>(initialAdvancedData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdvancedAnalytics(dateRange);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setIsLoading(false);
    }
  }, [dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Re-export types for convenience
export type { DateRange, AnalyticsData };