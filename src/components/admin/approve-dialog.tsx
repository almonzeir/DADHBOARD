// src/components/admin/approve-dialog.tsx

'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Mail, FileText } from 'lucide-react';
import type { AdminUser } from '@/types';
import { formatDate } from '@/lib/utils';

interface ApproveDialogProps {
  admin: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ApproveDialog({
  admin,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ApproveDialogProps) {
  if (!admin) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <AlertDialogTitle>Approve Request</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm approval for this organization
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Admin Details */}
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{admin.full_name}</span>
              <Badge variant="secondary">Pending</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{admin.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{admin.organization_name || 'N/A'}</span>
                {admin.organization_type && (
                  <Badge variant="outline" className="ml-1">
                    {admin.organization_type}
                  </Badge>
                )}
              </div>

              {admin.request_reason && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span className="flex-1">{admin.request_reason}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Requested on {formatDate(admin.requested_at || admin.created_at)}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            By approving, this user will gain <strong>Organization Admin</strong> privileges 
            and can manage their own staff members.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Approving...' : 'Approve'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}