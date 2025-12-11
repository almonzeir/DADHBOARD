// src/hooks/use-places.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  togglePlaceStatus,
  uploadPlaceImage,
} from '@/services/places.service';
import type { Place, PlaceCategory } from '@/types';

export interface PlaceFilters {
  districtId?: string;
  category?: PlaceCategory;
  isActive?: boolean;
  isHiddenGem?: boolean;
  search?: string;
}

// Hook for places list
export function usePlaces(filters?: PlaceFilters) {
  const [data, setData] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getPlaces(filters);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch places'));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.districtId, filters?.category, filters?.isActive, filters?.isHiddenGem, filters?.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for single place
export function usePlace(id: string | null) {
  const [data, setData] = useState<Place | null>(null);
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
      const result = await getPlaceById(id);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch place'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for place mutations
export function usePlaceMutations() {
  const [isLoading, setIsLoading] = useState(false);

  const create = async (data: Omit<Place, 'id' | 'created_at' | 'updated_at' | 'district'>) => {
    setIsLoading(true);
    try {
      const result = await createPlace(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Omit<Place, 'id' | 'created_at' | 'district'>>) => {
    setIsLoading(true);
    try {
      const result = await updatePlace(id, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deletePlace(id);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const result = await togglePlaceStatus(id, isActive);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, placeId: string) => {
    setIsLoading(true);
    try {
      const result = await uploadPlaceImage(file, placeId);
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
    toggleStatus,
    uploadImage,
  };
}