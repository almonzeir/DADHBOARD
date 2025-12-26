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
  ExternalLink,
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
    <Card className="overflow-hidden group border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-card">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {place.image_url ? (
          <Image
            src={place.image_url}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <MapPin className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {!place.is_active && (
            <Badge variant="secondary" className="bg-gray-900/80 text-white text-[10px] font-semibold backdrop-blur-sm">
              <EyeOff className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
          {place.is_hidden_gem && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold shadow-lg">
              <Gem className="h-3 w-3 mr-1" />
              Hidden Gem
            </Badge>
          )}
        </div>

        {/* Quick View Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onView}
          className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/90 hover:bg-white text-gray-900 shadow-lg text-xs h-8"
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          View Details
        </Button>

        {/* Actions Overlay */}
        {canEdit && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg">
                  <MoreVertical className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onView} className="py-2.5">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} className="py-2.5">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStatus} className="py-2.5">
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
                  className="py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
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
            className={`text-[10px] font-semibold ${PLACE_CATEGORY_COLORS[place.category] || PLACE_CATEGORY_COLORS.other}`}
          >
            {categoryLabel}
          </Badge>

          {/* Title */}
          <div>
            <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {place.name}
            </h3>
            {place.district && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {(place.district as any).name}
              </p>
            )}
          </div>

          {/* Description */}
          {place.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 pt-2 text-xs border-t">
            {place.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.average_duration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{place.average_duration} min</span>
              </div>
            )}
            {place.entrance_fee !== null && place.entrance_fee !== undefined && (
              <div className="text-muted-foreground font-medium ml-auto">
                {place.entrance_fee > 0 ? formatCurrency(place.entrance_fee) : 'Free Entry'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}