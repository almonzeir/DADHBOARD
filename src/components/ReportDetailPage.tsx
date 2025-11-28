import { ArrowLeft, Download, Printer, Share2, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ReportDetailPageProps {
  onBack: () => void;
}

const monthlyData = [
  { week: 'Week 1', tourists: 2800, trips: 1850 },
  { week: 'Week 2', tourists: 3100, trips: 2100 },
  { week: 'Week 3', tourists: 3400, trips: 2180 },
  { week: 'Week 4', tourists: 3158, trips: 2104 },
];

const categoryData = [
  { name: 'Nature & Adventure', value: 35, color: '#22c55e' },
  { name: 'Culture & Heritage', value: 28, color: '#84cc16' },
  { name: 'Beach & Relaxation', value: 18, color: '#3b82f6' },
  { name: 'Shopping & Dining', value: 12, color: '#a855f7' },
  { name: 'Others', value: 7, color: '#f59e0b' },
];

const topAttractions = [
  { name: 'Langkawi Sky Bridge', visits: 2145 },
  { name: 'Underwater World', visits: 1892 },
  { name: 'Gunung Jerai', visits: 1654 },
  { name: 'Bujang Valley', visits: 1432 },
  { name: 'Paddy Museum', visits: 1287 },
];

export default function ReportDetailPage({ onBack }: ReportDetailPageProps) {
  const handleDownload = () => {
    toast.loading('Downloading report...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Report downloaded successfully! Check your downloads folder.', { duration: 3000 });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-3 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">November 2025 Tourism Report</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>2025-11-01 to 2025-11-30</span>
              </div>
              <span>•</span>
              <span>Generated on November 16, 2025</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-green-50 to-lime-50 border-green-200">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-neutral-600 mb-1">Total Active Tourists</p>
              <p className="text-3xl mb-1">12,458</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-neutral-600 mb-1">Trips Generated</p>
              <p className="text-3xl mb-1">8,234</p>
              <p className="text-sm text-green-600">+8.2% from last month</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-neutral-600 mb-1">Average Rating</p>
              <p className="text-3xl mb-1">4.7/5</p>
              <p className="text-sm text-green-600">+0.2 from last month</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-neutral-600 mb-1">Avg Trip Duration</p>
              <p className="text-3xl mb-1">3.2 days</p>
              <p className="text-sm text-neutral-600">Same as last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="mb-1">Strong Growth in International Visitors</p>
                <p className="text-sm text-neutral-600">International tourist arrivals increased by 18% compared to October, with significant growth from Asian markets.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="mb-1">AI Itinerary Adoption at Record High</p>
                <p className="text-sm text-neutral-600">85% of tourists used AI-generated itineraries, up from 78% in October, showing strong platform engagement.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="mb-1">Langkawi Maintains Top Position</p>
                <p className="text-sm text-neutral-600">Langkawi attractions continue to dominate with 62% of all visits, followed by Alor Setar at 23%.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trend</CardTitle>
          <p className="text-sm text-neutral-600">Tourist arrivals and trip generation by week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="week" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip />
              <Line type="monotone" dataKey="tourists" stroke="#22c55e" strokeWidth={3} name="Tourists" />
              <Line type="monotone" dataKey="trips" stroke="#84cc16" strokeWidth={3} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Attractions */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topAttractions} layout="vertical">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" stroke="#737373" />
                <YAxis dataKey="name" type="category" width={120} stroke="#737373" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="visits" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-neutral-50">
              <p className="mb-1">Capitalize on International Growth</p>
              <p className="text-sm text-neutral-600">Increase marketing efforts in high-growth markets (Singapore, Thailand, China) and ensure multilingual content is available.</p>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-neutral-50">
              <p className="mb-1">Diversify Attraction Portfolio</p>
              <p className="text-sm text-neutral-600">While Langkawi performs well, promote underutilized attractions in Alor Setar and Sungai Petani to distribute tourist flow.</p>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-neutral-50">
              <p className="mb-1">Enhance Cultural Heritage Experiences</p>
              <p className="text-sm text-neutral-600">Cultural attractions showed 28% interest but lower satisfaction scores. Consider improving visitor experiences and interpretive materials.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card className="bg-neutral-50">
        <CardHeader>
          <CardTitle>Methodology & Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 mb-3">
            This report is generated from data collected through the MaiKedah Tourism Intelligence System mobile application and admin platform during the period of November 1-30, 2025.
          </p>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
            <li>Tourist activity tracking via mobile app GPS and check-ins</li>
            <li>AI-generated itinerary usage and completion rates</li>
            <li>User ratings and feedback submissions</li>
            <li>Attraction visit counts and dwell times</li>
            <li>Demographic data from user profiles</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}