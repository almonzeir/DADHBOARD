// src/app/(dashboard)/page.tsx

'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subMonths } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useAdvancedAnalytics } from '@/hooks/use-analytics';
import { AnalyticsLayers } from '@/components/dashboard/analytics-layers';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { VisualReport } from '@/components/reports/visual-report';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/utils';
import { generateVisualReport } from '@/lib/export-utils';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { admin } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useAdvancedAnalytics(
    dateRange?.from && dateRange?.to
      ? { from: dateRange.from, to: dateRange.to }
      : undefined
  );

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      await generateVisualReport('visual-report-container', 'MaiKedah_Executive_Report');
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            MaiKedah Analytics Suite
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="glass text-xs py-1 px-3 border-emerald-500/30 text-emerald-400">
              {getRoleDisplayName(admin?.role || '')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Welcome back, {admin?.full_name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button
            onClick={handleExportReport}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
          >
            {isExporting ? (
              'Generating...'
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analytics Layers */}
      <AnalyticsLayers data={data} />

      {/* Hidden Report Container for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div id="visual-report-container">
          <VisualReport data={data} dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
}
