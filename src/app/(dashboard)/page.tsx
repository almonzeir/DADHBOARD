// src/app/(dashboard)/page.tsx

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardStats, useTripsByMonth, useTripsByDistrict, useTopPlaces, useAdvancedAnalytics } from '@/hooks/use-analytics';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { admin } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { data: advancedStats, isLoading: advancedLoading } = useAdvancedAnalytics();
  const { data: tripsByMonth, isLoading: tripsMonthLoading } = useTripsByMonth();
  const { data: tripsByDistrict, isLoading: tripsDistrictLoading } = useTripsByDistrict();
  const { data: topPlaces, isLoading: topPlacesLoading } = useTopPlaces(5);

  const isLoading = statsLoading || advancedLoading;

  return (
    <div className="space-y-6">
      {/* Search and Header area is handled by Layout/Header component,
          but we might need to adjust spacing if the image implies it.
          The image shows a clean top area. */}

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <AreaChart
          title="Trip Trends"
          description="Number of trips over the last 6 months"
          data={tripsByMonth}
          dataKey="trips"
          xAxisKey="month"
          isLoading={tripsMonthLoading}
          color="#22c55e" // Green-500
        />
        <BarChart
          title="Trips by District"
          description="Most popular districts this month"
          data={tripsByDistrict.slice(0, 8)}
          dataKey="count"
          xAxisKey="district"
          isLoading={tripsDistrictLoading}
          showGradient={false} // Solid green in image
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Attractions */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Attractions</CardTitle>
              <CardDescription>Most visited places this month</CardDescription>
            </div>
            <Link
              href="/places"
              className="text-sm text-green-500 hover:text-green-400 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {topPlacesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : topPlaces.length > 0 ? (
              <div className="space-y-4">
                {topPlaces.map((place, index) => (
                  <div key={place.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-green-500 font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-base">{place.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {place.visits} visits
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No places data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/districts">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Map className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Districts</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.totalDistricts || 12} districts
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
