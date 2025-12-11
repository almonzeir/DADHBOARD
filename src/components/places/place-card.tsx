// src/components/places/place-card.tsx

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
  Clock,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gem,
} from 'lucide-react';
import Image from 'next/image';
import { PLACE_CATEGORY_COLORS, PLACE_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { Place } from '@/types';

interface PlaceCardProps {
  place: Place;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  canEdit?: boolean;
}

export function PlaceCard({
  place,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit = true,
}: PlaceCardProps) {
  const categoryLabel = PLACE_CATEGORIES.find(c => c.value === place.category)?.label || place.category;

  return (
    <Card className="overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {place.image_url ? (
          <Image
            src={place.image_url}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {!place.is_active && (
            <Badge variant="secondary" className="bg-gray-800/80 text-white">
              <EyeOff className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
          {place.is_hidden_gem && (
            <Badge className="bg-amber-500/90 text-white">
              <Gem className="h-3 w-3 mr-1" />
              Hidden Gem
            </Badge>
          )}
        </div>
        
        {/* Actions Overlay */}
        {canEdit && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStatus}>
                  {place.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
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
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Category Badge */}
          <Badge 
            variant="secondary"
            className={PLACE_CATEGORY_COLORS[place.category] || PLACE_CATEGORY_COLORS.other}
          >
            {categoryLabel}
          </Badge>

          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{place.name}</h3>
            {place.district && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {(place.district as any).name}
              </p>
            )}
          </div>

          {/* Description */}
          {place.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {place.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 text-sm">
            {place.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.average_duration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{place.average_duration} min</span>
              </div>
            )}
            {place.entrance_fee !== null && place.entrance_fee !== undefined && (
              <div className="text-muted-foreground">
                {place.entrance_fee > 0 ? formatCurrency(place.entrance_fee) : 'Free'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}