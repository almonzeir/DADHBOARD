// src/hooks/use-reports.tsx
'use client';

import { useState } from 'react';
import {
  getTripsReportData,
  getPlacesReportData,
  getDistrictsReportData,
  getAnalyticsSummary,
  ReportFilters,
} from '@/services/reports.service';
import * as AnalyticsService from '@/services/analytics.service';
import {
  convertToCSV,
  downloadCSV,
  generatePDFReport,
  TRIPS_REPORT_COLUMNS,
  PLACES_REPORT_COLUMNS,
  DISTRICTS_REPORT_COLUMNS,
} from '@/lib/export-utils';
import { formatCurrency } from '@/lib/utils';

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);

  // Generate Trips Report
  const generateTripsReport = async (
    format: 'csv' | 'pdf',
    filters?: ReportFilters
  ) => {
    setIsLoading(true);
    try {
      const data = await getTripsReportData(filters);
      const summary = await getAnalyticsSummary(filters);

      if (format === 'csv') {
        const csv = convertToCSV(data, TRIPS_REPORT_COLUMNS);
        downloadCSV(csv, 'trips_report');
      } else {
        generatePDFReport({
          title: 'Trips Report',
          subtitle: filters?.startDate && filters?.endDate
            ? `Period: ${filters.startDate} to ${filters.endDate}`
            : 'All Time',
          columns: TRIPS_REPORT_COLUMNS,
          data,
          summary: [
            { label: 'Total Trips', value: summary.totalTrips },
            { label: 'Total Travelers', value: summary.totalTravelers },
            { label: 'Total Budget', value: formatCurrency(summary.totalBudget) },
            { label: 'Avg Budget', value: formatCurrency(summary.avgBudget) },
            { label: 'Completed', value: summary.completedTrips },
            { label: 'Active', value: summary.activeTrips },
          ],
          orientation: 'landscape',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating trips report:', error);
      return { success: false, error: 'Failed to generate report' };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Places Report
  const generatePlacesReport = async (
    format: 'csv' | 'pdf',
    filters?: { districtId?: string; category?: string; isActive?: boolean }
  ) => {
    setIsLoading(true);
    try {
      const data = await getPlacesReportData(filters);

      if (format === 'csv') {
        const csv = convertToCSV(data, PLACES_REPORT_COLUMNS);
        downloadCSV(csv, 'places_report');
      } else {
        generatePDFReport({
          title: 'Places Report',
          subtitle: `Total: ${data.length} places`,
          columns: PLACES_REPORT_COLUMNS,
          data,
          summary: [
            { label: 'Total Places', value: data.length },
            { label: 'Active', value: data.filter(p => p.is_active === 'Active').length },
            { label: 'Hidden Gems', value: data.filter(p => p.is_hidden_gem === 'Yes').length },
          ],
          orientation: 'landscape',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating places report:', error);
      return { success: false, error: 'Failed to generate report' };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Districts Report
  const generateDistrictsReport = async (format: 'csv' | 'pdf') => {
    setIsLoading(true);
    try {
      const data = await getDistrictsReportData();

      if (format === 'csv') {
        const csv = convertToCSV(data, DISTRICTS_REPORT_COLUMNS);
        downloadCSV(csv, 'districts_report');
      } else {
        const totalPlaces = data.reduce((sum, d) => sum + d.places_count, 0);
        const totalTrips = data.reduce((sum, d) => sum + d.trips_count, 0);

        generatePDFReport({
          title: 'Districts Report',
          subtitle: 'Kedah Tourism Districts Overview',
          columns: DISTRICTS_REPORT_COLUMNS,
          data,
          summary: [
            { label: 'Total Districts', value: data.length },
            { label: 'Total Places', value: totalPlaces },
            { label: 'Total Trips', value: totalTrips },
          ],
          orientation: 'portrait',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating districts report:', error);
      return { success: false, error: 'Failed to find report' };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Analytics Summary Report
  const generateAnalyticsReport = async (
    format: 'csv' | 'pdf',
    filters?: ReportFilters
  ) => {
    setIsLoading(true);
    try {
      const summary = await getAnalyticsSummary(filters);

      // Convert summary to tabular format
      const statusData = Object.entries(summary.tripsByStatus).map(([status, count]) => ({
        category: 'Status',
        item: status,
        count,
      }));

      const segmentData = Object.entries(summary.tripsBySegment).map(([segment, count]) => ({
        category: 'Visitor Segment',
        item: segment,
        count,
      }));

      const districtData = summary.topDistricts.map(d => ({
        category: 'Top District',
        item: d.name,
        count: d.count,
      }));

      const data = [...statusData, ...segmentData, ...districtData];

      const columns = [
        { key: 'category', label: 'Category', width: 40 },
        { key: 'item', label: 'Item', width: 50 },
        { key: 'count', label: 'Count', width: 30 },
      ];

      if (format === 'csv') {
        const csv = convertToCSV(data, columns);
        downloadCSV(csv, 'analytics_report');
      } else {
        generatePDFReport({
          title: 'Analytics Summary Report',
          subtitle: filters?.startDate && filters?.endDate
            ? `Period: ${filters.startDate} to ${filters.endDate}`
            : 'All Time',
          columns,
          data,
          summary: [
            { label: 'Total Trips', value: summary.totalTrips },
            { label: 'Total Travelers', value: summary.totalTravelers },
            { label: 'Total Budget', value: formatCurrency(summary.totalBudget) },
            { label: 'Avg Budget/Trip', value: formatCurrency(summary.avgBudget) },
            { label: 'Completion Rate', value: `${summary.totalTrips > 0 ? Math.round((summary.completedTrips / summary.totalTrips) * 100) : 0}%` },
          ],
          orientation: 'portrait',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return { success: false, error: 'Failed to generate report' };
    } finally {
      setIsLoading(false);
    }
  };

  // New Executive Intelligence Report (World-Class Wide Format)
  const generateExecutiveReport = async () => {
    setIsLoading(true);
    try {
      // Dynamic imports for PDF engine to optimize bundle
      const [
        { pdf },
        { saveAs },
        { EnhancedIntelligenceReport }
      ] = await Promise.all([
        import('@react-pdf/renderer'),
        import('file-saver'),
        import('@/components/reports/EnhancedIntelligenceReport')
      ]);

      // 1. Fetch ALL Analytics Engines Fresh
      const [
        kpis, statsData, advanced, nationalities,
        segments, operational, growth, psychographics
      ] = await Promise.all([
        AnalyticsService.getDashboardKPIs(),
        AnalyticsService.getAiPerformanceStats(),
        AnalyticsService.getAdvancedInsights(),
        AnalyticsService.getNationalityStats(),
        AnalyticsService.getSegments(),
        AnalyticsService.getOperationalInsights(),
        AnalyticsService.getGrowthMetrics(),
        AnalyticsService.getSafeInsights(),
      ]);

      // 2. Generate PDF Document
      const doc = (
        <EnhancedIntelligenceReport
          data={kpis}
          stats={statsData}
          advanced={advanced}
          nationalities={nationalities}
          segments={segments}
          operational={operational}
          growth={growth}
          psychographics={psychographics}
        />
      );

      const blob = await pdf(doc).toBlob();

      // 3. Save with Executive Branding
      saveAs(blob, `MAIKEDAH_EXECUTIVE_INTEL_${new Date().toISOString().split('T')[0]}.pdf`);

      return { success: true };
    } catch (error) {
      console.error('Error in generateExecutiveReport:', error);
      return { success: false, error: 'Failed to generate strategic report' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateTripsReport,
    generatePlacesReport,
    generateDistrictsReport,
    generateAnalyticsReport,
    generateExecutiveReport,
  };
}
