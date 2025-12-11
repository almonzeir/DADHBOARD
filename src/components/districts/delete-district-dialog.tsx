// src/components/districts/delete-district-dialog.tsx

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
import { AlertTriangle, MapPin, Building, Home } from 'lucide-react';
import type { District } from '@/types';

interface DeleteDistrictDialogProps {
  district: (District & { placesCount?: number; accommodationsCount?: number }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteDistrictDialog({
  district,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteDistrictDialogProps) {
  if (!district) return null;

  const hasAssociatedData = (district.placesCount || 0) > 0 || (district.accommodationsCount || 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle>Delete District</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{district.name}</p>
                {district.name_ms && (
                  <p className="text-sm text-muted-foreground">{district.name_ms}</p>
                )}
              </div>
            </div>
          </div>

          {hasAssociatedData ? (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4">
              <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                Cannot Delete District
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                This district has associated data that must be removed first:
              </p>
              <div className="space-y-2">
                {(district.placesCount || 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <Building className="h-4 w-4" />
                    <span>{district.placesCount} place(s)</span>
                  </div>
                )}
                {(district.accommodationsCount || 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <Home className="h-4 w-4" />
                    <span>{district.accommodationsCount} accommodation(s)</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this district? This will permanently remove
              all district information from the system.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {!hasAssociatedData && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete District'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}