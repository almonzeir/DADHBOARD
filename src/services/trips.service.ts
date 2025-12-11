// src/services/trips.service.ts

import { createClient } from '@/lib/supabase/client';
import type { TravelPlan, TripStatus, TripAttractions, TripAISuggestions } from '@/types';

const supabase = createClient();

// Helper to parse JSON safely
function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Helper to parse a travel plan
function parseTravelPlan(trip: TravelPlan): TravelPlan {
  return {
    ...trip,
    parsed_districts: safeJsonParse<string[]>(trip.districts, []),
    parsed_attractions: safeJsonParse<TripAttractions>(trip.attractions, { days: [] }),
    parsed_ai_suggestions: safeJsonParse<TripAISuggestions>(trip.ai_suggestions, {
      budget: 0,
      interests: [],
      travelerType: '',
      travelerCount: 0,
    }),
  };
}

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Get all trips with optional filters
 */
export async function getTrips(filters?: {
  status?: TripStatus;
  districtId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<TravelPlan[]> {
  let query = supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('start_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('end_date', filters.endDate);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }

  // Parse JSON fields and filter by district if needed
  let trips = (data || []).map(parseTravelPlan);

  // Filter by district (need to do in JS since districts is JSON)
  if (filters?.districtId) {
    trips = trips.filter(trip => 
      trip.parsed_districts?.includes(filters.districtId!)
    );
  }

  return trips;
}

/**
 * Get trip by ID
 */
export async function getTripById(id: string): Promise<TravelPlan | null> {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    return null;
  }

  return parseTravelPlan(data);
}

/**
 * Get trips with district names
 */
export async function getTripsWithDistrictNames(filters?: {
  status?: TripStatus;
  districtId?: string;
  search?: string;
  limit?: number;
}): Promise<TravelPlan[]> {
  // Get districts for mapping
  const { data: districts } = await supabase
    .from('districts')
    .select('id, name');

  const districtMap = new Map(districts?.map(d => [d.id, d.name]) || []);

  // Get trips
  let query = supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  // Parse and add district names
  let trips = (data || []).map(trip => {
    const parsed = parseTravelPlan(trip);
    const districtNames = parsed.parsed_districts
      ?.map(id => districtMap.get(id))
      .filter(Boolean) as string[];
    return { ...parsed, district_names: districtNames || [] };
  });

  // Filter by district if needed
  if (filters?.districtId) {
    trips = trips.filter(trip => 
      trip.parsed_districts?.includes(filters.districtId!)
    );
  }

  return trips;
}

/**
 * Get trip statistics
 */
export async function getTripStats(): Promise<{
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  draft: number;
  totalTravelers: number;
  totalBudget: number;
}> {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('status, no_traveler, budget');

  if (error) {
    console.error('Error fetching trip stats:', error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      draft: 0,
      totalTravelers: 0,
      totalBudget: 0,
    };
  }

  const stats = {
    total: data?.length || 0,
    active: data?.filter(t => t.status === 'active').length || 0,
    completed: data?.filter(t => t.status === 'completed').length || 0,
    cancelled: data?.filter(t => t.status === 'cancelled').length || 0,
    draft: data?.filter(t => t.status === 'draft').length || 0,
    totalTravelers: data?.reduce((sum, t) => sum + (t.no_traveler || 0), 0) || 0,
    totalBudget: data?.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0) || 0,
  };

  return stats;
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update trip status
 */
export async function updateTripStatus(
  id: string,
  status: TripStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('travel_plans')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating trip status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete a trip
 */
export async function deleteTrip(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete trip',
    };
  }
}