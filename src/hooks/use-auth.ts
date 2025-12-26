// src/hooks/use-auth.ts

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { AdminUser } from '@/types';

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const authCheckRef = useRef(false);
  
  const admin = useAuthStore((state) => state.admin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.logout);

  const fetchAdminProfile = useCallback(async (userId: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('admin_users_ak')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AdminUser;
  }, [supabase]);

  const checkAuth = useCallback(async () => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        setAdmin(null);
        return;
      }

      // Skip fetch if admin already in store
      const currentAdmin = useAuthStore.getState().admin;
      if (currentAdmin && currentAdmin.id === session.user.id) {
        setLoading(false);
        return;
      }

      const adminProfile = await fetchAdminProfile(session.user.id);
      
      if (!adminProfile) {
        await supabase.auth.signOut();
        setAdmin(null);
        return;
      }

      setAdmin(adminProfile);
    } catch (error) {
      setAdmin(null);
    }
  }, [supabase, fetchAdminProfile, setAdmin, setLoading]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      const adminProfile = await fetchAdminProfile(data.user.id);

      if (!adminProfile) {
        await supabase.auth.signOut();
        throw new Error('You are not registered as an admin. Please contact the administrator.');
      }

      if (adminProfile.role === 'pending' || !adminProfile.is_approved) {
        setAdmin(adminProfile);
        throw new Error('Your account is pending approval. Please wait for the administrator to approve your access.');
      }

      // Update last login
      await supabase
        .from('admin_users_ak')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      setAdmin(adminProfile);
      router.push('/');
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearAuth();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    organizationName: string,
    organizationType: string,
    requestReason: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed. Please try again.');

      const { error: insertError } = await supabase
        .from('admin_users_ak')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'pending',
          is_approved: false,
          organization_name: organizationName,
          organization_type: organizationType,
          request_reason: requestReason,
          requested_at: new Date().toISOString(),
        });

      if (insertError) {
        await supabase.auth.signOut();
        throw new Error('Failed to create admin profile. Please try again.');
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const refreshAdmin = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const adminProfile = await fetchAdminProfile(session.user.id);
      if (adminProfile) {
        setAdmin(adminProfile);
      }
    }
  }, [supabase, fetchAdminProfile, setAdmin]);

  // Check auth on mount
  useEffect(() => {
    if (!isHydrated) {
      const timer = setTimeout(() => checkAuth(), 100);
      return () => clearTimeout(timer);
    }
    checkAuth();
  }, [isHydrated, checkAuth]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          clearAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, clearAuth]);

  return {
    admin,
    isLoading: isLoading && !isHydrated,
    isAuthenticated,
    isHydrated,
    login,
    logout,
    register,
    checkAuth,
    refreshAdmin,
  };
}