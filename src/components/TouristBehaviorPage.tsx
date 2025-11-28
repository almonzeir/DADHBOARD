import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Calendar, MapPin, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 📚 LEARNING: Types for our data (same as Overview Dashboard!)
type InterestCategoryData = {
  name: string;
  value: number;
  percentage: number;
};

type TravelCompanionData = {
  type: string;
  count: number;
};

type SeasonalityData = {
  month: string;
  visitors: number;
};

type CountryData = {
  name: string;
  count: number;
  percentage: number;
};

export default function TouristBehaviorPage() {
  // 📚 LEARNING: State for real data (same queries as Overview Dashboard!)
  const [interestData, setInterestData] = useState<InterestCategoryData[]>([]);
  const [companionData, setCompanionData] = useState<TravelCompanionData[]>([]);
  const [seasonalityData, setSeasonalityData] = useState<SeasonalityData[]>([]);
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [stats, setStats] = useState({
    totalTourists: 0,
    avgStay: 0,
    peakSeason: '',
    topOrigin: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');

  // 📚 LEARNING: Fetch ALL data when page loads (reusing Overview Dashboard queries!)
  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Top Countries
        const { data: tourists } = await supabase
          .from('tourists')
          .select('origin_country')
          .not('origin_country', 'is', null);

        const countryCounts: { [key: string]: number } = {};
        let totalTourists = 0;

        if (tourists) {
          tourists.forEach(tourist => {
            const country = tourist.origin_country;
            if (country) {
              countryCounts[country] = (countryCounts[country] || 0) + 1;
              totalTourists++;
            }
          });
        }

        const countryData: CountryData[] = Object.entries(countryCounts).map(([name, count]) => ({
          name,
          count,
          percentage: totalTourists > 0 ? (count / totalTourists) * 100 : 0
        }));

        countryData.sort((a, b) => b.count - a.count);
        setCountriesData(countryData);

        // 2️⃣ Interest Categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name');

        const categoryVisits: { [key: string]: number } = {};
        let totalCategoryVisits = 0;

        if (categoriesData) {
          for (const category of categoriesData) {
            const { data: categoryAttractions } = await supabase
              .from('attractions')
              .select('visits_count')
              .eq('category_id', category.id);

            const visits = categoryAttractions
              ? categoryAttractions.reduce((sum, a) => sum + (a.visits_count || 0), 0)
              : 0;

            if (visits > 0) {
              categoryVisits[category.name] = visits;
              totalCategoryVisits += visits;
            }
          }
        }

        const COLORS = ['#22c55e', '#84cc16', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#6366f1'];

        const interestDataResult: InterestCategoryData[] = Object.entries(categoryVisits).map(([name, value], index) => ({
          name,
          value,
          percentage: totalCategoryVisits > 0 ? (value / totalCategoryVisits) * 100 : 0,
          color: COLORS[index % COLORS.length]
        }));

        interestDataResult.sort((a, b) => b.value - a.value);
        setInterestData(interestDataResult);

        // 3️⃣ Travel Companions
        const { data: travelPlansData } = await supabase
          .from('travel_plans')
          .select('visitor_segment')
          .not('visitor_segment', 'is', null);

        const companionCounts: { [key: string]: number } = {};

        if (travelPlansData) {
          travelPlansData.forEach(plan => {
            const segment = plan.visitor_segment;
            if (segment) {
              companionCounts[segment] = (companionCounts[segment] || 0) + 1;
            }
          });
        }

        const companionDataResult: TravelCompanionData[] = Object.entries(companionCounts).map(([type, count]) => ({
          type,
          count
        }));

        const companionOrder = ['Solo', 'Couple', 'Family', 'Friends', 'Group'];
        companionDataResult.sort((a, b) => {
          const indexA = companionOrder.indexOf(a.type);
          const indexB = companionOrder.indexOf(b.type);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCompanionData(companionDataResult);

        // 4️⃣ Seasonality Trends
        const currentYear = parseInt(selectedYear);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const seasonalData: SeasonalityData[] = [];

        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(currentYear, month, 1);
          const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);

          const { count: monthVisitors } = await supabase
            .from('travel_plans')
            .select('*', { count: 'exact', head: true })
            .gte('start_date', monthStart.toISOString().split('T')[0])
            .lte('start_date', monthEnd.toISOString().split('T')[0]);

          seasonalData.push({
            month: monthNames[month],
            visitors: monthVisitors || 0
          });
        }

        setSeasonalityData(seasonalData);

        // 5️⃣ Calculate stats
        const peakMonth = seasonalData.reduce((max, curr) => curr.visitors > max.visitors ? curr : max, seasonalData[0]);

        // Calculate average stay from travel_plans
        const { data: allPlans } = await supabase
          .from('travel_plans')
          .select('start_date, end_date')
          .not('start_date', 'is', null)
          .not('end_date', 'is', null);

        let avgStay = 0;
        if (allPlans && allPlans.length > 0) {
          const totalDays = allPlans.reduce((sum, plan) => {
            const start = new Date(plan.start_date);
            const end = new Date(plan.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + (days > 0 ? days : 0);
          }, 0);
          avgStay = totalDays / allPlans.length;
        }

        setStats({
          totalTourists,
          avgStay,
          peakSeason: peakMonth ? peakMonth.month : 'N/A',
          topOrigin: countryData[0]?.name || 'N/A',
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedYear]); // Re-fetch when year changes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Tourist Behavior & Segments</h1>
          <p className="text-neutral-600">Comprehensive analysis of visitor patterns and preferences</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Tourists</p>
                <p className="text-2xl">{stats.totalTourists.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg Stay</p>
                <p className="text-2xl">{stats.avgStay > 0 ? `${stats.avgStay.toFixed(1)} days` : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Peak Season</p>
                <p className="text-xl">{stats.peakSeason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Top Origin</p>
                <p className="text-xl">{stats.topOrigin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interest Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Categories</CardTitle>
            <p className="text-sm text-neutral-600">What tourists are interested in</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interestData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Travel Companions */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Companions</CardTitle>
            <p className="text-sm text-neutral-600">Who tourists travel with</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="type" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [value.toLocaleString(), 'Travelers']}
                />
                <Bar dataKey="count" fill="url(#companionGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="companionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Seasonality Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seasonality Trends</CardTitle>
              <p className="text-sm text-neutral-600">Visitor volume throughout the year</p>
            </div>
            <Select defaultValue="2025" onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seasonalityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <p className="text-sm text-neutral-600">Tourist origin by country</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countriesData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-700">{item.country}</span>
                  <span className="text-sm">{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-lime-400"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}