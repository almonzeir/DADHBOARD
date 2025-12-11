// src/hooks/use-districts.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDistricts,
  getDistrictsWithStats,
  getDistrictById,
  getDistrictStats,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  uploadDistrictImage,
} from '@/services/districts.service';
import type { District } from '@/types';

// Types
export interface DistrictWithStats extends District {
  placesCount: number;
  accommodationsCount: number;
  tripsCount: number;
}

// Hook for districts list
export function useDistricts() {
  const [data, setData] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getDistricts();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch districts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for districts with stats
export function useDistrictsWithStats() {
  const [data, setData] = useState<DistrictWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getDistrictsWithStats();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch districts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for single district
export function useDistrict(id: string | null) {
  const [data, setData] = useState<District | null>(null);
  const [stats, setStats] = useState<{
    placesCount: number;
    accommodationsCount: number;
    tripsCount: number;
  } | null>(null);
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
      const [districtData, districtStats] = await Promise.all([
        getDistrictById(id),
        getDistrictStats(id),
      ]);
      setData(districtData);
      setStats(districtStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch district'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, stats, isLoading, error, refetch: fetchData };
}

// Hook for district mutations
export function useDistrictMutations() {
  const [isLoading, setIsLoading] = useState(false);

  const create = async (data: Omit<District, 'id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      const result = await createDistrict(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Omit<District, 'id' | 'created_at'>>) => {
    setIsLoading(true);
    try {
      const result = await updateDistrict(id, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteDistrict(id);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, districtId: string) => {
    setIsLoading(true);
    try {
      const result = await uploadDistrictImage(file, districtId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    create,
    update,
    remove,
    uploadImage,
  };
}