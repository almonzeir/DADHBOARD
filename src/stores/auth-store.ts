// src/stores/auth-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUser } from '@/types';

interface AuthState {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAdmin: (admin: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isLoading: true,
      isAuthenticated: false,
      isHydrated: false,
      setAdmin: (admin) => {
        const isAuth = !!admin && admin.is_approved === true && admin.role !== 'pending';
        set({
          admin,
          isAuthenticated: isAuth,
          isLoading: false,
          isHydrated: true, // Also set hydrated when admin is set
        });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated, isLoading: false });
      },
      logout: () => {
        set({
          admin: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true, // Keep hydrated true after logout
        });
      },
    }),
    {
      name: 'maikedah-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth rehydration error:', error);
        }
        if (state) {
          const isAuth = !!state.admin && state.admin.is_approved === true && state.admin.role !== 'pending';
          state.isAuthenticated = isAuth;
          state.isLoading = false;
          state.isHydrated = true;
        }
      },
    }
  )
);

// Force hydration check on client side
if (typeof window !== 'undefined') {
  // Small delay to ensure store is initialized
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (!state.isHydrated) {
      useAuthStore.setState({ isHydrated: true, isLoading: false });
    }
  }, 500);
}