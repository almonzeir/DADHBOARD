// @ts-nocheck
// src/components/analytics/charts.tsx

'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const PASTEL_COLORS = [
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // yellow
  '#f87171', // red
  '#a78bfa', // purple
  '#fb923c', // orange
];

// ============================================
// TREND CHART (Area)
// ============================================

interface TrendChartProps {
  title: string;
  description?: string;
  data: { date: string; trips: number; travelers: number }[];
}

export function TrendChart({ title, description, data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTravelers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="trips"
                name="Trips"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTrips)"
              />
              <Area
                type="monotone"
                dataKey="travelers"
                name="Travelers"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorTravelers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// BAR CHART
// ============================================

interface BarChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number; secondary?: number }[];
  dataKey?: string;
  secondaryDataKey?: string;
  layout?: 'vertical' | 'horizontal';
}

export function BarChartComponent({
  title,
  description,
  data,
  dataKey = 'value',
  secondaryDataKey,
  layout = 'horizontal',
}: BarChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    name: item.name,
    [dataKey]: item.value,
    ...(secondaryDataKey && item.secondary !== undefined ? { [secondaryDataKey]: item.secondary } : {}),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {layout === 'vertical' ? (
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey={dataKey} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                {secondaryDataKey && (
                  <Bar dataKey={secondaryDataKey} fill="#10b981" radius={[0, 4, 4, 0]} />
                )}
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey={dataKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                {secondaryDataKey && (
                  <Bar dataKey={secondaryDataKey} fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// PIE/DONUT CHART
// ============================================

interface PieChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number; percentage?: number }[];
  innerRadius?: number;
  showLegend?: boolean;
}

export function PieChartComponent({
  title,
  description,
  data,
  innerRadius = 60,
  showLegend = true,
}: PieChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: PASTEL_COLORS[index % PASTEL_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percentage }) => 
                  percentage !== undefined ? `${name} (${percentage.toFixed(0)}%)` : name
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// STAT CARD WITH TREND
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs previous period',
  icon,
  iconColor = 'bg-primary/10 text-primary',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(change).toFixed(1)}%</span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
