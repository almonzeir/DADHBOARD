// src/app/(dashboard)/layout.tsx
//@ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Clock, AlertCircle, Sparkles, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, isLoading, isAuthenticated, isHydrated, logout } = useAuth();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Safety timeout - if loading takes more than 8 seconds, show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHydrated || isLoading) {
        setLoadingTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isHydrated, isLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated && !admin) {
      router.push('/login');
    }
  }, [isHydrated, isLoading, isAuthenticated, admin, router]);

  // Show connection error after timeout
  if (loadingTimeout && (!isHydrated || isLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="max-w-md text-center p-8 bg-card rounded-2xl shadow-xl border">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
            <WifiOff className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold mb-2">Connection Issue</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Unable to connect to the server. This could be due to:
          </p>
          <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2 bg-muted/50 p-4 rounded-xl">
            <li>• Your internet connection is offline</li>
            <li>• The Supabase project is paused (free tier)</li>
            <li>• Server is temporarily unavailable</li>
          </ul>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while hydrating or checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/25">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Loading Dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show pending approval for pending/unapproved users
  if (admin && (admin.role === 'pending' || !admin.is_approved)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-amber-50/50 via-background to-orange-50/50 dark:from-amber-950/10 dark:via-background dark:to-orange-950/10">
        <div className="max-w-md text-center p-8 bg-card rounded-2xl shadow-xl border">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account is waiting for approval from the Super Admin.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Request Details</p>
                <p className="text-muted-foreground">
                  Organization: {admin.organization_name || 'N/A'}
                </p>
                <p className="text-muted-foreground">
                  Requested: {admin.requested_at ? new Date(admin.requested_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={logout} variant="outline" className="w-full h-11 rounded-xl">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}