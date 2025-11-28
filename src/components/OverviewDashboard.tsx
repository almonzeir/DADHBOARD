import { Users, TrendingUp, Clock, MapPin, DollarSign, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Define types for our data
type KpiData = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
};

type AttractionData = {
  name: string;
  visits: number;
};

type TrendData = {
  date: string;
  trips: number;
  tourists: number;
};

type DistrictData = {
  name: string;
  visits: number;
  percentage: number;
};

type CountryData = {
  name: string;
  count: number;
  percentage: number;
};

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

export default function OverviewDashboard() {
  const [kpiData, setKpiData] = useState<KpiData[]>([
    { title: 'Active Tourists', value: 'Loading...', change: '...', trend: 'up', icon: Users, color: 'from-green-500 to-lime-400' },
    { title: 'Trips Generated', value: 'Loading...', change: '...', trend: 'up', icon: TrendingUp, color: 'from-blue-500 to-cyan-400' },
    { title: 'Avg Trip Duration', value: 'Loading...', change: '...', trend: 'down', icon: Clock, color: 'from-purple-500 to-pink-400' },
    { title: 'Top Destinations', value: 'Loading...', change: '...', trend: 'up', icon: MapPin, color: 'from-orange-500 to-amber-400' },
    { title: 'Avg Budget', value: 'Loading...', change: '...', trend: 'up', icon: DollarSign, color: 'from-emerald-500 to-teal-400' },
    { title: 'Overall Rating', value: 'Loading...', change: '...', trend: 'up', icon: Star, color: 'from-yellow-500 to-orange-400' },
  ]);

  const [topAttractionsData, setTopAttractionsData] = useState<AttractionData[]>([]);
  const [tripsTrendData, setTripsTrendData] = useState<TrendData[]>([]);
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [topCountriesData, setTopCountriesData] = useState<CountryData[]>([]);
  const [interestCategoriesData, setInterestCategoriesData] = useState<InterestCategoryData[]>([]);
  const [travelCompanionsData, setTravelCompanionsData] = useState<TravelCompanionData[]>([]);
  const [seasonalityData, setSeasonalityData] = useState<SeasonalityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Active Tourists (current month vs previous month)
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const { count: touristsCount } = await supabase
          .from('tourists')
          .select('*', { count: 'exact', head: true });

        const { count: touristsLastMonth } = await supabase
          .from('tourists')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', currentMonthStart.toISOString());

        const touristsThisMonth = (touristsCount || 0) - (touristsLastMonth || 0);
        const touristsChange = touristsLastMonth && touristsLastMonth > 0
          ? ((touristsThisMonth / touristsLastMonth) * 100).toFixed(1)
          : '0';

        // 2. Fetch Trips Generated (current month vs previous month)
        const { count: tripsCount } = await supabase
          .from('travel_plans')
          .select('*', { count: 'exact', head: true });

        const { count: tripsLastMonth } = await supabase
          .from('travel_plans')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousMonthStart.toISOString())
          .lt('created_at', currentMonthStart.toISOString());

        const { count: tripsThisMonth } = await supabase
          .from('travel_plans')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentMonthStart.toISOString());

        const tripsChange = tripsLastMonth && tripsLastMonth > 0
          ? (((tripsThisMonth || 0) - tripsLastMonth) / tripsLastMonth * 100).toFixed(1)
          : '0';

        // 3. Calculate Average Trip Duration
        const { data: tripsWithDates } = await supabase
          .from('travel_plans')
          .select('start_date, end_date')
          .not('start_date', 'is', null)
          .not('end_date', 'is', null);

        let avgDuration = 0;
        let durationChange = '0';
        if (tripsWithDates && tripsWithDates.length > 0) {
          const durations = tripsWithDates.map(trip => {
            const start = new Date(trip.start_date);
            const end = new Date(trip.end_date);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          });
          avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

          // Calculate previous month average for comparison
          const { data: tripsLastMonthDates } = await supabase
            .from('travel_plans')
            .select('start_date, end_date')
            .gte('created_at', previousMonthStart.toISOString())
            .lt('created_at', currentMonthStart.toISOString())
            .not('start_date', 'is', null)
            .not('end_date', 'is', null);

          if (tripsLastMonthDates && tripsLastMonthDates.length > 0) {
            const lastMonthDurations = tripsLastMonthDates.map(trip => {
              const start = new Date(trip.start_date);
              const end = new Date(trip.end_date);
              return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            });
            const lastMonthAvg = lastMonthDurations.reduce((sum, d) => sum + d, 0) / lastMonthDurations.length;
            durationChange = (avgDuration - lastMonthAvg).toFixed(1);
          }
        }

        // 4. Fetch Top Attractions
        const { data: attractions } = await supabase
          .from('attractions')
          .select('name, visits_count')
          .order('visits_count', { ascending: false })
          .limit(10);

        // 5. Calculate Avg Budget (current month vs previous month)
        const { data: budgetData } = await supabase
          .from('travel_plans')
          .select('budget')
          .not('budget', 'is', null);

        let avgBudget = 0;
        let budgetChange = '0';
        if (budgetData && budgetData.length > 0) {
          const totalBudget = budgetData.reduce((sum, trip) => sum + (trip.budget || 0), 0);
          avgBudget = totalBudget / budgetData.length;

          // Previous month budget
          const { data: budgetLastMonth } = await supabase
            .from('travel_plans')
            .select('budget')
            .gte('created_at', previousMonthStart.toISOString())
            .lt('created_at', currentMonthStart.toISOString())
            .not('budget', 'is', null);

          if (budgetLastMonth && budgetLastMonth.length > 0) {
            const lastMonthAvg = budgetLastMonth.reduce((sum, trip) => sum + (trip.budget || 0), 0) / budgetLastMonth.length;
            budgetChange = lastMonthAvg > 0 ? (((avgBudget - lastMonthAvg) / lastMonthAvg) * 100).toFixed(1) : '0';
          }
        }

        // 6. Calculate Overall Rating from reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .not('rating', 'is', null);

        let avgRating = 0;
        let ratingChange = '0';
        if (reviews && reviews.length > 0) {
          avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

          // Previous month rating
          const { data: reviewsLastMonth } = await supabase
            .from('reviews')
            .select('rating')
            .gte('created_at', previousMonthStart.toISOString())
            .lt('created_at', currentMonthStart.toISOString())
            .not('rating', 'is', null);

          if (reviewsLastMonth && reviewsLastMonth.length > 0) {
            const lastMonthAvg = reviewsLastMonth.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsLastMonth.length;
            ratingChange = (avgRating - lastMonthAvg).toFixed(1);
          }
        }

        // 7. Fetch Monthly Trend Data (last 12 months)
        const trendData: TrendData[] = [];
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

          const { count: monthTrips } = await supabase
            .from('travel_plans')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          const { count: monthTourists } = await supabase
            .from('tourists')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          trendData.push({
            date: monthName,
            trips: monthTrips || 0,
            tourists: monthTourists || 0
          });
        }

        // 8. Fetch Geographic Distribution by District
        const { data: districts } = await supabase
          .from('districts')
          .select('id, name');

        const districtVisits: DistrictData[] = [];
        let totalVisits = 0;

        if (districts) {
          for (const district of districts) {
            const { data: attractionsInDistrict } = await supabase
              .from('attractions')
              .select('visits_count')
              .eq('district_id', district.id);

            const visits = attractionsInDistrict
              ? attractionsInDistrict.reduce((sum, a) => sum + (a.visits_count || 0), 0)
              : 0;

            totalVisits += visits;
            districtVisits.push({ name: district.name, visits, percentage: 0 });
          }

          // Calculate percentages
          districtVisits.forEach(d => {
            d.percentage = totalVisits > 0 ? (d.visits / totalVisits) * 100 : 0;
          });

          // Sort by visits
          districtVisits.sort((a, b) => b.visits - a.visits);
        }

        // 9. Fetch Top Countries by Tourist Origin
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

        // 10. Fetch Interest Categories (from attractions visits by category)
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

        const interestData: InterestCategoryData[] = Object.entries(categoryVisits).map(([name, value]) => ({
          name,
          value,
          percentage: totalCategoryVisits > 0 ? (value / totalCategoryVisits) * 100 : 0
        }));

        interestData.sort((a, b) => b.value - a.value);

        // 11. Fetch Travel Companions (from visitor_segment in travel_plans)
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

        const companionData: TravelCompanionData[] = Object.entries(companionCounts).map(([type, count]) => ({
          type,
          count
        }));

        // Sort by predefined order: Solo, Couples, Family, Friends, Group Tours
        const companionOrder = ['Solo', 'Couple', 'Family', 'Friends', 'Group'];
        companionData.sort((a, b) => {
          const indexA = companionOrder.indexOf(a.type);
          const indexB = companionOrder.indexOf(b.type);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        // 12. Fetch Seasonality Trends (monthly visitor volume for current year)
        const currentYear = new Date().getFullYear();
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

        // Update State
        setKpiData(prev => [
          {
            ...prev[0],
            value: touristsCount?.toLocaleString() || '0',
            change: `${touristsChange >= 0 ? '+' : ''}${touristsChange}%`,
            trend: parseFloat(touristsChange) >= 0 ? 'up' : 'down'
          },
          {
            ...prev[1],
            value: tripsCount?.toLocaleString() || '0',
            change: `${parseFloat(tripsChange) >= 0 ? '+' : ''}${tripsChange}%`,
            trend: parseFloat(tripsChange) >= 0 ? 'up' : 'down'
          },
          {
            ...prev[2],
            value: avgDuration > 0 ? `${avgDuration.toFixed(1)} days` : 'N/A',
            change: `${parseFloat(durationChange) >= 0 ? '+' : ''}${durationChange} days`,
            trend: parseFloat(durationChange) < 0 ? 'up' : 'down' // Lower duration is better
          },
          {
            ...prev[3],
            value: attractions?.[0]?.name || 'N/A',
            change: `${attractions?.[0]?.visits_count || 0} visits`
          },
          {
            ...prev[4],
            value: avgBudget > 0 ? `RM ${Math.round(avgBudget)}` : 'RM 0',
            change: `${parseFloat(budgetChange) >= 0 ? '+' : ''}${budgetChange}%`,
            trend: parseFloat(budgetChange) >= 0 ? 'up' : 'down'
          },
          {
            ...prev[5],
            value: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A',
            change: `${parseFloat(ratingChange) >= 0 ? '+' : ''}${ratingChange}`,
            trend: parseFloat(ratingChange) >= 0 ? 'up' : 'down'
          },
        ]);

        if (attractions) {
          setTopAttractionsData(attractions.map(a => ({ name: a.name, visits: a.visits_count || 0 })));
        }

        setTripsTrendData(trendData);
        setDistrictData(districtVisits);
        setTopCountriesData(countryData);
        setInterestCategoriesData(interestData);
        setTravelCompanionsData(companionData);
        setSeasonalityData(seasonalData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Color mapping for districts
  const districtColors = [
    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', bar: 'bg-green-500', barBg: 'bg-green-200' },
    { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', bar: 'bg-lime-500', barBg: 'bg-lime-200' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', bar: 'bg-emerald-500', barBg: 'bg-emerald-200' },
    { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', bar: 'bg-teal-500', barBg: 'bg-teal-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Overview</h1>
          <p className="text-neutral-600">Real-time insights into tourism activity across Kedah</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl mb-0.5">{kpi.value}</p>
                      <p className="text-sm text-neutral-500">{kpi.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trips Created Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Trips & Tourists Trend</CardTitle>
            <p className="text-sm text-neutral-600">Monthly comparison of trip generation and active tourists (Last 12 months)</p>
          </CardHeader>
          <CardContent>
            {tripsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tripsTrendData}>
                  <defs>
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTourists" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="trips" stroke="#22c55e" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
                  <Area type="monotone" dataKey="tourists" stroke="#84cc16" fillOpacity={1} fill="url(#colorTourists)" name="Tourists" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No trend data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Attractions */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Attractions</CardTitle>
            <p className="text-sm text-neutral-600">Most visited destinations</p>
          </CardHeader>
          <CardContent>
            {topAttractionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topAttractionsData} layout="vertical">
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No attractions data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap - Kedah Regions</CardTitle>
          <p className="text-sm text-neutral-600">Geographic distribution of tourist activity</p>
        </CardHeader>
        <CardContent>
          {districtData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {districtData.slice(0, 4).map((district, index) => {
                const colors = districtColors[index] || districtColors[0];
                return (
                  <div key={district.name} className={`p-4 ${colors.bg} border-2 ${colors.border} rounded-xl`}>
                    <p className="text-sm text-neutral-600 mb-1">{district.name}</p>
                    <p className={`text-2xl ${colors.text} mb-1`}>{district.visits.toLocaleString()}</p>
                    <div className={`h-2 ${colors.barBg} rounded-full overflow-hidden`}>
                      <div className={`h-full ${colors.bar}`} style={{ width: `${Math.min(district.percentage, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-neutral-500 py-8">
              No geographic data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row 2 - New Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <p className="text-sm text-neutral-600">Tourist origin by country</p>
          </CardHeader>
          <CardContent>
            {topCountriesData.length > 0 ? (
              <div className="space-y-3">
                {topCountriesData.slice(0, 8).map((country) => (
                  <div key={country.name} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-neutral-700 font-medium">{country.name}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-lime-400 flex items-center justify-end pr-3"
                          style={{ width: `${Math.min(country.percentage, 100)}%` }}
                        >
                          {country.percentage >= 10 && (
                            <span className="text-xs text-white font-semibold">
                              {country.count.toLocaleString()} ({country.percentage.toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {country.percentage < 10 && (
                      <div className="w-24 text-right text-sm text-neutral-600">
                        {country.count.toLocaleString()} ({country.percentage.toFixed(0)}%)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-8">
                No country data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interest Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Categories</CardTitle>
            <p className="text-sm text-neutral-600">What tourists are interested in</p>
          </CardHeader>
          <CardContent>
            {interestCategoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={interestCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {interestCategoriesData.map((entry, index) => {
                      const colors = ['#22c55e', '#84cc16', '#3b82f6', '#a855f7', '#f97316'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No interest category data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Travel Companions */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Companions</CardTitle>
            <p className="text-sm text-neutral-600">Who tourists travel with</p>
          </CardHeader>
          <CardContent>
            {travelCompanionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={travelCompanionsData}>
                  <defs>
                    <linearGradient id="companionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="type" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip />
                  <Bar dataKey="count" fill="url(#companionGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No travel companion data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seasonality Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonality Trends</CardTitle>
            <p className="text-sm text-neutral-600">Visitor volume throughout the year</p>
          </CardHeader>
          <CardContent>
            {seasonalityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={seasonalityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No seasonality data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}