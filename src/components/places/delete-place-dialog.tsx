// src/components/places/delete-place-dialog.tsx

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
import { AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLACE_CATEGORY_COLORS } from '@/lib/constants';
import type { Place } from '@/types';

interface DeletePlaceDialogProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeletePlaceDialog({
  place,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeletePlaceDialogProps) {
  if (!place) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle>Delete Place</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">{place.name}</p>
                {place.name_ms && (
                  <p className="text-sm text-muted-foreground">{place.name_ms}</p>
                )}
                <Badge 
                  className={`mt-2 ${PLACE_CATEGORY_COLORS[place.category] || PLACE_CATEGORY_COLORS.other}`}
                >
                  {place.category}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this place? This will permanently remove
            all place information from the system.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Place'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}