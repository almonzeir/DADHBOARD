// src/components/analytics/top-places.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MapPin } from 'lucide-react';

interface TopPlacesProps {
  places: {
    id: string;
    name: string;
    district: string;
    visits: number;
    rating: number;
  }[];
}

export function TopPlaces({ places }: TopPlacesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Places
        </CardTitle>
        <CardDescription>Most popular destinations by visits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {places.length > 0 ? (
            places.map((place, index) => (
              <div
                key={place.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {place.district}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary">{place.visits} visits</Badge>
                  {place.rating > 0 && (
                    <span className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}