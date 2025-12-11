// src/app/(dashboard)/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, isLoading, isAuthenticated, isHydrated, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated && !admin) {
      router.push('/login');
    }
  }, [isHydrated, isLoading, isAuthenticated, admin, router]);

  // Show loading while hydrating or checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show pending approval for pending/unapproved users
  if (admin && (admin.role === 'pending' || !admin.is_approved)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-amber-50 via-background to-amber-50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/20">
        <div className="max-w-md text-center p-8 bg-card rounded-xl shadow-lg border">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account is waiting for approval from the Super Admin.
          </p>
          
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Request Details</p>
                <p className="text-muted-foreground">
                  Organization: {admin.organization_name || 'N/A'}
                </p>
                <p className="text-muted-foreground">
                  Requested: {admin.requested_at ? new Date(admin.requested_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={logout} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}