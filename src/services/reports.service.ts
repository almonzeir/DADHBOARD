// src/services/reports.service.ts

import { createClient } from '@/lib/supabase/client';
import type { TravelPlan, Place, District } from '@/types';

const supabase = createClient();

// ============================================
// DATA FETCHING FOR REPORTS
// ============================================

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  districtId?: string;
  status?: string;
}

/**
 * Get trips data for report
 */
export async function getTripsReportData(filters?: ReportFilters): Promise<any[]> {
  let query = supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('start_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('end_date', filters.endDate);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trips report data:', error);
    return [];
  }

  // Get districts for mapping
  const { data: districts } = await supabase
    .from('districts')
    .select('id, name');

  const districtMap = new Map(districts?.map(d => [d.id, d.name]) || []);

  // Parse and enrich data
  return (data || []).map(trip => {
    let districtNames: string[] = [];
    try {
      const districtIds = typeof trip.districts === 'string' 
        ? JSON.parse(trip.districts) 
        : trip.districts || [];
      districtNames = districtIds
        .map((id: string) => districtMap.get(id))
        .filter(Boolean);
    } catch (e) {
      console.error('Error parsing districts:', e);
    }

    return {
      id: trip.id,
      title: trip.title,
      status: trip.status,
      start_date: trip.start_date,
      end_date: trip.end_date,
      districts: districtNames.join(', '),
      no_traveler: trip.no_traveler,
      visitor_segment: trip.visitor_segment,
      budget: parseFloat(trip.budget) || 0,
      created_at: trip.created_at,
    };
  }).filter(trip => {
    // Filter by district if specified
    if (filters?.districtId) {
      try {
        const districtIds = typeof trip.districts === 'string'
          ? JSON.parse(trip.districts)
          : [];
        return districtIds.includes(filters.districtId);
      } catch {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get places data for report
 */
export async function getPlacesReportData(filters?: {
  districtId?: string;
  category?: string;
  isActive?: boolean;
}): Promise<any[]> {
  let query = supabase
    .from('places')
    .select(`
      *,
      district:districts(id, name)
    `)
    .order('name', { ascending: true });

  if (filters?.districtId) {
    query = query.eq('district_id', filters.districtId);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching places report data:', error);
    return [];
  }

  return (data || []).map(place => ({
    id: place.id,
    name: place.name,
    name_ms: place.name_ms || '',
    category: place.category,
    district: (place.district as any)?.name || '',
    address: place.address || '',
    entrance_fee: place.entrance_fee || 0,
    rating: place.rating || 0,
    popularity_score: place.popularity_score || 0,
    is_active: place.is_active ? 'Active' : 'Inactive',
    is_hidden_gem: place.is_hidden_gem ? 'Yes' : 'No',
    created_at: place.created_at,
  }));
}

/**
 * Get districts data for report
 */
export async function getDistrictsReportData(): Promise<any[]> {
  const { data: districts, error } = await supabase
    .from('districts')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching districts report data:', error);
    return [];
  }

  // Get counts for each district
  const { data: places } = await supabase
    .from('places')
    .select('district_id')
    .eq('is_active', true);

  const { data: trips } = await supabase
    .from('travel_plans')
    .select('districts');

  // Count places per district
  const placeCounts: Record<string, number> = {};
  places?.forEach(p => {
    placeCounts[p.district_id] = (placeCounts[p.district_id] || 0) + 1;
  });

  // Count trips per district
  const tripCounts: Record<string, number> = {};
  trips?.forEach(trip => {
    try {
      const districtIds = typeof trip.districts === 'string'
        ? JSON.parse(trip.districts)
        : trip.districts || [];
      districtIds.forEach((id: string) => {
        tripCounts[id] = (tripCounts[id] || 0) + 1;
      });
    } catch (e) {
      // Skip
    }
  });

  return (districts || []).map(district => ({
    id: district.id,
    name: district.name,
    name_ms: district.name_ms || '',
    places_count: placeCounts[district.id] || 0,
    trips_count: tripCounts[district.id] || 0,
    created_at: district.created_at,
  }));
}

/**
 * Get analytics summary for report
 */
export async function getAnalyticsSummary(filters?: ReportFilters): Promise<{
  totalTrips: number;
  totalTravelers: number;
  totalBudget: number;
  avgBudget: number;
  completedTrips: number;
  activeTrips: number;
  tripsByStatus: Record<string, number>;
  tripsBySegment: Record<string, number>;
  topDistricts: { name: string; count: number }[];
}> {
  let query = supabase.from('travel_plans').select('*');

  if (filters?.startDate) {
    query = query.gte('start_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('end_date', filters.endDate);
  }

  const { data: trips } = await query;
  const { data: districts } = await supabase.from('districts').select('id, name');

  const districtMap = new Map(districts?.map(d => [d.id, d.name]) || []);

  // Calculate metrics
  const totalTrips = trips?.length || 0;
  const totalTravelers = trips?.reduce((sum, t) => sum + (t.no_traveler || 0), 0) || 0;
  const totalBudget = trips?.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0) || 0;
  const avgBudget = totalTrips > 0 ? totalBudget / totalTrips : 0;
  const completedTrips = trips?.filter(t => t.status === 'completed').length || 0;
  const activeTrips = trips?.filter(t => t.status === 'active').length || 0;

  // Group by status
  const tripsByStatus: Record<string, number> = {};
  trips?.forEach(t => {
    tripsByStatus[t.status] = (tripsByStatus[t.status] || 0) + 1;
  });

  // Group by segment
  const tripsBySegment: Record<string, number> = {};
  trips?.forEach(t => {
    tripsBySegment[t.visitor_segment] = (tripsBySegment[t.visitor_segment] || 0) + 1;
  });

  // Count by district
  const districtCounts: Record<string, number> = {};
  trips?.forEach(trip => {
    try {
      const districtIds = typeof trip.districts === 'string'
        ? JSON.parse(trip.districts)
        : trip.districts || [];
      districtIds.forEach((id: string) => {
        const name = districtMap.get(id);
        if (name) {
          districtCounts[name] = (districtCounts[name] || 0) + 1;
        }
      });
    } catch (e) {
      // Skip
    }
  });

  const topDistricts = Object.entries(districtCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalTrips,
    totalTravelers,
    totalBudget,
    avgBudget,
    completedTrips,
    activeTrips,
    tripsByStatus,
    tripsBySegment,
    topDistricts,
  };
}