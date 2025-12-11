// src/app/(dashboard)/admin-management/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  usePendingAdmins,
  useOrganizationAdmins,
  useStaffMembers,
  useAdminActions,
} from '@/hooks/use-admin-management';
import { DataTable } from '@/components/tables/data-table';
import { ApproveDialog } from '@/components/admin/approve-dialog';
import { RejectDialog } from '@/components/admin/reject-dialog';
import { DeleteAdminDialog } from '@/components/admin/delete-admin-dialog';
import { InviteStaffDialog } from '@/components/admin/invite-staff-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import {
  Clock,
  Users,
  Building2,
  UserPlus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, getInitials, getRoleBadgeColor, getRoleDisplayName } from '@/lib/utils';
import type { AdminUser } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminManagementPage() {
  const router = useRouter();
  const { admin: currentAdmin } = useAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const isOrgAdmin = currentAdmin?.role === 'org_admin';

  // Data hooks
  const { data: pendingAdmins, isLoading: pendingLoading, refetch: refetchPending } = usePendingAdmins();
  const { data: orgAdmins, isLoading: orgAdminsLoading, refetch: refetchOrgAdmins } = useOrganizationAdmins();
  const { data: staffMembers, isLoading: staffLoading, refetch: refetchStaff } = useStaffMembers(
    isOrgAdmin ? currentAdmin?.id || null : null
  );

  // Action hooks
  const { approve, reject, deleteOrgAdmin, deleteStaff, inviteStaff, isLoading: actionLoading } = useAdminActions();

  // Dialog states
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'org_admin' | 'staff'>('org_admin');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Handlers
  const handleApprove = async () => {
    if (!selectedAdmin || !currentAdmin) return;
    
    const result = await approve(selectedAdmin.id, currentAdmin.id);
    if (result.success) {
      toast.success(`${selectedAdmin.full_name} has been approved`);
      setApproveDialogOpen(false);
      refetchPending();
      refetchOrgAdmins();
    } else {
      toast.error(result.error || 'Failed to approve admin');
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedAdmin || !currentAdmin) return;
    
    const result = await reject(selectedAdmin.id, currentAdmin.id, reason);
    if (result.success) {
      toast.success(`Request from ${selectedAdmin.full_name} has been rejected`);
      setRejectDialogOpen(false);
      refetchPending();
    } else {
      toast.error(result.error || 'Failed to reject admin');
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin || !currentAdmin) return;
    
    if (deleteType === 'org_admin') {
      const result = await deleteOrgAdmin(selectedAdmin.id, currentAdmin.id);
      if (result.success) {
        const staffMsg = result.deletedStaffCount 
          ? ` and ${result.deletedStaffCount} staff member(s)`
          : '';
        toast.success(`${selectedAdmin.full_name}${staffMsg} has been deleted`);
        setDeleteDialogOpen(false);
        refetchOrgAdmins();
      } else {
        toast.error(result.error || 'Failed to delete admin');
      }
    } else {
      const result = await deleteStaff(selectedAdmin.id, currentAdmin.id);
      if (result.success) {
        toast.success(`${selectedAdmin.full_name} has been removed`);
        setDeleteDialogOpen(false);
        refetchStaff();
      } else {
        toast.error(result.error || 'Failed to remove staff');
      }
    }
  };

  // Update this function in src/app/(dashboard)/admin-management/page.tsx

  const handleInviteStaff = async (email: string, fullName: string) => {
    if (!currentAdmin) return { success: false };
    
    const result = await inviteStaff(
      email, 
      fullName,
      currentAdmin.id,
      currentAdmin.organization_id,
      currentAdmin.organization_name
    );
    
    if (result.success) {
      toast.success(`Invitation sent to ${email}`);
      refetchStaff();
      return { success: true, tempPassword: result.tempPassword };
    } else {
      toast.error(result.error || 'Failed to send invitation');
      return { success: false };
    }
  };

  // Column definitions for Pending Admins
  const pendingColumns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              {getInitials(row.original.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'organization_name',
      header: 'Organization',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.organization_name || 'N/A'}</p>
          {row.original.organization_type && (
            <Badge variant="outline" className="mt-1">
              {row.original.organization_type}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'requested_at',
      header: 'Requested',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.requested_at || row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
            onClick={() => {
              setSelectedAdmin(row.original);
              setApproveDialogOpen(true);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
            onClick={() => {
              setSelectedAdmin(row.original);
              setRejectDialogOpen(true);
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  // Column definitions for Organization Admins
  const orgAdminColumns: ColumnDef<AdminUser & { staffCount?: number }>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {getInitials(row.original.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'organization_name',
      header: 'Organization',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.organization_name || 'N/A'}</p>
          {row.original.organization_type && (
            <Badge variant="outline" className="mt-1">
              {row.original.organization_type}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'staffCount',
      header: 'Staff',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.staffCount || 0} members</span>
        </div>
      ),
    },
    {
      accessorKey: 'approved_at',
      header: 'Approved',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.approved_at ? formatDate(row.original.approved_at) : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/admin-management/${row.original.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setSelectedAdmin(row.original);
                setDeleteType('org_admin');
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Column definitions for Staff Members
  const staffColumns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {getInitials(row.original.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'last_login_at',
      header: 'Last Active',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.last_login_at ? formatDate(row.original.last_login_at) : 'Never'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            setSelectedAdmin(row.original);
            setDeleteType('staff');
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      ),
    },
  ];

  // Render based on role
  if (!isSuperAdmin && !isOrgAdmin) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isSuperAdmin ? 'Admin Management' : 'Team Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'Manage organization admins and approval requests'
              : 'Manage your team members'}
          </p>
        </div>
        {isOrgAdmin && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Staff
          </Button>
        )}
      </div>

      {/* Super Admin View */}
      {isSuperAdmin && (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingAdmins.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingAdmins.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="organizations" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>
                  Review and approve organization admin requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={pendingColumns}
                  data={pendingAdmins}
                  isLoading={pendingLoading}
                  searchKey="full_name"
                  searchPlaceholder="Search by name..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Organization Admins
                </CardTitle>
                <CardDescription>
                  All approved organization administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={orgAdminColumns}
                  data={orgAdmins}
                  isLoading={orgAdminsLoading}
                  searchKey="full_name"
                  searchPlaceholder="Search by name..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Org Admin View */}
      {isOrgAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              My Team
            </CardTitle>
            <CardDescription>
              Staff members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={staffColumns}
              data={staffMembers}
              isLoading={staffLoading}
              searchKey="full_name"
              searchPlaceholder="Search staff..."
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ApproveDialog
        admin={selectedAdmin}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onConfirm={handleApprove}
        isLoading={actionLoading}
      />

      <RejectDialog
        admin={selectedAdmin}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
        isLoading={actionLoading}
      />

      <DeleteAdminDialog
        admin={selectedAdmin}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={actionLoading}
        type={deleteType}
      />

      <InviteStaffDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onConfirm={handleInviteStaff}
        isLoading={actionLoading}
        organizationName={currentAdmin?.organization_name || undefined}
      />
    </div>
  );
}