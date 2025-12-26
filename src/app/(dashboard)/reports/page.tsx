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
  Sparkles,
  ArrowRight,
  Loader2,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import * as AnalyticsService from '@/services/analytics.service';
import { Button } from '@/components/ui/button';

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
    fetchPlacesCount();
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportReport = async () => {
    try {
      setIsGenerating(true);

      const [
        { pdf },
        { saveAs },
        { IntelligenceReport }
      ] = await Promise.all([
        import('@react-pdf/renderer'),
        import('file-saver'),
        import('@/components/reports/IntelligenceReport')
      ]);

      const [kpiData, statsData, advancedData, nationalityData, segmentData, growthData, operationalData, psychoData] = await Promise.all([
        AnalyticsService.getDashboardKPIs(),
        AnalyticsService.getAiPerformanceStats(),
        AnalyticsService.getAdvancedInsights(),
        AnalyticsService.getNationalityStats(),
        AnalyticsService.getSegments(),
        AnalyticsService.getGrowthMetrics(),
        AnalyticsService.getOperationalInsights(),
        AnalyticsService.getSafeInsights()
      ]);

      const doc = <IntelligenceReport
        data={kpiData}
        stats={statsData}
        advanced={advancedData}
        nationalities={nationalityData}
        segments={segmentData}
        growth={growthData}
        operational={operationalData}
        psychographics={psychoData}
      />;

      const blob = await pdf(doc).toBlob();
      saveAs(blob, `MaiKedah_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Deep Dive Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate Deep Dive Report');
    } finally {
      setIsGenerating(false);
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HERO BANNER: Deep Dive Intelligence */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-green-600 p-8 md:p-10 shadow-2xl shadow-emerald-500/30">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-80 w-80 rounded-full bg-emerald-900/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-medium text-emerald-50 backdrop-blur-md border border-emerald-400/30">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Insights</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Deep Dive Intelligence Report
            </h1>
            <p className="max-w-xl text-lg text-emerald-50/90">
              Generate comprehensive analytics on visitor retention, spending behavior, and market demographics.
            </p>
          </div>

          <Button
            onClick={handleExportReport}
            disabled={isGenerating}
            size="lg"
            className="group relative bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 shadow-xl border-none transition-all duration-300 hover:scale-105 font-bold"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            )}
            {isGenerating ? 'Analyzing Data...' : 'Generate Full Report'}
            {!isGenerating && <ArrowRight className="ml-2 h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1" />}
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Standard Reports</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Export raw data tables and summaries
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
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-900 border border-blue-100 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Trips</p>
                {statsLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{tripStats.total.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Places</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{placesCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-900 border border-purple-100 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Map className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Districts</p>
                {districtsLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{districts.length}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-900 border border-amber-100 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Budget</p>
                {statsLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(tripStats.totalBudget)}</p>
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
    </motion.div>
  );
}