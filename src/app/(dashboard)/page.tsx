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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Download, Calendar, ArrowRight, Zap, Activity, TrendingUp, BarChart3, Loader2, Users, Target, Globe, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useReports } from '@/hooks/use-reports';

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
    // 1. DATE RANGE STATE
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        label: 'Last 30 Days'
    });

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
    } = useAnalyticsData({ startDate: dateRange.startDate, endDate: dateRange.endDate });

    const { generateExecutiveReport, isLoading: isGenerating } = useReports();

    // Date Range Presets
    const setRange = (days: number, label: string) => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
        setDateRange({ startDate: start, endDate: end, label });
    };

    if (isLoading) {
        return (
            <div className="space-y-8 p-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-72 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-10 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                    <Skeleton className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="grid gap-6 md:grid-cols-12">
                    <Skeleton className="col-span-8 h-96 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="col-span-4 h-96 rounded-xl bg-slate-200 dark:bg-slate-800" />
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
                                Showing data for {dateRange.label} ({dateRange.startDate} to {dateRange.endDate})
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select onValueChange={(val) => {
                        if (val === '7') setRange(7, 'Last 7 Days');
                        if (val === '30') setRange(30, 'Last 30 Days');
                        if (val === '90') setRange(90, 'Last 90 Days');
                        if (val === '365') setRange(365, 'Last Year');
                    }}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                            <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                            <SelectValue placeholder={dateRange.label} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                            <SelectItem value="365">Last Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <ReportButton />
                </div>
            </motion.div>

            <div id="dashboard-container" className="space-y-6">
                {/* Analytics Sections */}
                <motion.section initial="hidden" animate="show" variants={stagger}>
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">The Pulse</h3>
                    </div>
                    <AnalyticsKpiCards data={kpis} />
                </motion.section>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-12">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="h-4 w-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operational Intelligence</h3>
                        </div>
                        <OperationalInsightsCharts data={operational} />
                    </div>

                    <div className="md:col-span-8">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Economic Intelligence</h3>
                        </div>
                        <FinancialPerformanceChart data={financials} />
                    </div>

                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2 mb-4 opacity-0">.</div>
                        <PsychographicsRadar data={psychographics} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-cyan-500" />
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Safe Insights</h3>
                        </div>
                        <SafeInsightsCharts data={safe} />
                    </section>
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-4 w-4 text-rose-500" />
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Planning Intelligence</h3>
                        </div>
                        <MissingInsightsCharts data={missing} />
                    </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <NationalityChart data={nationalities} />
                    </div>
                    <div>
                        <UserStatsCharts />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                    <div className="md:col-span-4">
                        <AnalyticsTrendChart data={trends} />
                    </div>
                    <div className="md:col-span-3">
                        <AnalyticsPlacesChart data={places} />
                    </div>
                </div>

                {/* CTA Banner */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5 blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white opacity-5 blur-3xl" />

                        <div className="z-10 mb-4 md:mb-0 text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">Agency High-Yield Report</h3>
                            <p className="text-indigo-100 max-w-md">
                                Generate the full 10-page strategic intelligence portfolio with financial leakage audits and regional traffic heatmaps.
                            </p>
                        </div>
                        <Button
                            onClick={() => generateExecutiveReport()}
                            disabled={isGenerating}
                            className="z-10 bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105 px-8 h-12"
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Power Report (Landscape PDF)'}
                            {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
