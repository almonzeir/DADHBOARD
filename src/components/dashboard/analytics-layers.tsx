// src/components/dashboard/analytics-layers.tsx

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  TrendChart,
  BarChartComponent,
  PieChartComponent,
  StatCard
} from '@/components/analytics/charts';
import { TopPlaces } from '@/components/analytics/top-places';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  Target,
  Map,
  Activity,
  Zap,
  TrendingUp,
  BrainCircuit,
  Globe
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTripStatusLabel } from '@/lib/constants';
import type { AnalyticsData } from '@/services/analytics-advanced.service';

interface AnalyticsLayersProps {
  data: AnalyticsData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Layer A: Psychographics (The "Who")
function PsychographicsLayer({ data }: { data: AnalyticsData }) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-bold tracking-tight">Psychographics Engine</h2>
        <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-500">Layer A</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PieChartComponent
          title="Traveler DNA"
          description="Visitor segment breakdown"
          data={data.tripsBySegment.map(s => ({
            name: s.segment,
            value: s.count,
            percentage: s.percentage,
          }))}
          innerRadius={60}
        />

        <BarChartComponent
          title="Interest Heatmap"
          description="Trip types and preferences"
          data={data.tripsByStatus.map(s => ({
            name: getTripStatusLabel(s.status),
            value: s.count,
          }))}
          layout="horizontal"
        />
      </div>
    </motion.div>
  );
}

// Layer B: Operations (The Business)
function OperationsLayer({ data }: { data: AnalyticsData }) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-bold tracking-tight">Operations Command</h2>
        <Badge variant="outline" className="text-xs border-blue-500/20 text-blue-500">Layer B</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Yield"
          value={formatCurrency(data.overview.totalBudget)}
          change={data.comparison.budgetChange}
          icon={<DollarSign className="h-6 w-6" />}
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          title="Volume"
          value={data.overview.totalTrips}
          change={data.comparison.tripsChange}
          icon={<Zap className="h-6 w-6" />}
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Efficiency"
          value={`${data.overview.completionRate.toFixed(0)}%`}
          icon={<Target className="h-6 w-6" />}
          iconColor="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          title="Pax Load"
          value={data.overview.totalTravelers}
          change={data.comparison.travelersChange}
          icon={<Users className="h-6 w-6" />}
          iconColor="bg-purple-500/10 text-purple-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartComponent
          title="District Economy"
          description="Trip distribution by region"
          data={data.tripsByDistrict.slice(0, 8).map(d => ({
            name: d.district,
            value: d.trips,
          }))}
          layout="vertical"
        />

        <BarChartComponent
          title="Budget Discipline"
          description="Budget range distribution"
          data={data.budgetDistribution.map(b => ({
            name: b.range,
            value: b.count,
          }))}
        />
      </div>
    </motion.div>
  );
}

// Layer C: Behavior (The Experience)
function BehaviorLayer({ data }: { data: AnalyticsData }) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-bold tracking-tight">Behavioral Matrix</h2>
        <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-500">Layer C</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPlaces places={data.topPlaces} />

        <Card className="glass">
          <CardHeader>
            <CardTitle>Global Reach</CardTitle>
            <CardDescription>Tourist origin analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <p>Geospatial data integration pending</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Layer D: Growth (The Momentum)
function GrowthLayer({ data }: { data: AnalyticsData }) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-rose-500" />
        <h2 className="text-xl font-bold tracking-tight">Growth Momentum</h2>
        <Badge variant="outline" className="text-xs border-rose-500/20 text-rose-500">Layer D</Badge>
      </div>

      <TrendChart
        title="Revenue & Traffic Momentum"
        description="Historical performance trajectory"
        data={data.tripsTrend}
      />
    </motion.div>
  );
}

export function AnalyticsLayers({ data }: AnalyticsLayersProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-10"
    >
      <OperationsLayer data={data} />
      <PsychographicsLayer data={data} />
      <GrowthLayer data={data} />
      <BehaviorLayer data={data} />
    </motion.div>
  );
}
