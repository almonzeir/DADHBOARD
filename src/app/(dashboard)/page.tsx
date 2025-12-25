// src/app/(dashboard)/page.tsx

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardStats, useTripsByMonth, useTripsByDistrict, useTopPlaces, useAdvancedAnalytics } from '@/hooks/use-analytics';
import { StatsCard } from '@/components/charts/stats-card';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  MapPin,
  Route,
  Star,
  TrendingUp,
  Map,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, getInitials, getRoleDisplayName } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { admin } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { data: advancedStats, isLoading: advancedLoading } = useAdvancedAnalytics();
  const { data: tripsByMonth, isLoading: tripsMonthLoading } = useTripsByMonth();
  const { data: tripsByDistrict, isLoading: tripsDistrictLoading } = useTripsByDistrict();
  const { data: topPlaces, isLoading: topPlacesLoading } = useTopPlaces(5);

  // Safe access to comparison data
  const comparison = advancedStats?.comparison || {
    travelersChange: 0,
    tripsChange: 0
  };

  const statsCards = [
    {
      title: 'Total Tourists',
      value: stats?.totalTourists?.toLocaleString() || '0',
      change: `${comparison.travelersChange > 0 ? '+' : ''}${comparison.travelersChange.toFixed(1)}% from last period`,
      changeType: comparison.travelersChange >= 0 ? 'positive' as const : 'negative' as const,
      icon: Users,
    },
    {
      title: 'Active Places',
      value: stats?.totalPlaces?.toLocaleString() || '0',
      change: `${stats?.totalDistricts || 0} districts`,
      changeType: 'neutral' as const,
      icon: MapPin,
    },
    {
      title: 'Total Trips',
      value: stats?.totalTrips?.toLocaleString() || '0',
      change: `${comparison.tripsChange > 0 ? '+' : ''}${comparison.tripsChange.toFixed(1)}% from last period`,
      changeType: comparison.tripsChange >= 0 ? 'positive' as const : 'negative' as const,
      icon: Route,
    },
    {
      title: 'Avg. Rating',
      value: stats?.avgRating?.toFixed(1) || '0.0',
      change: 'from all reviews',
      changeType: 'neutral' as const,
      icon: Star,
    },
  ];

  const isLoading = statsLoading || advancedLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {admin?.full_name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with MaiKedah tourism today.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit h-8 px-3 text-sm">
          {getRoleDisplayName(admin?.role || '')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <AreaChart
          title="Trip Trends"
          description="Number of trips over the last 6 months"
          data={tripsByMonth}
          dataKey="trips"
          xAxisKey="month"
          isLoading={tripsMonthLoading}
        />
        <BarChart
          title="Trips by District"
          description="Most popular districts this month"
          data={tripsByDistrict.slice(0, 8)}
          dataKey="count"
          xAxisKey="district"
          isLoading={tripsDistrictLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Places */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Attractions</CardTitle>
              <CardDescription>Most visited places this month</CardDescription>
            </div>
            <Link 
              href="/places" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{place.name}</p>
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
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No places data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {admin?.role === 'super_admin' && stats?.pendingApprovals ? (
              <Link href="/admin-management">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Pending Approvals
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats.pendingApprovals} requests waiting
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}

            <Link href="/districts">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Districts</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.totalDistricts || 12} districts
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/analytics">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed insights
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/reports">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Generate Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Export tourism data
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
