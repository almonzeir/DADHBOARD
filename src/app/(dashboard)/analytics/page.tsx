// src/app/(dashboard)/analytics/page.tsx

'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subMonths } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useAdvancedAnalytics } from '@/hooks/use-analytics';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  TrendChart,
  BarChartComponent,
  PieChartComponent,
  StatCard,
} from '@/components/analytics/charts';
import { TopPlaces } from '@/components/analytics/top-places';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Route,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTripStatusLabel } from '@/lib/constants';

export default function AnalyticsPage() {
  const { admin } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });

  const { data, isLoading } = useAdvancedAnalytics(
    dateRange?.from && dateRange?.to
      ? { from: dateRange.from, to: dateRange.to }
      : undefined
  );

  const canAccess = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view analytics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive tourism insights and trends
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trips"
          value={data.overview.totalTrips}
          change={data.comparison.tripsChange}
          icon={<Route className="h-6 w-6" />}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
        />
        <StatCard
          title="Total Travelers"
          value={data.overview.totalTravelers}
          change={data.comparison.travelersChange}
          icon={<Users className="h-6 w-6" />}
          iconColor="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(data.overview.totalBudget)}
          change={data.comparison.budgetChange}
          icon={<DollarSign className="h-6 w-6" />}
          iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
        />
        <StatCard
          title="Completion Rate"
          value={`${data.overview.completionRate.toFixed(0)}%`}
          icon={<Target className="h-6 w-6" />}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
              <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Trip Duration</p>
              <p className="text-xl font-bold">{data.overview.avgTripDuration.toFixed(1)} days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900">
              <DollarSign className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Budget per Trip</p>
              <p className="text-xl font-bold">{formatCurrency(data.overview.avgBudget)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Group Size</p>
              <p className="text-xl font-bold">
                {data.overview.totalTrips > 0
                  ? (data.overview.totalTravelers / data.overview.totalTrips).toFixed(1)
                  : 0} people
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <TrendChart
        title="Trip Trends"
        description="Number of trips and travelers over time"
        data={data.tripsTrend}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trips by District */}
        <BarChartComponent
          title="Trips by District"
          description="Distribution of trips across Kedah districts"
          data={data.tripsByDistrict.slice(0, 8).map(d => ({
            name: d.district,
            value: d.trips,
          }))}
          layout="vertical"
        />

        {/* Visitor Segments */}
        <PieChartComponent
          title="Visitor Segments"
          description="Breakdown by traveler type"
          data={data.tripsBySegment.map(s => ({
            name: s.segment,
            value: s.count,
            percentage: s.percentage,
          }))}
        />

        {/* Trip Status */}
        <PieChartComponent
          title="Trip Status"
          description="Current status distribution"
          data={data.tripsByStatus.map(s => ({
            name: getTripStatusLabel(s.status),
            value: s.count,
            percentage: s.percentage,
          }))}
          innerRadius={50}
        />

        {/* Budget Distribution */}
        <BarChartComponent
          title="Budget Distribution"
          description="Trips grouped by budget range"
          data={data.budgetDistribution.map(b => ({
            name: b.range,
            value: b.count,
          }))}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Places */}
        <TopPlaces places={data.topPlaces} />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest trips created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Route className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}