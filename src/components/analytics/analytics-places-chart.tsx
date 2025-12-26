// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { MapPin, Trophy } from 'lucide-react';

interface PopularPlace {
  name: string;
  visits: number;
}

interface Props {
  data: PopularPlace[];
}

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

export function AnalyticsPlacesChart({ data }: Props) {
  const hasData = data && data.length > 0;
  const chartData = data.slice(0, 5);

  return (
    <Card className="col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Attractions
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Most visited places</p>
          </div>
          {hasData && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-0">
              Top {chartData.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fontWeight: 500, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-slate-600 dark:fill-slate-400"
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', className: 'fill-slate-100 dark:fill-slate-800' }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #0f172a)',
                    borderRadius: '12px',
                    border: '1px solid var(--tooltip-border, #1e293b)',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`${value} visits`, 'Popularity']}
                />
                <Bar dataKey="visits" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={COLORS[index % COLORS.length]} 
                      className="dark:drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MapPin className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No place data</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Trips with attractions will appear here
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

