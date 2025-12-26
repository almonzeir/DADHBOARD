// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import { AnalyticsKpiCards } from '@/components/analytics/analytics-kpi-cards';
import { AnalyticsTrendChart } from '@/components/analytics/analytics-trend-chart';
import { AnalyticsPlacesChart } from '@/components/analytics/analytics-places-chart';
import { AnalyticsDistrictRadar } from '@/components/analytics/analytics-district-radar';
import { AnalyticsScatterChart } from '@/components/analytics/analytics-scatter-chart';
import { AnalyticsBehaviorCharts } from '@/components/analytics/analytics-behavior-charts';
import { FinancialPerformanceChart } from '@/components/analytics/financial-performance-chart';
import { PsychographicsRadar } from '@/components/analytics/psychographics-radar';
import { NationalityChart } from '@/components/analytics/nationality-chart';
import { VisitorSegmentChart } from '@/components/analytics/VisitorSegmentChart';
import { Button } from '@/components/ui/button';
import { Download, Calendar, ArrowRight, Zap, Activity, TrendingUp, BarChart3, Loader2, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

import * as AnalyticsService from '@/services/analytics.service';

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 }
    }
};

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AnalyticsPage() {
    const {
        kpis,
        trends,
        places,
        districts,
        nationalities,
        segments,
        scatter,
        budgetTiers,
        tripPace,
        financials,
        psychographics,
        advancedStats,
        isLoading
    } = useAnalyticsData();

    const [isGenerating, setIsGenerating] = useState(false);

    const handleExportReport = async () => {
        try {
            setIsGenerating(true);

            // Dynamic imports to prevent SSR issues and keep bundle light
            // This ensures heavy client-only packages don't crash the server build
            const [
                { pdf },
                { saveAs },
                { IntelligenceReport }
            ] = await Promise.all([
                import('@react-pdf/renderer'),
                import('file-saver'),
                import('@/components/reports/IntelligenceReport')
            ]);

            // 1. Fetch ALL data fresh (ensure we have the latest insights)
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

            // 2. Generate PDF Blob
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

            // 3. Save to User's Device
            saveAs(blob, `MaiKedah_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 p-2">
                <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-12">
                    <Skeleton className="col-span-8 h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="col-span-4 h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-8 -m-4 md:-m-6 lg:-m-8 p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Mission Control
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Real-time analytics • Live data from MaiKedah
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button
                        onClick={handleExportReport}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25"
                    >
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isGenerating ? 'Generating...' : 'Export Report'}
                    </Button>
                </div>
            </motion.div>

            {/* ROW 1: The Pulse - KPI Cards */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        The Pulse
                    </h3>
                </motion.div>
                <AnalyticsKpiCards data={kpis} />
            </motion.section>

            {/* ROW 2: Economic Intelligence - Super Wide */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Economic Intelligence
                    </h3>
                </motion.div>
                <motion.div variants={fadeIn} className="grid grid-cols-12 gap-6">
                    <FinancialPerformanceChart data={financials} />
                    <PsychographicsRadar data={psychographics} />
                </motion.div>
            </motion.section>

            {/* ROW 3: Traffic & Popularity */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Traffic & Popularity
                    </h3>
                </motion.div>
                <motion.div variants={fadeIn} className="grid gap-6 md:grid-cols-7">
                    <AnalyticsTrendChart data={trends} />
                    <AnalyticsPlacesChart data={places} />
                </motion.div>
            </motion.section>

            {/* ROW 3.5: Global Reach */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Global Reach
                    </h3>
                </motion.div>
                <motion.div variants={fadeIn} className="grid gap-6 md:grid-cols-2">
                    <NationalityChart data={nationalities} />
                    <VisitorSegmentChart data={segments} />
                </motion.div>
            </motion.section>

            {/* ROW 4: Geographic & Spending Analysis */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="grid gap-6 md:grid-cols-7">
                    <AnalyticsScatterChart data={scatter} />
                    <AnalyticsDistrictRadar data={districts} />
                </motion.div>
            </motion.section>

            {/* ROW 5: Behavior Analytics - Deep Dive */}
            <motion.section
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="grid gap-6 md:grid-cols-7">
                    <AnalyticsBehaviorCharts
                        budgetData={budgetTiers}
                        paceData={tripPace}
                        advancedStats={advancedStats}
                    />
                </motion.div>
            </motion.section>


        </div>
    );
}
