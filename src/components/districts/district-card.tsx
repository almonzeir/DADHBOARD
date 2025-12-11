// src/components/districts/district-card.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Building, Home, Route, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import type { District } from '@/types';

interface DistrictCardProps {
  district: District & {
    placesCount?: number;
    accommodationsCount?: number;
    tripsCount?: number;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
}

export function DistrictCard({
  district,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
}: DistrictCardProps) {
  return (
    <Card className="overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {district.image_url ? (
          <Image
            src={district.image_url}
            alt={district.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
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
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{district.name}</h3>
            {district.name_ms && district.name_ms !== district.name && (
              <p className="text-sm text-muted-foreground">{district.name_ms}</p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {district.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{district.placesCount || 0} places</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <span>{district.accommodationsCount || 0} stays</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Route className="h-4 w-4" />
              <span>{district.tripsCount || 0} trips</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}