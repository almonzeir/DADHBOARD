import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Route, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 📚 LEARNING: Types for itinerary data
type TripLengthData = {
  length: string;
  count: number;
};

type PopularRoute = {
  route: string;
  frequency: number;
  avgDuration: string;
  rating: number;
};

type TopCombination = {
  combination: string;
  count: number;
  percentage: number;
};

type AIInsight = {
  insight: string;
  icon: string;
  color: string;
};

export default function ItineraryAnalyticsPage() {
  // 📚 LEARNING: State for all data (step by step!)
  const [stats, setStats] = useState({
    totalItineraries: 0,
    avgAttractions: 0,
    avgTripLength: 0,
    aiAdoption: 85, // Hardcoded - no AI field in DB
  });
  const [tripLengthData, setTripLengthData] = useState<TripLengthData[]>([]);
  const [popularRoutesData, setPopularRoutesData] = useState<PopularRoute[]>([]);
  const [topCombinationsData, setTopCombinationsData] = useState<TopCombination[]>([]);
  const [aiInsightsData] = useState<AIInsight[]>([
    { insight: 'Most visited attractions are in Langkawi', icon: '🎯', color: 'bg-green-50 border-green-200 text-green-700' },
    { insight: 'Average itinerary includes 4-5 attractions per day', icon: '📍', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { insight: 'Cultural sites often paired with nature attractions', icon: '🌿', color: 'bg-lime-50 border-lime-200 text-lime-700' },
    { insight: 'Most trips last 2-3 days', icon: '✨', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  ]);
  const [loading, setLoading] = useState(true);

  // 📚 LEARNING: STEP 1 - Basic Stats + Trip Length Distribution
  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Total Itineraries (count travel_plans)
        const { count: totalItineraries } = await supabase
          .from('travel_plans')
          .select('*', { count: 'exact', head: true });

        // 2️⃣ Avg Trip Length (calculate from start_date and end_date)
        const { data: allPlans } = await supabase
          .from('travel_plans')
          .select('start_date, end_date')
          .not('start_date', 'is', null)
          .not('end_date', 'is', null);

        let avgTripLength = 0;
        const lengthCounts: { [key: string]: number } = {
          '1 day': 0,
          '2 days': 0,
          '3 days': 0,
          '4-5 days': 0,
          '6+ days': 0,
        };

        if (allPlans && allPlans.length > 0) {
          const totalDays = allPlans.reduce((sum, plan) => {
            const start = new Date(plan.start_date);
            const end = new Date(plan.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            // Count for distribution
            if (days === 1) lengthCounts['1 day']++;
            else if (days === 2) lengthCounts['2 days']++;
            else if (days === 3) lengthCounts['3 days']++;
            else if (days >= 4 && days <= 5) lengthCounts['4-5 days']++;
            else if (days >= 6) lengthCounts['6+ days']++;

            return sum + (days > 0 ? days : 0);
          }, 0);
          avgTripLength = totalDays / allPlans.length;
        }

        // Convert to array for chart
        const tripLengthArray: TripLengthData[] = Object.entries(lengthCounts).map(([length, count]) => ({
          length,
          count,
        }));
        setTripLengthData(tripLengthArray);

        // 3️⃣ Avg Attractions per day (count visits / total days)
        const { count: totalVisits } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true });

        const totalTripDays = allPlans ? allPlans.reduce((sum, plan) => {
          const start = new Date(plan.start_date);
          const end = new Date(plan.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + (days > 0 ? days : 0);
        }, 0) : 0;

        const avgAttractions = totalTripDays > 0 ? (totalVisits || 0) / totalTripDays : 0;

        setStats({
          totalItineraries: totalItineraries || 0,
          avgAttractions,
          avgTripLength,
          aiAdoption: 85, // Hardcoded
        });

        // 📚 LEARNING: STEP 2 - Popular "Routes" (SIMPLIFIED: Top visited attractions)
        const { data: attractions } = await supabase
          .from('attractions')
          .select('id, name, visits_count')
          .order('visits_count', { ascending: false })
          .limit(6);

        if (attractions) {
          const popularRoutes: PopularRoute[] = [];

          for (const attraction of attractions) {
            // Get avg rating for this attraction
            const { data: attractionReviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('attraction_id', attraction.id);

            const avgRating = attractionReviews && attractionReviews.length > 0
              ? attractionReviews.reduce((sum, r) => sum + r.rating, 0) / attractionReviews.length
              : 0;

            // Estimate duration based on visit count (simple heuristic)
            const duration = attraction.visits_count > 1000 ? '1 day' :
              attraction.visits_count > 500 ? '2-3 hours' : '1-2 hours';

            popularRoutes.push({
              route: attraction.name,
              frequency: attraction.visits_count || 0,
              avgDuration: duration,
              rating: avgRating,
            });
          }

          setPopularRoutesData(popularRoutes);
        }

        // 📚 LEARNING: STEP 3 - Top Combinations (attractions visited together)
        const { data: allVisits } = await supabase
          .from('visits')
          .select('trip_id, attraction_id');

        if (allVisits) {
          // Group visits by trip_id
          const tripVisits: { [key: string]: string[] } = {};
          allVisits.forEach(visit => {
            if (!tripVisits[visit.trip_id]) {
              tripVisits[visit.trip_id] = [];
            }
            tripVisits[visit.trip_id].push(visit.attraction_id);
          });

          // Count combinations (pairs of attractions)
          const combinationCounts: { [key: string]: number } = {};

          Object.values(tripVisits).forEach(attractionIds => {
            if (attractionIds.length >= 2) {
              // Sort to ensure consistent combination keys
              const sorted = [...attractionIds].sort();
              for (let i = 0; i < sorted.length - 1; i++) {
                for (let j = i + 1; j < sorted.length; j++) {
                  const key = `${sorted[i]}_${sorted[j]}`;
                  combinationCounts[key] = (combinationCounts[key] || 0) + 1;
                }
              }
            }
          });

          // Get top 5 combinations
          const topCombos = Object.entries(combinationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          // Fetch attraction names
          const topCombinations: TopCombination[] = [];
          const totalCombos = Object.values(combinationCounts).reduce((sum, count) => sum + count, 0);

          for (const [key, count] of topCombos) {
            const [id1, id2] = key.split('_');

            const { data: attr1 } = await supabase
              .from('attractions')
              .select('name')
              .eq('id', id1)
              .single();

            const { data: attr2 } = await supabase
              .from('attractions')
              .select('name')
              .eq('id', id2)
              .single();

            if (attr1 && attr2) {
              topCombinations.push({
                combination: `${attr1.name} + ${attr2.name}`,
                count,
                percentage: totalCombos > 0 ? (count / totalCombos) * 100 : 0,
              });
            }
          }

          setTopCombinationsData(topCombinations);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">AI-Generated Itinerary Analytics</h1>
          <p className="text-neutral-600">Insights from AI-powered trip planning and tourist routes</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Route className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Itineraries</p>
                <p className="text-2xl">{stats.totalItineraries.toLocaleString()}</p>
                <p className="text-xs text-green-600">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg Attractions</p>
                <p className="text-2xl">{stats.avgAttractions > 0 ? stats.avgAttractions.toFixed(1) : '0'}</p>
                <p className="text-xs text-blue-600">Per day</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg Trip Length</p>
                <p className="text-2xl">{stats.avgTripLength > 0 ? `${stats.avgTripLength.toFixed(1)} days` : 'N/A'}</p>
                <p className="text-xs text-purple-600">Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">AI Adoption</p>
                <p className="text-2xl">{stats.aiAdoption}%</p>
                <p className="text-xs text-yellow-600">Estimated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiInsightsData.map((item, index) => (
          <Card key={index} className={`border-2 ${item.color}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm">{item.insight}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Length Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Length Distribution</CardTitle>
            <p className="text-sm text-neutral-600">How long tourists stay in Kedah</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tripLengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="length" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip />
                <Bar dataKey="count" fill="url(#tripGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="tripGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Map Visualization Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Travel Routes</CardTitle>
            <p className="text-sm text-neutral-600">Movement patterns across Kedah</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gradient-to-br from-green-50 to-lime-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-neutral-600">Interactive route map visualization</p>
                <p className="text-xs text-neutral-500 mt-1">Showing tourist movement patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Itineraries</CardTitle>
          <p className="text-sm text-neutral-600">Pre-defined routes frequently chosen by tourists</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead className="text-right">Frequency</TableHead>
                <TableHead>Avg Duration</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularRoutesData.map((route, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-green-600" />
                      <span>{route.route}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{route.frequency.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{route.avgDuration}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-yellow-600">★</span>
                      <span>{route.rating}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Combinations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Attraction Combinations</CardTitle>
          <p className="text-sm text-neutral-600">Most frequently paired attractions in itineraries</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCombinationsData.map((combo, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-lime-400 text-white text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">{combo.combination}</p>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-lime-400"
                      style={{ width: `${combo.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <p>{combo.count.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500">{combo.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sankey Diagram Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Flow Diagram</CardTitle>
          <p className="text-sm text-neutral-600">Visual representation of tourist movement between attractions</p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gradient-to-br from-neutral-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-200">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-neutral-600">Sankey diagram showing popular travel flows</p>
              <p className="text-xs text-neutral-500 mt-1">From entry points to destinations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
