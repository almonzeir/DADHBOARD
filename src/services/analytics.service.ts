// src/services/analytics.service.ts

import { createClient } from '@/lib/supabase/client';
import type { DashboardStats, TripsByDistrict, TripsByMonth, TopPlace } from '@/types';

const supabase = createClient();

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get all travel plans to calculate tourists and trips
    const { data: travelPlans, error: tripsError } = await supabase
      .from('travel_plans')
      .select('id, no_traveler, status, budget, created_at');
    
    if (tripsError) {
      console.error('Error fetching travel plans:', tripsError);
    }

    // Calculate totals from travel_plans
    const totalTrips = travelPlans?.length || 0;
    const totalTourists = travelPlans
      ? travelPlans.reduce((sum, trip) => sum + (trip.no_traveler || 0), 0)
      : 0;
    const completedTrips = travelPlans
      ? travelPlans.filter(trip => trip.status === 'completed').length
      : 0;
    const activeTrips = travelPlans
      ? travelPlans.filter(trip => trip.status === 'active').length
      : 0;
    const totalRevenue = travelPlans
      ? travelPlans
          .filter(trip => trip.status === 'completed')
          .reduce((sum, trip) => sum + (parseFloat(trip.budget) || 0), 0)
      : 0;

    // Get total places
    const { count: totalPlaces } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total districts
    const { count: totalDistricts } = await supabase
      .from('districts')
      .select('*', { count: 'exact', head: true });

    // Get pending admin approvals
    const { count: pendingApprovals } = await supabase
      .from('admin_users_ak')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    // Get average rating from reviews
    const { data: ratings } = await supabase
      .from('reviews')
      .select('rating');
    
    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
      : 0;

    return {
      totalTourists,
      totalPlaces: totalPlaces || 0,
      totalDistricts: totalDistricts || 0,
      totalTrips,
      completedTrips,
      activeTrips,
      pendingApprovals: pendingApprovals || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalTourists: 0,
      totalPlaces: 0,
      totalDistricts: 0,
      totalTrips: 0,
      completedTrips: 0,
      activeTrips: 0,
      pendingApprovals: 0,
      avgRating: 0,
      totalRevenue: 0,
    };
  }
}

export async function getTripsByDistrict(): Promise<TripsByDistrict[]> {
  try {
    // Get all districts
    const { data: districts } = await supabase
      .from('districts')
      .select('id, name');

    if (!districts) return [];

    // Get all travel plans with districts JSON
    const { data: trips } = await supabase
      .from('travel_plans')
      .select('districts');

    if (!trips) return districts.map(d => ({ district: d.name, count: 0 }));

    // Count trips per district
    const districtCounts: Record<string, number> = {};
    districts.forEach(d => { districtCounts[d.id] = 0; });

    trips.forEach(trip => {
      if (trip.districts) {
        try {
          // Parse the districts JSON string
          let districtIds: string[] = [];
          
          if (typeof trip.districts === 'string') {
            districtIds = JSON.parse(trip.districts);
          } else if (Array.isArray(trip.districts)) {
            districtIds = trip.districts;
          }

          // Count each district
          districtIds.forEach((districtId: string) => {
            if (districtCounts[districtId] !== undefined) {
              districtCounts[districtId]++;
            }
          });
        } catch (e) {
          console.error('Error parsing districts:', e);
        }
      }
    });

    return districts.map(d => ({
      district: d.name,
      count: districtCounts[d.id] || 0,
    })).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching trips by district:', error);
    return [];
  }
}

export async function getTripsByMonth(): Promise<TripsByMonth[]> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: trips } = await supabase
      .from('travel_plans')
      .select('created_at, no_traveler')
      .gte('created_at', sixMonthsAgo.toISOString());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthData: Record<string, { trips: number; travelers: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthData[key] = { trips: 0, travelers: 0 };
    }

    if (trips) {
      trips.forEach(trip => {
        const date = new Date(trip.created_at);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthData[key] !== undefined) {
          monthData[key].trips++;
          monthData[key].travelers += trip.no_traveler || 0;
        }
      });
    }

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      trips: data.trips,
      travelers: data.travelers,
    }));
  } catch (error) {
    console.error('Error fetching trips by month:', error);
    return [];
  }
}

export async function getTopPlaces(limit: number = 5): Promise<TopPlace[]> {
  try {
    const { data: places } = await supabase
      .from('places')
      .select('id, name, popularity_score, rating')
      .eq('is_active', true)
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (!places) return [];

    return places.map(p => ({
      id: p.id,
      name: p.name,
      visits: p.popularity_score || 0,
      rating: p.rating || 0,
    }));
  } catch (error) {
    console.error('Error fetching top places:', error);
    return [];
  }
}

export async function getRecentTrips(limit: number = 5) {
  try {
    const { data: trips } = await supabase
      .from('travel_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!trips) return [];

    // Get district names for each trip
    const { data: districts } = await supabase
      .from('districts')
      .select('id, name');

    const districtMap = new Map(districts?.map(d => [d.id, d.name]) || []);

    return trips.map(trip => {
      let districtNames: string[] = [];
      
      if (trip.districts) {
        try {
          const districtIds = typeof trip.districts === 'string' 
            ? JSON.parse(trip.districts) 
            : trip.districts;
          
          districtNames = districtIds
            .map((id: string) => districtMap.get(id))
            .filter(Boolean);
        } catch (e) {
          console.error('Error parsing districts:', e);
        }
      }

      return {
        ...trip,
        district_names: districtNames,
      };
    });
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    return [];
  }
}

export async function getRecentReviews(limit: number = 5) {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        place:places (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    return reviews || [];
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return [];
  }
}

export async function getRevenueByMonth(): Promise<{ month: string; revenue: number }[]> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: trips } = await supabase
      .from('travel_plans')
      .select('created_at, budget')
      .eq('status', 'completed')
      .gte('created_at', sixMonthsAgo.toISOString());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthRevenue: Record<string, number> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthRevenue[key] = 0;
    }

    if (trips) {
      trips.forEach(trip => {
        const date = new Date(trip.created_at);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthRevenue[key] !== undefined) {
          monthRevenue[key] += parseFloat(trip.budget) || 0;
        }
      });
    }

    return Object.entries(monthRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  } catch (error) {
    console.error('Error fetching revenue by month:', error);
    return [];
  }
}