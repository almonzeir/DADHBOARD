// src/hooks/use-trips.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getTrips,
  getTripById,
  getTripsWithDistrictNames,
  getTripStats,
  updateTripStatus,
  deleteTrip,
} from '@/services/trips.service';
import type { TravelPlan, TripStatus } from '@/types';

export interface TripFilters {
  status?: TripStatus;
  districtId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Hook for trips list
export function useTrips(filters?: TripFilters) {
  const [data, setData] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getTripsWithDistrictNames(filters);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trips'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.districtId, filters?.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for single trip
export function useTrip(id: string | null) {
  const [data, setData] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getTripById(id);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trip'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for trip statistics
export function useTripStats() {
  const [data, setData] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    draft: 0,
    totalTravelers: 0,
    totalBudget: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getTripStats();
      setData(result);
    } catch (err) {
      console.error('Error fetching trip stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}

// Hook for trip mutations
export function useTripMutations() {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (id: string, status: TripStatus) => {
    setIsLoading(true);
    try {
      const result = await updateTripStatus(id, status);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteTrip(id);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    updateStatus,
    remove,
  };
}