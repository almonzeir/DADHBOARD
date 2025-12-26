// src/app/(dashboard)/admin-management/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getAdminById, getStaffMembers } from '@/services/admin.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { formatDate, formatDateTime, getInitials, getRoleBadgeColor, getRoleDisplayName } from '@/lib/utils';
import type { AdminUser } from '@/types';

export default function AdminDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin: currentAdmin } = useAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [staffMembers, setStaffMembers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const adminId = params.id as string;
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  useEffect(() => {
    async function fetchData() {
      if (!adminId) return;

      setIsLoading(true);
      try {
        const adminData = await getAdminById(adminId);
        setAdmin(adminData);

        if (adminData?.role === 'org_admin') {
          const staff = await getStaffMembers(adminId);
          setStaffMembers(staff);
        }
      } catch (error) {
        console.error('Error fetching admin:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [adminId]);

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-xl font-semibold mb-2">Admin Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested admin could not be found.
        </p>
        <Button onClick={() => router.push('/admin-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Management
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Admin Details</h1>
          <p className="text-muted-foreground">View organization admin information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(admin.full_name || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{admin.full_name}</h3>
                <Badge className={getRoleBadgeColor(admin.role)}>
                  {getRoleDisplayName(admin.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{admin.organization_name || 'N/A'}</p>
                  {admin.organization_type && (
                    <Badge variant="outline" className="mt-1">
                      {admin.organization_type}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">{formatDate(admin.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="font-medium">
                    {admin.approved_at ? formatDateTime(admin.approved_at) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {admin.last_login_at ? formatDateTime(admin.last_login_at) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Members Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Members
            </CardTitle>
            <CardDescription>
              {staffMembers.length} member{staffMembers.length !== 1 ? 's' : ''} in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffMembers.length > 0 ? (
              <div className="space-y-3">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {getInitials(staff.full_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{staff.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{staff.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm">{formatDate(staff.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No staff members yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Reason (if available) */}
      {admin.request_reason && (
        <Card>
          <CardHeader>
            <CardTitle>Registration Request</CardTitle>
            <CardDescription>
              Original request reason submitted during registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{admin.request_reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}