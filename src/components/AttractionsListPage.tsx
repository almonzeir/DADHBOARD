//@ts-nocheck
import { useState } from 'react';
import { Search, Filter, Eye, MapPin, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AttractionsListPageProps {
  onViewDetail: (id: string) => void;
}

type Attraction = {
  id: string;
  name: string;
  category: string;
  visits: number;
  avgRating: number;
  area: string;
  status: string;
};

const categoryColors: Record<string, string> = {
  'Nature & Adventure': 'bg-green-100 text-green-700',
  'Culture & Heritage': 'bg-amber-100 text-amber-700',
  'Entertainment': 'bg-blue-100 text-blue-700',
  'Beach & Relaxation': 'bg-cyan-100 text-cyan-700',
  'Shopping & Dining': 'bg-purple-100 text-purple-700',
  'Other': 'bg-gray-100 text-gray-700',
};

export default function AttractionsListPage({ onViewDetail }: AttractionsListPageProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttractions: 0,
    totalVisits: 0,
    avgRating: 0,
    topDestination: 'N/A'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  useEffect(() => {
    fetchAttractions();
  }, []);

  async function fetchAttractions() {
    try {
      setLoading(true);

      // Fetch data from places with related categories and districts
      // Fetch places with related district information
      const { data, error } = await supabase
        .from('places')
        .select(`
          id,
          name,
          district_id,
          category,
          popularity_score,
          rating,
          districts!district_id (name)
        `)
        .eq('is_active', true);

      if (error) throw error;

      if (data) {
        const formattedAttractions: Attraction[] = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || 'Other',
          visits: item.popularity_score || 0,
          avgRating: parseFloat(item.rating) || 0,
          area: item.districts?.name || 'Unknown',
          status: 'Active'
        }));
        setAttractions(formattedAttractions);

        // Calculate stats
        const totalVisits = formattedAttractions.reduce((sum, item) => sum + item.visits, 0);
        const avgRating = formattedAttractions.length > 0
          ? formattedAttractions.reduce((sum, item) => sum + item.avgRating, 0) / formattedAttractions.length
          : 0;

        // Find top destination (district with most visits)
        const districtVisits: Record<string, number> = {};
        formattedAttractions.forEach(item => {
          districtVisits[item.area] = (districtVisits[item.area] || 0) + item.visits;
        });

        const topDestination = Object.entries(districtVisits)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          totalAttractions: formattedAttractions.length,
          totalVisits,
          avgRating,
          topDestination
        });
      }
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAttractions = attractions.filter((attraction) => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || attraction.category === categoryFilter;
    const matchesArea = areaFilter === 'all' || attraction.area === areaFilter;
    return matchesSearch && matchesCategory && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Destinations & Attractions</h1>
          <p className="text-neutral-600">Performance metrics for all attractions in Kedah</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <p className="text-sm text-neutral-600">Total Attractions</p>
            </div>
            <p className="text-3xl">{stats.totalAttractions}</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-neutral-600">Total Visits</p>
            </div>
            <p className="text-3xl">{stats.totalVisits.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-neutral-600">Avg Rating</p>
            </div>
            <p className="text-3xl">{stats.avgRating.toFixed(1)}</p>
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

      {/* Attractions Table */}
      <Card>
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl">All Attractions</h2>
            <p className="text-sm text-neutral-600">Browse and manage attraction listings</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attraction Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>District</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Avg Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttractions.map((attraction) => (
                <TableRow key={attraction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span>{attraction.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={categoryColors[attraction.category] || categoryColors['Other']}>
                      {attraction.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{attraction.area}</TableCell>
                  <TableCell className="text-right">{attraction.visits.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{attraction.avgRating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(attraction.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Showing {filteredAttractions.length} attractions
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button size="sm" className="bg-gradient-to-r from-green-500 to-lime-400 text-white">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}