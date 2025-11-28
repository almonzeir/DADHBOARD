import { ArrowLeft, MapPin, Star, TrendingUp, Users, Eye, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AttractionDetailPageProps {
  attractionId: string;
  onBack: () => void;
}

// 📚 LEARNING: Types for attraction detail data
type MonthlyVisit = {
  month: string;
  visits: number;
};

type RatingData = {
  rating: string;
  count: number;
  percentage: number;
};

type VisitorSegment = {
  name: string;
  value: number;
  color: string;
};

type AttractionData = {
  name: string;
  location: string;
  district: string;
  image_url: string;
  rating: number;
  review_count: number;
  visits_count: number;
};

export default function AttractionDetailPage({ attractionId, onBack }: AttractionDetailPageProps) {
  // 📚 LEARNING: State for dynamic attraction data
  const [attraction, setAttraction] = useState<AttractionData | null>(null);
  const [monthlyVisitsData, setMonthlyVisitsData] = useState<MonthlyVisit[]>([]);
  const [ratingsData, setRatingsData] = useState<RatingData[]>([]);
  const [visitorSegmentsData, setVisitorSegmentsData] = useState<VisitorSegment[]>([]);
  const [stats, setStats] = useState({
    activeTourists: 0,
    tripsGenerated: 0,
    avgRating: 0,
    topDestination: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📚 LEARNING: Fetch ALL data for this specific attraction
  useEffect(() => {
    async function fetchAttractionData() {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Fetch attraction details
        const { data: attractionData, error: attractionError } = await supabase
          .from('attractions')
          .select('*, districts(name)')
          .eq('id', attractionId)
          .single();

        if (attractionError) {
          console.error('Error fetching attraction:', attractionError);
          setError(`Could not find attraction (ID: ${attractionId})`);
          return;
        }

        if (!attractionData) {
          setError(`Attraction not found (ID: ${attractionId})`);
          return;
        }

        if (attractionData) {
          setAttraction({
            name: attractionData.name,
            location: attractionData.districts?.name || 'Kedah',
            district: attractionData.districts?.name || 'Kedah',
            image_url: attractionData.image_url || '',
            rating: 0, // Will calculate from reviews
            review_count: 0,
            visits_count: attractionData.visits_count || 0,
          });

          // 2️⃣ Fetch reviews for ratings
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('attraction_id', attractionId);

          if (reviews && reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

            // Calculate rating distribution
            const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
            reviews.forEach(r => {
              if (r.rating >= 1 && r.rating <= 5) {
                ratingCounts[r.rating - 1]++;
              }
            });

            const ratingsArray: RatingData[] = [
              { rating: '5 stars', count: ratingCounts[4], percentage: (ratingCounts[4] / reviews.length) * 100 },
              { rating: '4 stars', count: ratingCounts[3], percentage: (ratingCounts[3] / reviews.length) * 100 },
              { rating: '3 stars', count: ratingCounts[2], percentage: (ratingCounts[2] / reviews.length) * 100 },
              { rating: '2 stars', count: ratingCounts[1], percentage: (ratingCounts[1] / reviews.length) * 100 },
              { rating: '1 star', count: ratingCounts[0], percentage: (ratingCounts[0] / reviews.length) * 100 },
            ];

            setRatingsData(ratingsArray);
            setAttraction(prev => prev ? { ...prev, rating: avgRating, review_count: reviews.length } : null);
          }

          // 3️⃣ Fetch monthly visits
          const { data: visits } = await supabase
            .from('visits')
            .select('visited_at')
            .eq('attraction_id', attractionId);

          if (visits) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyCounts = new Array(12).fill(0);

            visits.forEach(visit => {
              const month = new Date(visit.visited_at).getMonth();
              monthlyCounts[month]++;
            });

            const monthlyData: MonthlyVisit[] = monthNames.map((month, index) => ({
              month,
              visits: monthlyCounts[index],
            }));

            setMonthlyVisitsData(monthlyData);
          }

          // 4️⃣ Fetch visitor segments (from travel_plans that visited this attraction)
          const { data: tripVisits } = await supabase
            .from('visits')
            .select('trip_id')
            .eq('attraction_id', attractionId);

          if (tripVisits) {
            const tripIds = tripVisits.map(v => v.trip_id);

            const { data: travelPlans } = await supabase
              .from('travel_plans')
              .select('visitor_segment')
              .in('id', tripIds)
              .not('visitor_segment', 'is', null);

            const segmentCounts: { [key: string]: number } = {};
            let total = 0;

            travelPlans?.forEach(plan => {
              const segment = plan.visitor_segment;
              segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
              total++;
            });

            const colors = ['#22c55e', '#84cc16', '#3b82f6', '#a855f7', '#f59e0b'];
            const segments: VisitorSegment[] = Object.entries(segmentCounts).map(([name, count], index) => ({
              name,
              value: total > 0 ? (count / total) * 100 : 0,
              color: colors[index % colors.length],
            }));

            setVisitorSegmentsData(segments);
          }

          // 5️⃣ Calculate stats
          const { count: touristCount } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })
            .eq('attraction_id', attractionId);

          const { count: tripCount } = await supabase
            .from('visits')
            .select('trip_id', { count: 'exact', head: true })
            .eq('attraction_id', attractionId);

          setStats({
            activeTourists: touristCount || 0,
            tripsGenerated: tripCount || 0,
            avgRating: reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
            topDestination: attractionData.districts?.name || 'Kedah',
          });
        }
      } catch (error) {
        console.error('Error fetching attraction data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttractionData();
  }, [attractionId]); // Re-fetch when attractionId changes

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg mb-2">Loading attraction details...</div>
        <div className="text-sm text-neutral-500">Fetching data from database</div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Attractions
        </Button>
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg text-red-600 mb-2">⚠️ {error || 'Attraction not found'}</p>
          <p className="text-sm text-neutral-600">Please check if the attraction exists in your database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Attractions
      </Button>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-green-500 via-green-400 to-lime-400">
          <ImageWithFallback
            src={attraction.image_url || "https://images.unsplash.com/photo-1502920514313-52581002a659"}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl mb-2">{attraction.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{attraction.location}, Kedah</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white" />
                    <span>{attraction.rating > 0 ? attraction.rating.toFixed(1) : 'N/A'} ({attraction.review_count.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-green-600" />
              <p className="text-sm text-neutral-600">Active Tourists</p>
            </div>
            <p className="text-3xl">{stats.activeTourists.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-neutral-600">Trips Generated</p>
            </div>
            <p className="text-3xl">{stats.tripsGenerated.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-neutral-600">Avg Rating</p>
            </div>
            <p className="text-3xl">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-neutral-600">Top Destination</p>
            </div>
            <p className="text-2xl">{stats.topDestination}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Visit Pattern</CardTitle>
            <p className="text-sm text-neutral-600">Number of visits by month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyVisitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip />
                <Bar dataKey="visits" fill="url(#monthlyGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visitor Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Segments</CardTitle>
            <p className="text-sm text-neutral-600">Who visits this attraction</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={visitorSegmentsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visitorSegmentsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Ratings</CardTitle>
          <p className="text-sm text-neutral-600">Distribution of tourist ratings</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingsData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-neutral-600">{item.rating}</div>
                <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-lime-400 flex items-center justify-end pr-3 text-sm text-white"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage}%
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-neutral-600">{item.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}