import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { supabase } from '../lib/supabase';

// 📚 LEARNING: Define types for our data structure
type Review = {
  id: string;
  tourist_name: string;
  attraction_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type RatingTrend = {
  month: string;
  rating: number;
};

type SentimentData = {
  type: string;
  count: number;
};

export default function FeedbackRatingsPage() {
  // 📚 LEARNING: State for storing real data from database
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [ratingTrendData, setRatingTrendData] = useState<RatingTrend[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    totalReviews: 0,
    positivePercent: 0,
    positiveCount: 0,
    negativePercent: 0,
    negativeCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [attractionFilter, setAttractionFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 📚 LEARNING: Fetch all data when component loads
  useEffect(() => {
    async function fetchReviewsData() {
      try {
        // 1️⃣ Fetch ALL reviews from database
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }

        if (reviews) {
          setReviewsData(reviews);

          // 2️⃣ Calculate overall statistics
          const totalReviews = reviews.length;
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;

          // 📚 LEARNING: Count positive/negative based on rating
          const positiveReviews = reviews.filter(r => r.rating >= 4).length;
          const negativeReviews = reviews.filter(r => r.rating <= 2).length;

          setStats({
            overallScore: avgRating,
            totalReviews,
            positivePercent: (positiveReviews / totalReviews) * 100 || 0,
            positiveCount: positiveReviews,
            negativePercent: (negativeReviews / totalReviews) * 100 || 0,
            negativeCount: negativeReviews,
          });

          // 3️⃣ Calculate sentiment distribution
          const neutralReviews = reviews.filter(r => r.rating === 3).length;
          setSentimentData([
            { type: 'Positive', count: positiveReviews },
            { type: 'Neutral', count: neutralReviews },
            { type: 'Negative', count: negativeReviews },
          ]);

          // 4️⃣ Calculate monthly rating trends (last 11 months)
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const trends: RatingTrend[] = [];
          const now = new Date();

          for (let i = 10; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

            const monthReviews = reviews.filter(r => {
              const reviewDate = new Date(r.created_at);
              return reviewDate >= monthStart && reviewDate <= monthEnd;
            });

            const monthAvg = monthReviews.length > 0
              ? monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
              : 0;

            trends.push({
              month: monthNames[monthDate.getMonth()],
              rating: monthAvg || 0,
            });
          }

          setRatingTrendData(trends);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewsData();
  }, []);

  const filteredReviews = reviewsData.filter((review) => {
    const matchesAttraction = attractionFilter === 'all' || review.attraction === attractionFilter;
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.tourist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAttraction && matchesRating && matchesSearch;
  });

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-700">Positive</Badge>;
      case 'neutral':
        return <Badge className="bg-yellow-100 text-yellow-700">Neutral</Badge>;
      case 'negative':
        return <Badge className="bg-red-100 text-red-700">Negative</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Feedback & Ratings</h1>
          <p className="text-neutral-600">Monitor tourist satisfaction and reviews</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Overall Score</p>
                <p className="text-2xl">{stats.overallScore > 0 ? `${stats.overallScore.toFixed(1)}/5` : 'N/A'}</p>
                <p className="text-xs text-green-600">From {stats.totalReviews} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Reviews</p>
                <p className="text-2xl">{stats.totalReviews.toLocaleString()}</p>
                <p className="text-xs text-blue-600">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Positive</p>
                <p className="text-2xl">{stats.positivePercent > 0 ? `${stats.positivePercent.toFixed(0)}%` : '0%'}</p>
                <p className="text-xs text-green-600">{stats.positiveCount.toLocaleString()} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <ThumbsDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Negative</p>
                <p className="text-2xl">{stats.negativePercent > 0 ? `${stats.negativePercent.toFixed(0)}%` : '0%'}</p>
                <p className="text-xs text-red-600">{stats.negativeCount.toLocaleString()} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trend Over Time</CardTitle>
            <p className="text-sm text-neutral-600">Average rating by month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ratingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" />
                <YAxis domain={[4.0, 5.0]} stroke="#737373" />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <p className="text-sm text-neutral-600">Positive vs negative feedback</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="type" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'Positive' ? '#22c55e' : entry.type === 'Neutral' ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <p className="text-sm text-neutral-600">Latest feedback from tourists</p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={attractionFilter} onValueChange={setAttractionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Attraction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attractions</SelectItem>
                <SelectItem value="Langkawi Sky Bridge">Langkawi Sky Bridge</SelectItem>
                <SelectItem value="Underwater World">Underwater World</SelectItem>
                <SelectItem value="Bujang Valley">Bujang Valley</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="mb-1">{review.tourist}</p>
                    <p className="text-sm text-neutral-600">{review.attraction}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSentimentBadge(review.sentiment)}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-700 mb-3">{review.comment}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">{review.date}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReview(review)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Tourist</p>
                <p>{selectedReview.tourist}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Attraction</p>
                <p>{selectedReview.attraction}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Sentiment</p>
                {getSentimentBadge(selectedReview.sentiment)}
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Comment</p>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Submitted</p>
                <p className="text-sm">{selectedReview.date}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}