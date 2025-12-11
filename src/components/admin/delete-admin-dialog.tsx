// src/components/admin/delete-admin-dialog.tsx

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Users } from 'lucide-react';
import type { AdminUser } from '@/types';

interface DeleteAdminDialogProps {
  admin: (AdminUser & { staffCount?: number }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  type: 'org_admin' | 'staff';
}

export function DeleteAdminDialog({
  admin,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  type,
}: DeleteAdminDialogProps) {
  if (!admin) return null;

  const isOrgAdmin = type === 'org_admin';
  const staffCount = (admin as any).staffCount || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle>
                {isOrgAdmin ? 'Delete Organization Admin' : 'Remove Staff Member'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{admin.full_name}</p>
            <p className="text-sm text-muted-foreground">{admin.email}</p>
            {admin.organization_name && (
              <p className="text-sm text-muted-foreground">{admin.organization_name}</p>
            )}
          </div>

          {isOrgAdmin && staffCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Cascade Warning
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This admin has <strong>{staffCount} staff member{staffCount > 1 ? 's' : ''}</strong>. 
                    Deleting this admin will also remove all their staff members.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {isOrgAdmin
              ? 'Are you sure you want to delete this organization admin? They will lose all access to the system.'
              : 'Are you sure you want to remove this staff member? They will lose all access to the system.'}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}