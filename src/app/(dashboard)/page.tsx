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
import { SafeInsightsCharts } from '@/components/analytics/safe-insights-charts';
import { MissingInsightsCharts } from '@/components/analytics/missing-insights-charts';
import { NationalityChart } from '@/components/analytics/nationality-chart';
import { UserStatsCharts } from '@/components/analytics/user-stats-charts';
import { OperationalInsightsCharts } from '@/components/analytics/operational-insights-charts';
import ReportButton from '@/components/ReportButton';
import { Button } from '@/components/ui/button';
import { Download, Calendar, ArrowRight, Zap, Activity, TrendingUp, BarChart3, Loader2, Users, Target, Globe, Briefcase } from 'lucide-react';
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

export default function DashboardPage() {
    const {
        kpis,
        trends,
        places,
        districts,
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
            const [kpiData, statsData, advancedData] = await Promise.all([
                AnalyticsService.getDashboardKPIs(),
                AnalyticsService.getAiPerformanceStats(),
                AnalyticsService.getAdvancedInsights()
            ]);

            // 2. Generate PDF Blob
            const doc = <IntelligenceReport
                data={kpiData}
                stats={statsData}
                advanced={advancedData}
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
                    <ReportButton />
                </div>
            </motion.div>

            <div id="dashboard-container" className="space-y-6">

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

                {/* ROW 1.5: Operational Intelligence - Planning, Revenue, Discipline */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Operational Intelligence
                        </h3>
                    </div>
                    <OperationalInsightsCharts />
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

                {/* ROW 2.5: Safe Insights - Demographics, Value & Interests */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-cyan-500" />
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Safe Insights
                        </h3>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <SafeInsightsCharts />
                    </motion.div>
                </motion.section>

                {/* ROW 2.75: Missing Insights - Realism, Intensity & Geography */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <motion.div variants={fadeIn} className="flex items-center gap-2 mb-4">
                        <Target className="h-4 w-4 text-rose-500" />
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Planning Intelligence
                        </h3>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <MissingInsightsCharts />
                    </motion.div>
                </motion.section>

                {/* ROW 2.9: Global Reach - Nationality */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <NationalityChart />
                </motion.section>

                {/* ROW 2.95: Traveler Profile - Age & Completion */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <UserStatsCharts />
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

                {/* ROW 6: CTA Banner */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5 blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white opacity-5 blur-3xl" />

                        <div className="z-10 mb-4 md:mb-0 text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">Deep Dive Report</h3>
                            <p className="text-indigo-100 max-w-md">
                                Get AI-powered insights on visitor retention, spending habits, and predictive analytics.
                            </p>
                        </div>
                        <Button
                            onClick={handleExportReport}
                            disabled={isGenerating}
                            className="z-10 bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Full Report'}
                            {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
