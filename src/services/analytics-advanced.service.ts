// src/services/analytics-advanced.service.ts

import { createClient } from '@/lib/supabase/client';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

const supabase = createClient();

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsData {
  overview: {
    totalTrips: number;
    totalTravelers: number;
    totalBudget: number;
    avgBudget: number;
    completionRate: number;
    avgTripDuration: number;
  };
  comparison: {
    tripsChange: number;
    travelersChange: number;
    budgetChange: number;
  };
  tripsTrend: {
    date: string;
    trips: number;
    travelers: number;
  }[];
  tripsByDistrict: {
    district: string;
    trips: number;
    travelers: number;
  }[];
  tripsBySegment: {
    segment: string;
    count: number;
    percentage: number;
  }[];
  tripsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  budgetDistribution: {
    range: string;
    count: number;
  }[];
  topPlaces: {
    id: string;
    name: string;
    district: string;
    visits: number;
    rating: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    date: string;
  }[];
}

/**
 * Get comprehensive analytics data
 */
export async function getAdvancedAnalytics(dateRange?: DateRange): Promise<AnalyticsData> {
  const from = dateRange?.from || subMonths(new Date(), 6);
  const to = dateRange?.to || new Date();

  // Fetch all required data
  const [tripsData, placesData, districtsData] = await Promise.all([
    fetchTripsData(from, to),
    fetchPlacesData(),
    fetchDistrictsData(),
  ]);

  // Calculate previous period for comparison
  const periodLength = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - periodLength);
  const previousTo = from;
  const previousTripsData = await fetchTripsData(previousFrom, previousTo);

  // Process data
  const overview = calculateOverview(tripsData);
  const comparison = calculateComparison(tripsData, previousTripsData);
  const tripsTrend = calculateTripsTrend(tripsData, from, to);
  const tripsByDistrict = calculateTripsByDistrict(tripsData, districtsData);
  const tripsBySegment = calculateTripsBySegment(tripsData);
  const tripsByStatus = calculateTripsByStatus(tripsData);
  const budgetDistribution = calculateBudgetDistribution(tripsData);
  const topPlaces = calculateTopPlaces(placesData, districtsData);
  const recentActivity = getRecentActivity(tripsData);

  return {
    overview,
    comparison,
    tripsTrend,
    tripsByDistrict,
    tripsBySegment,
    tripsByStatus,
    budgetDistribution,
    topPlaces,
    recentActivity,
  };
}

// ============================================
// DATA FETCHING
// ============================================

async function fetchTripsData(from: Date, to: Date) {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return data || [];
}

async function fetchPlacesData() {
  const { data, error } = await supabase
    .from('places')
    .select('id, name, district_id, popularity_score, rating')
    .eq('is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  return data || [];
}

async function fetchDistrictsData() {
  const { data, error } = await supabase
    .from('districts')
    .select('id, name');

  if (error) {
    console.error('Error fetching districts:', error);
    return [];
  }

  return data || [];
}

// ============================================
// CALCULATIONS
// ============================================

function calculateOverview(trips: any[]) {
  const totalTrips = trips.length;
  const totalTravelers = trips.reduce((sum, t) => sum + (t.no_traveler || 0), 0);
  const totalBudget = trips.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);
  const avgBudget = totalTrips > 0 ? totalBudget / totalTrips : 0;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

  // Calculate average trip duration
  let totalDuration = 0;
  trips.forEach(trip => {
    if (trip.start_date && trip.end_date) {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDuration += duration;
    }
  });
  const avgTripDuration = totalTrips > 0 ? totalDuration / totalTrips : 0;

  return {
    totalTrips,
    totalTravelers,
    totalBudget,
    avgBudget,
    completionRate,
    avgTripDuration,
  };
}

function calculateComparison(currentTrips: any[], previousTrips: any[]) {
  const currentTotal = currentTrips.length;
  const previousTotal = previousTrips.length;
  const tripsChange = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : currentTotal > 0 ? 100 : 0;

  const currentTravelers = currentTrips.reduce((sum, t) => sum + (t.no_traveler || 0), 0);
  const previousTravelers = previousTrips.reduce((sum, t) => sum + (t.no_traveler || 0), 0);
  const travelersChange = previousTravelers > 0 
    ? ((currentTravelers - previousTravelers) / previousTravelers) * 100 
    : currentTravelers > 0 ? 100 : 0;

  const currentBudget = currentTrips.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);
  const previousBudget = previousTrips.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);
  const budgetChange = previousBudget > 0 
    ? ((currentBudget - previousBudget) / previousBudget) * 100 
    : currentBudget > 0 ? 100 : 0;

  return {
    tripsChange,
    travelersChange,
    budgetChange,
  };
}

function calculateTripsTrend(trips: any[], from: Date, to: Date) {
  // Determine granularity based on date range
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const useMonthly = daysDiff > 60;

  if (useMonthly) {
    const months = eachMonthOfInterval({ start: from, end: to });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTrips = trips.filter(t => {
        const date = new Date(t.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      return {
        date: format(month, 'MMM yyyy'),
        trips: monthTrips.length,
        travelers: monthTrips.reduce((sum, t) => sum + (t.no_traveler || 0), 0),
      };
    });
  } else {
    const days = eachDayOfInterval({ start: from, end: to });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTrips = trips.filter(t => 
        format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
      );

      return {
        date: format(day, 'MMM d'),
        trips: dayTrips.length,
        travelers: dayTrips.reduce((sum, t) => sum + (t.no_traveler || 0), 0),
      };
    });
  }
}

function calculateTripsByDistrict(trips: any[], districts: any[]) {
  const districtMap = new Map(districts.map(d => [d.id, d.name]));
  const counts: Record<string, { trips: number; travelers: number }> = {};

  districts.forEach(d => {
    counts[d.name] = { trips: 0, travelers: 0 };
  });

  trips.forEach(trip => {
    try {
      const districtIds = typeof trip.districts === 'string'
        ? JSON.parse(trip.districts)
        : trip.districts || [];
      
      districtIds.forEach((id: string) => {
        const name = districtMap.get(id);
        if (name && counts[name]) {
          counts[name].trips++;
          counts[name].travelers += trip.no_traveler || 0;
        }
      });
    } catch (e) {
      // Skip
    }
  });

  return Object.entries(counts)
    .map(([district, data]) => ({
      district,
      trips: data.trips,
      travelers: data.travelers,
    }))
    .sort((a, b) => b.trips - a.trips);
}

function calculateTripsBySegment(trips: any[]) {
  const counts: Record<string, number> = {};
  
  trips.forEach(trip => {
    const segment = trip.visitor_segment || 'Unknown';
    counts[segment] = (counts[segment] || 0) + 1;
  });

  const total = trips.length;
  return Object.entries(counts)
    .map(([segment, count]) => ({
      segment,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateTripsByStatus(trips: any[]) {
  const counts: Record<string, number> = {};
  
  trips.forEach(trip => {
    const status = trip.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = trips.length;
  return Object.entries(counts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateBudgetDistribution(trips: any[]) {
  const ranges = [
    { label: '< RM 500', min: 0, max: 500 },
    { label: 'RM 500-1K', min: 500, max: 1000 },
    { label: 'RM 1K-2K', min: 1000, max: 2000 },
    { label: 'RM 2K-5K', min: 2000, max: 5000 },
    { label: '> RM 5K', min: 5000, max: Infinity },
  ];

  return ranges.map(range => ({
    range: range.label,
    count: trips.filter(t => {
      const budget = parseFloat(t.budget) || 0;
      return budget >= range.min && budget < range.max;
    }).length,
  }));
}

function calculateTopPlaces(places: any[], districts: any[]) {
  const districtMap = new Map(districts.map(d => [d.id, d.name]));

  return places.map(place => ({
    id: place.id,
    name: place.name,
    district: districtMap.get(place.district_id) || 'Unknown',
    visits: place.popularity_score || 0,
    rating: place.rating || 0,
  }));
}

function getRecentActivity(trips: any[]) {
  return trips.slice(0, 5).map(trip => ({
    id: trip.id,
    type: 'trip',
    title: trip.title,
    date: trip.created_at,
  }));
}