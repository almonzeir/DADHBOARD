// src/app/(dashboard)/reports/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useReports } from '@/hooks/use-reports';
import { useDistricts } from '@/hooks/use-districts';
import { useTripStats } from '@/hooks/use-trips';
import { ReportCard } from '@/components/reports/report-card';
import { ReportFilters } from '@/components/reports/report-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Route,
  MapPin,
  Map,
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { admin } = useAuth();
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const { data: tripStats, isLoading: statsLoading } = useTripStats();
  const {
    isLoading,
    generateTripsReport,
    generatePlacesReport,
    generateDistrictsReport,
    generateAnalyticsReport,
  } = useReports();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    districtId: '',
    status: '',
  });

  const [placesCount, setPlacesCount] = useState(0);

  // Fetch places count
  useEffect(() => {
    const fetchPlacesCount = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { count } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      setPlacesCount(count || 0);
    };
    fetchPlacesCount();
  }, []);

  const handleExport = async (
    reportType: 'trips' | 'places' | 'districts' | 'analytics',
    format: 'csv' | 'pdf'
  ) => {
    let result;

    switch (reportType) {
      case 'trips':
        result = await generateTripsReport(format, {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          districtId: filters.districtId || undefined,
          status: filters.status || undefined,
        });
        break;
      case 'places':
        result = await generatePlacesReport(format, {
          districtId: filters.districtId || undefined,
        });
        break;
      case 'districts':
        result = await generateDistrictsReport(format);
        break;
      case 'analytics':
        result = await generateAnalyticsReport(format, {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });
        break;
    }

    if (result?.success) {
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded`);
    } else {
      toast.error(result?.error || 'Failed to generate report');
    }
  };

  const canAccessReports = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  if (!canAccessReports) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export data reports
          </p>
        </div>
        <ReportFilters
          districts={districts}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Route className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{tripStats.total}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Places</p>
                <p className="text-xl font-bold">{placesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Map className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Districts</p>
                {districtsLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{districts.length}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-xl font-bold">{formatCurrency(tripStats.totalBudget)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trips Report */}
        <ReportCard
          title="Trips Report"
          description="Export all travel plans with details"
          icon={Route}
          iconColor="text-blue-600"
          stats={[
            { label: 'Total', value: tripStats.total },
            { label: 'Completed', value: tripStats.completed },
            { label: 'Active', value: tripStats.active },
          ]}
          onExportCSV={() => handleExport('trips', 'csv')}
          onExportPDF={() => handleExport('trips', 'pdf')}
          isLoading={isLoading}
        />

        {/* Places Report */}
        <ReportCard
          title="Places Report"
          description="Export all registered places"
          icon={MapPin}
          iconColor="text-green-600"
          stats={[
            { label: 'Total', value: placesCount },
          ]}
          onExportCSV={() => handleExport('places', 'csv')}
          onExportPDF={() => handleExport('places', 'pdf')}
          isLoading={isLoading}
        />

        {/* Districts Report */}
        <ReportCard
          title="Districts Report"
          description="Export district statistics"
          icon={Map}
          iconColor="text-purple-600"
          stats={[
            { label: 'Districts', value: districts.length },
          ]}
          onExportCSV={() => handleExport('districts', 'csv')}
          onExportPDF={() => handleExport('districts', 'pdf')}
          isLoading={isLoading}
        />

        {/* Analytics Report */}
        <ReportCard
          title="Analytics Summary"
          description="Export analytics overview"
          icon={BarChart3}
          iconColor="text-amber-600"
          stats={[
            { label: 'Travelers', value: tripStats.totalTravelers },
            { label: 'Avg Budget', value: formatCurrency(tripStats.total > 0 ? tripStats.totalBudget / tripStats.total : 0) },
          ]}
          onExportCSV={() => handleExport('analytics', 'csv')}
          onExportPDF={() => handleExport('analytics', 'pdf')}
          isLoading={isLoading}
        />
      </div>

      {/* Filter Info */}
      {(filters.startDate || filters.endDate || filters.districtId || filters.status) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Active Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-sm">
              {filters.startDate && (
                <span className="px-2 py-1 bg-muted rounded">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="px-2 py-1 bg-muted rounded">
                  To: {filters.endDate}
                </span>
              )}
              {filters.districtId && (
                <span className="px-2 py-1 bg-muted rounded">
                  District: {districts.find(d => d.id === filters.districtId)?.name}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-muted rounded">
                  Status: {filters.status}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Reports will be filtered based on these criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}