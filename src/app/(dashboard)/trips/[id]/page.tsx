// src/app/(dashboard)/trips/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTrip, useTripMutations } from '@/hooks/use-trips';
import { useDistricts } from '@/hooks/use-districts';
import { DeleteTripDialog } from '@/components/trips/delete-trip-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Trash2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Route,
  CheckCircle,
  XCircle,
  Star,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTripStatusColor,
  getTripStatusLabel,
  VISITOR_SEGMENTS,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TripStatus, TripDay, TripSlot } from '@/types';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAuth();
  const tripId = params.id as string;

  const { data: trip, isLoading, refetch } = useTrip(tripId);
  const { data: districts } = useDistricts();
  const { updateStatus, remove, isLoading: mutationLoading } = useTripMutations();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canEdit = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  // Get district names
  const districtMap = new Map(districts.map(d => [d.id, d.name]));
  const districtNames = trip?.parsed_districts
    ?.map(id => districtMap.get(id))
    .filter(Boolean) || [];

  // Calculate stats
  const startDate = trip ? new Date(trip.start_date) : new Date();
  const endDate = trip ? new Date(trip.end_date) : new Date();
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const placesCount = trip?.parsed_attractions?.days?.reduce(
    (sum, day) => sum + day.slots.filter(s => s.type === 'attraction').length,
    0
  ) || 0;

  const totalCost = trip?.parsed_attractions?.days?.reduce(
    (sum, day) => sum + (day.totalCost || 0),
    0
  ) || 0;

  const handleStatusChange = async (status: TripStatus) => {
    if (!trip) return;

    const result = await updateStatus(trip.id, status);
    if (result.success) {
      toast.success(`Trip marked as ${status}`);
      refetch();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!trip) return;

    const result = await remove(trip.id);
    if (result.success) {
      toast.success('Trip deleted successfully');
      router.push('/trips');
    } else {
      toast.error(result.error || 'Failed to delete trip');
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Route className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Trip Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The trip you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push('/trips')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/trips')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{trip.title}</h1>
              <Badge className={getTripStatusColor(trip.status)}>
                {getTripStatusLabel(trip.status)}
              </Badge>
            </div>
            {districtNames.length > 0 && (
              <p className="text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {districtNames.join(', ')}
              </p>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-wrap">
            {trip.status !== 'completed' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Completed
              </Button>
            )}
            {trip.status !== 'cancelled' && trip.status !== 'completed' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('cancelled')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{duration} day{duration !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Travelers</p>
                  <p className="font-semibold">{trip.no_traveler}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Places</p>
                  <p className="font-semibold">{placesCount}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Est. Cost</p>
                  <p className="font-semibold">{formatCurrency(totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {trip.parsed_attractions?.days?.map((day: TripDay, dayIndex: number) => (
                <div key={dayIndex} className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-semibold">Day {day.day}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(day.date)}
                      </p>
                    </div>
                    {day.totalCost && (
                      <Badge variant="outline" className="ml-auto">
                        {formatCurrency(day.totalCost)}
                      </Badge>
                    )}
                  </div>

                  {/* Day Slots */}
                  <div className="ml-5 border-l-2 border-muted pl-6 space-y-4">
                    {day.slots.map((slot: TripSlot, slotIndex: number) => (
                      <div key={slotIndex}>
                        {slot.type === 'attraction' && slot.place && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex-shrink-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium">{slot.place.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {slot.place.rating && (
                                    <span className="flex items-center gap-1 text-amber-500">
                                      <Star className="h-3.5 w-3.5 fill-current" />
                                      {slot.place.rating}
                                    </span>
                                  )}
                                  {slot.place.avg_price !== undefined && slot.place.avg_price > 0 && (
                                    <Badge variant="secondary">
                                      {formatCurrency(slot.place.avg_price)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {slot.place.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {slot.place.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {slot.type === 'travel' && slot.travelTime && (
                          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                            <Navigation className="h-4 w-4" />
                            <span>{slot.travelTime} min travel</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {dayIndex < (trip.parsed_attractions?.days?.length || 0) - 1 && (
                    <Separator />
                  )}
                </div>
              ))}

              {(!trip.parsed_attractions?.days || trip.parsed_attractions.days.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No itinerary available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getTripStatusColor(trip.status)}>
                  {getTripStatusLabel(trip.status)}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Traveler Type</span>
                <span className="font-medium">{trip.visitor_segment}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{formatDate(trip.start_date)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{formatDate(trip.end_date)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">{formatCurrency(parseFloat(trip.budget))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          {trip.parsed_ai_suggestions?.interests && trip.parsed_ai_suggestions.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trip.parsed_ai_suggestions.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created on {formatDate(trip.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteTripDialog
        trip={trip}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={mutationLoading}
      />
    </div>
  );
}