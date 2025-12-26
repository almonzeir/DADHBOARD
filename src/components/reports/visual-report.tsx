// src/components/reports/visual-report.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { AnalyticsData } from '@/services/analytics-advanced.service';
import { DateRange } from 'react-day-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface VisualReportProps {
  data: AnalyticsData;
  dateRange: DateRange | undefined;
}

export function VisualReport({ data, dateRange }: VisualReportProps) {
  const dateStr = dateRange?.from && dateRange?.to
    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    : 'All Time';

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="w-[1200px] bg-slate-950 text-slate-50 p-12 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">EXECUTIVE ANALYTICS REPORT</h1>
          <p className="text-slate-400 text-lg uppercase tracking-widest">MaiKedah Tourism Agency</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-lg px-4 py-1 mb-2 border-emerald-500 text-emerald-500">
            OFFICIAL DOCUMENT
          </Badge>
          <p className="text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
          <p className="text-slate-500 text-sm">Period: {dateStr}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Yield', value: formatCurrency(data.overview.totalBudget), color: 'text-emerald-400' },
          { label: 'Total Trips', value: data.overview.totalTrips, color: 'text-blue-400' },
          { label: 'Total Pax', value: data.overview.totalTravelers, color: 'text-purple-400' },
          { label: 'Completion Rate', value: `${data.overview.completionRate.toFixed(0)}%`, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
            <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Figures Section */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* District Performance */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-6 text-slate-200 border-l-4 border-blue-500 pl-3">District Performance</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
             {/* Static rendering for PDF reliability */}
             <BarChart width={500} height={300} data={data.tripsByDistrict.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="district" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Bar dataKey="trips" fill="#3b82f6" radius={[0, 4, 4, 0]} />
             </BarChart>
          </div>
        </div>

        {/* Visitor Segments */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-6 text-slate-200 border-l-4 border-emerald-500 pl-3">Visitor Segmentation</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={data.tripsBySegment}
                dataKey="count"
                nameKey="segment"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label
              >
                {data.tripsBySegment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-slate-200 border-l-4 border-amber-500 pl-3">Top Performing Assets</h3>
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Asset Name</th>
              <th className="px-6 py-4">District</th>
              <th className="px-6 py-4 text-right">Visits</th>
              <th className="px-6 py-4 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 border-t border-slate-800">
            {data.topPlaces.map((place) => (
              <tr key={place.id} className="hover:bg-slate-900/30">
                <td className="px-6 py-4 font-medium text-slate-300">{place.name}</td>
                <td className="px-6 py-4">{place.district}</td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400">{place.visits}</td>
                <td className="px-6 py-4 text-right font-mono text-amber-400">{place.rating.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 pt-6 flex justify-between items-center text-slate-500 text-sm">
        <p>MaiKedah Analytics Suite v2.0</p>
        <p>Confidential & Proprietary</p>
      </div>
    </div>
  );
}
