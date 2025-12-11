// src/components/trips/delete-trip-dialog.tsx

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
import { AlertTriangle, Route, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTripStatusColor, getTripStatusLabel } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { TravelPlan } from '@/types';

interface DeleteTripDialogProps {
  trip: TravelPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteTripDialog({
  trip,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteTripDialogProps) {
  if (!trip) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle>Delete Trip</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Route className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{trip.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getTripStatusColor(trip.status)} variant="secondary">
                    {getTripStatusLabel(trip.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(trip.start_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {trip.no_traveler} traveler{trip.no_traveler !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this trip? This will permanently remove
            all trip data including the itinerary and associated information.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Trip'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}