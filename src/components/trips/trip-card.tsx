// src/components/trips/trip-card.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { getTripStatusColor, getTripStatusLabel } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TravelPlan } from '@/types';

interface TripCardProps {
  trip: TravelPlan;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'active' | 'completed' | 'cancelled') => void;
  canEdit?: boolean;
}

export function TripCard({
  trip,
  onView,
  onDelete,
  onStatusChange,
  canEdit = true,
}: TripCardProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const placesCount = trip.parsed_attractions?.days?.reduce(
    (sum, day) => sum + day.slots.filter(s => s.type === 'attraction').length,
    0
  ) || 0;

  return (
    <Card className="overflow-hidden card-hover group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getTripStatusColor(trip.status)}>
                {getTripStatusLabel(trip.status)}
              </Badge>
              <Badge variant="outline">
                {trip.visitor_segment}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg truncate mb-1">{trip.title}</h3>

            {/* Districts */}
            {trip.district_names && trip.district_names.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {trip.district_names.join(', ')}
                </span>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Travelers</p>
                  <p className="font-medium">{trip.no_traveler}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{formatCurrency(parseFloat(trip.budget))}</p>
                </div>
              </div>
            </div>

            {/* Places Count */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {placesCount} place{placesCount !== 1 ? 's' : ''} in itinerary
              </span>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {trip.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                {trip.status !== 'active' && trip.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => onStatusChange('active')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Active
                  </DropdownMenuItem>
                )}
                {trip.status !== 'cancelled' && (
                  <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Trip
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}