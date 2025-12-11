// src/hooks/use-profile.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getMyActivityLog,
} from '@/services/profile.service';
import type { AdminUser } from '@/types';

// Hook for profile data
export function useProfile() {
  const [data, setData] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getProfile();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for profile mutations
export function useProfileMutations() {
  const [isLoading, setIsLoading] = useState(false);

  const update = async (updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await updateProfile(updates);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatarImage = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await uploadAvatar(file);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    update,
    uploadAvatarImage,
    updatePassword,
  };
}

// Hook for activity log
export function useActivityLog(limit: number = 10) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getMyActivityLog(limit);
      setData(result);
    } catch (err) {
      console.error('Error fetching activity log:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}