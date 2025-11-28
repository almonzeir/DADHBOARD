import { FileText, Download, Eye, TrendingUp, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ReportsPageProps {
  onViewDetail: () => void;
}

// 📚 LEARNING: Type for monthly report
type MonthlyReport = {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  highlights: {
    tourists: string;
    trips: string;
    avgRating: string;
    topDestination: string;
  };
};

export default function ReportsPage({ onViewDetail }: ReportsPageProps) {
  // \ud83d\udcda LEARNING: State for dynamically generated reports
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // \ud83d\udcda LEARNING: Generate reports for last 12 months
  useEffect(() => {
    async function generateReports() {
      try {
        const reports: MonthlyReport[] = [];
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];

        // Generate reports for last 12 months
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const monthStart = new Date(year, month, 1);
          const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

          const startStr = monthStart.toISOString().split('T')[0];
          const endStr = monthEnd.toISOString().split('T')[0];

          // 1️⃣ Count tourists (created in this month)
          const { count: touristCount } = await supabase
            .from('tourists')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          // 2️⃣ Count trips (started in this month)
          const { count: tripCount } = await supabase
            .from('travel_plans')
            .select('*', { count: 'exact', head: true })
            .gte('start_date', startStr)
            .lte('start_date', endStr);

          // 3️⃣ Calculate average rating (reviews in this month)
          const { data: monthReviews } = await supabase
            .from('reviews')
            .select('rating')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          const avgRating = monthReviews && monthReviews.length > 0
            ? (monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length).toFixed(1)
            : '0.0';

          // 4️⃣ Find top destination (most visited attraction)
          const { data: monthVisits } = await supabase
            .from('visits')
            .select('attraction_id')
            .gte('visit_date', monthStart.toISOString())
            .lte('visit_date', monthEnd.toISOString());

          let topDestination = 'N/A';
          if (monthVisits && monthVisits.length > 0) {
            const attractionCounts: { [key: string]: number } = {};
            monthVisits.forEach(v => {
              attractionCounts[v.attraction_id] = (attractionCounts[v.attraction_id] || 0) + 1;
            });
            const topAttractionId = Object.entries(attractionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

            if (topAttractionId) {
              const { data: attraction } = await supabase
                .from('attractions')
                .select('name')
                .eq('id', topAttractionId)
                .single();
              topDestination = attraction?.name || 'N/A';
            }
          }

          reports.push({
            id: (i + 1).toString(),
            title: `${monthNames[month]} ${year} Tourism Report`,
            type: 'Monthly Summary',
            date: `${year}-${String(month + 1).padStart(2, '0')}-01 to ${endStr}`,
            status: i === 0 ? 'Current' : 'Completed',
            highlights: {
              tourists: (touristCount || 0).toLocaleString(),
              trips: (tripCount || 0).toLocaleString(),
              avgRating,
              topDestination,
            },
          });
        }

        setMonthlyReports(reports);
      } catch (error) {
        console.error('Error generating reports:', error);
      } finally {
        setLoading(false);
      }
    }

    generateReports();
  }, []);

  const handleDownload = (reportTitle: string) => {
    toast.loading(`Downloading "${reportTitle}"...`, { duration: 2000 });
    setTimeout(() => {
      toast.success(`"${reportTitle}" downloaded successfully! Check your downloads folder.`, { duration: 3000 });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reports & Exports</h1>
          <p className="text-neutral-600">Generate and download tourism performance reports</p>
        </div>
      </div>

      {/* Current Month Report */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-lime-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Current Tourism Report
              </CardTitle>
              <p className="text-sm text-neutral-600 mt-1">{monthlyReports[0].date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onViewDetail}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-lime-400 text-white" onClick={() => handleDownload(monthlyReports[0].title)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <p className="text-sm text-neutral-600">Active Tourists</p>
              </div>
              <p className="text-2xl">{monthlyReports[0].highlights.tourists}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-neutral-600">Trips Generated</p>
              </div>
              <p className="text-2xl">{monthlyReports[0].highlights.trips}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-neutral-600">Avg Rating</p>
              </div>
              <p className="text-2xl">{monthlyReports[0].highlights.avgRating}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-neutral-600">Top Destination</p>
              </div>
              <p className="text-xl">{monthlyReports[0].highlights.topDestination}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Monthly Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Past Monthly Reports</CardTitle>
          <p className="text-sm text-neutral-600">Historical performance summaries</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyReports.slice(1).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-lime-400 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p>{report.title}</p>
                    <p className="text-sm text-neutral-600">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onViewDetail}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report.title)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
