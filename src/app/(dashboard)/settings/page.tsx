// src/app/(dashboard)/settings/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile, useProfileMutations, useActivityLog } from '@/hooks/use-profile';
import { ProfileEditDialog } from '@/components/settings/profile-edit-dialog';
import { ChangePasswordDialog } from '@/components/settings/change-password-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Edit,
  Lock,
  Clock,
  Activity,
  CheckCircle,
  UserPlus,
  LogIn,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { ADMIN_ROLES } from '@/lib/constants';

export default function SettingsPage() {
  const { admin } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: activities, isLoading: activitiesLoading } = useActivityLog(10);
  const { update, uploadAvatarImage, updatePassword, isLoading: mutationLoading } = useProfileMutations();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleProfileUpdate = async (
    data: { full_name: string; phone?: string },
    avatarFile?: File
  ) => {
    // Upload avatar first if provided
    if (avatarFile) {
      const uploadResult = await uploadAvatarImage(avatarFile);
      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Failed to upload avatar');
        return;
      }
    }

    // Update profile data
    const result = await update(data);
    if (result.success) {
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      refetchProfile();
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    const result = await updatePassword(currentPassword, newPassword);
    return result;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleInfo = (role: string) => {
    return ADMIN_ROLES.find(r => r.value === role) || ADMIN_ROLES[0];
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'invite_staff':
        return <UserPlus className="h-4 w-4" />;
      case 'approve_admin':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: 'Logged in',
      logout: 'Logged out',
      invite_staff: 'Invited staff member',
      approve_admin: 'Approved admin request',
      reject_admin: 'Rejected admin request',
      delete_staff: 'Removed staff member',
      delete_org_admin: 'Removed organization admin',
      update_profile: 'Updated profile',
      change_password: 'Changed password',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile?.role || 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account settings, security, and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <Badge className={`mt-3 ${roleInfo.color}`}>
                  {roleInfo.label}
                </Badge>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile?.phone || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">••••••••</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                Change
              </Button>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="font-medium">
                  {profile?.last_login_at
                    ? formatDate(profile.last_login_at)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Card (for org_admin and org_staff) */}
        {(profile?.role === 'org_admin' || profile?.role === 'org_staff') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Organization Name</p>
                <p className="font-medium">{profile?.organization_name || 'Not set'}</p>
              </div>

              {profile?.organization_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {profile.organization_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}

              {profile?.role === 'org_staff' && profile?.approved_by && (
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">View in Admin Management</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent account activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {getActivityLabel(activity.action)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleProfileUpdate}
        isLoading={mutationLoading}
        profile={profile}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordChange}
        isLoading={mutationLoading}
      />
    </div>
  );
}