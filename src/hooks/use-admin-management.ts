// src/hooks/use-admin-management.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPendingAdmins,
  getOrganizationAdmins,
  getStaffMembers,
  getStaffCount,
  approveAdmin,
  rejectAdmin,
  deleteOrganizationAdmin,
  deleteStaffMember,
  inviteStaffMember,
  getAdminActivities,
} from '@/services/admin.service';
import type { AdminUser } from '@/types';

// Hook for pending admins (Super Admin)
export function usePendingAdmins() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getPendingAdmins();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pending admins'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for organization admins (Super Admin)
export function useOrganizationAdmins() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getOrganizationAdmins();
      
      // Fetch staff count for each org admin
      const adminsWithStaffCount = await Promise.all(
        result.map(async (admin) => {
          const staffCount = await getStaffCount(admin.id);
          return { ...admin, staffCount };
        })
      );
      
      setData(adminsWithStaffCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organization admins'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for staff members (Org Admin)
export function useStaffMembers(parentAdminId: string | null) {
  const [data, setData] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!parentAdminId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getStaffMembers(parentAdminId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch staff members'));
    } finally {
      setIsLoading(false);
    }
  }, [parentAdminId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for admin actions
export function useAdminActions() {
  const [isLoading, setIsLoading] = useState(false);

  const approve = async (adminId: string, approverId: string) => {
    setIsLoading(true);
    try {
      const result = await approveAdmin(adminId, approverId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const reject = async (adminId: string, approverId: string, reason: string) => {
    setIsLoading(true);
    try {
      const result = await rejectAdmin(adminId, approverId, reason);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrgAdmin = async (adminId: string, deleterId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteOrganizationAdmin(adminId, deleterId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStaff = async (staffId: string, deleterId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteStaffMember(staffId, deleterId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Update inviteStaff in useAdminActions hook

  const inviteStaff = async (
    email: string,
    fullName: string,
    parentAdminId: string,
    organizationId: string | null,
    organizationName: string | null
  ): Promise<{ success: boolean; error?: string; tempPassword?: string }> => {
    setIsLoading(true);
    try {
      const result = await inviteStaffMember(
        email,
        fullName,
        parentAdminId,
        organizationId, 
        organizationName
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    approve,
    reject,
    deleteOrgAdmin,
    deleteStaff,
    inviteStaff,
  };
}

// Hook for admin activity log
export function useAdminActivities(limit: number = 20) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminActivities(limit);
      setData(result);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}