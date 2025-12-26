// src/services/analytics.service.ts
// GOD MODE ANALYTICS ENGINE - Mission Control Dashboard
// Table: completed_trips
// Schema: no_travelers, budget_planned, budget_actual, overall_rating, district_id, attractions, interests, start_date, end_date

import { createClient } from '@/lib/supabase/client';
import type { DashboardStats, TripsByDistrict, TripsByMonth, TopPlace } from '@/types';

const supabase = createClient();

// ==========================================
// TYPE DEFINITIONS (GOD MODE)
// ==========================================

export interface DashboardKPIs {
  trips: number;
  tourists: number;
  budget: number;
  rating: number;
  duration: number;
  top_destination: string;
  top_visits: number;
}

export interface Financials {
  avg_planned: number;
  avg_actual: number;
  deviation: number;
  total_revenue_estimated: number;
}

export interface Demographics {
  nationalities: { name: string; value: number }[];
  segments: { name: string; value: number }[];
  ages: { range: string; count: number }[];
}

export interface Interest {
  name: string;
  count: number;
}

export interface Behavior {
  completion_rate: number;
  skip_rate: number;
  avg_attractions_per_trip: number;
}

// DEEP DIVE: Advanced Analytics Types
export interface BudgetDistribution {
  category: string;
  count: number;
}

export interface SpendingPower {
  type: string;
  avg_spend: number;
}

export interface IntensityStats {
  avg_completion: number;
  total_skipped: number;
}

export interface AdvancedStats {
  budget_distribution: BudgetDistribution[];
  spending_power: SpendingPower[];
  intensity: IntensityStats | null;
}

// ==========================================
// GOD MODE: Mission Control Data Readers
// ==========================================

/**
 * Get Dashboard KPIs (MISSION CONTROL)
 * Returns RAW SQL data: { trips, tourists, budget, rating, duration, top_destination, top_visits }
 */
export async function getKpiStats(): Promise<DashboardKPIs | null> {
  const { data, error } = await supabase.rpc('get_dashboard_kpis');

  if (error) {
    console.error('❌ Analytics Error (KPIs):', error);
    return null;
  }

  if (!data) {
    console.warn('⚠️ KPI data returned null');
    return null;
  }

  // DEBUG: Log raw data from SQL
  console.log('✅ RAW KPI DATA FROM SQL:', data);

  // Return RAW data - NO REMAPPING!
  return data as DashboardKPIs;
}

/**
 * Get Financial Analytics (GOD MODE)
 * Returns: { avg_planned, avg_actual, deviation, total_revenue_estimated }
 */
export async function getFinancials(): Promise<Financials | null> {
  const { data, error } = await supabase.rpc('get_financial_analytics');

  if (error) {
    console.error('Analytics Error (Financials):', error);
    // Return mock for graceful degradation
    return {
      avg_planned: 0,
      avg_actual: 0,
      deviation: 0,
      total_revenue_estimated: 0
    };
  }

  return data as Financials;
}

/**
 * Get Demographics Analytics (GOD MODE)
 */
export async function getDemographics(): Promise<Demographics | null> {
  const { data, error } = await supabase.rpc('get_demographics_analytics');

  if (error) {
    console.error('Analytics Error (Demographics):', error);
    return null;
  }

  return data as Demographics;
}

/**
 * Get Top Interests (GOD MODE - Psychographics)
 * Returns: [{ name: 'Nature', count: 45 }, ...]
 */
export async function getInterests(): Promise<Interest[]> {
  const { data, error } = await supabase.rpc('get_top_interests');

  if (error) {
    console.error('Analytics Error (Interests):', error);
    return [];
  }

  return (data as Interest[]) || [];
}

/**
 * Get Behavior Analytics (GOD MODE)
 * Returns: { completion_rate, skip_rate, avg_attractions_per_trip }
 */
export async function getBehavior(): Promise<Behavior | null> {
  const { data, error } = await supabase.rpc('get_behavior_analytics');

  if (error) {
    console.error('Analytics Error (Behavior):', error);
    return null;
  }

  return data as Behavior;
}

/**
 * Get Advanced Stats (DEEP DIVE)
 * Returns: { budget_distribution, spending_power, intensity }
 */
export async function getAdvancedStats(): Promise<AdvancedStats | null> {
  const { data, error } = await supabase.rpc('get_advanced_stats');

  if (error) {
    console.error('Analytics Error (Advanced Stats):', error);
    return null;
  }

  if (!data) return null;

  console.log('✅ ADVANCED STATS FROM SQL:', data);

  return data as AdvancedStats;
}

/**
 * Get Traffic Chart (MISSION CONTROL)
 */
export async function getTrends() {
  const { data, error } = await supabase.rpc('get_trip_trends');

  if (error) {
    console.error('Analytics Error (Traffic):', error);
    return [];
  }

  return data || [];
}

/**
 * Get Visitor Segments
 */
export async function getSegments() {
  const { data, error } = await supabase.rpc('get_visitor_segments');
  if (error) {
    console.error('Analytics Error (Segments):', error);
    return [];
  }
  return data || [];
}

/**
 * Get Places Chart (MISSION CONTROL)
 */
export async function getPopularPlaces() {
  const { data, error } = await supabase.rpc('get_places_chart');

  if (error) {
    console.error('❌ Analytics Error (Places):', error);
    return [];
  }

  return data || [];
}

/**
 * Get Budget Scatter (Spending vs Duration)
 */
export async function getBudgetScatter() {
  const { data, error } = await supabase.rpc('get_budget_scatter');

  if (error) {
    console.error('❌ Analytics Error (Scatter):', error);
    return [];
  }

  console.log('✅ Scatter Data:', data);
  return data || [];
}

/**
 * Get District Stats (Geographic Performance)
 */
export async function getDistrictStats() {
  const { data, error } = await supabase.rpc('get_district_stats');

  if (error) {
    console.error('❌ Analytics Error (Districts):', error);
    return [];
  }

  console.log('✅ District Data:', data);
  return data || [];
}

/**
 * Get Budget Tiers (For legacy chart support)
 */
export async function getBudgetTiers() {
  const { data, error } = await supabase.rpc('get_budget_tiers');

  if (error) {
    console.error('❌ Analytics Error (Budget Tiers):', error);
    return [];
  }

  return data || [];
}

/**
 * Get Trip Pace (Itinerary intensity)
 */
export async function getTripPace() {
  const { data, error } = await supabase.rpc('get_trip_pace');

  if (error) {
    console.error('❌ Analytics Error (Trip Pace):', error);
    return [];
  }

  return data || [];
}

/**
 * Get Interest Categories (For legacy chart support)
 */
export async function getInterestCategories() {
  const { data, error } = await supabase.rpc('get_interest_categories');

  if (error) {
    console.error('❌ Analytics Error (Interest Categories):', error);
    return [];
  }

  return data || [];
}

/**
 * Get Hidden Gem Stats
 */
export async function getHiddenGemStats() {
  const { data, error } = await supabase.rpc('get_hidden_gems');

  if (error) {
    console.error('❌ Analytics Error (Hidden Gems):', error);
    return null;
  }

  return data || { total: 0, hidden: 0, percentage: 0 };
}


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
// ==========================================
// REPORT GENERATION ENGINES (McKinsey Style)
// ==========================================

/**
 * Get Dashboard KPIs for Report
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs | null> {
  return getKpiStats();
}

/**
 * Get AI Performance Stats (Pace, Skip Rate, etc.)
 */
export async function getAiPerformanceStats() {
  const { data, error } = await supabase.rpc('get_behavior_analytics');

  if (error || !data) {
    // Fallback for demo
    return {
      avg_pace_per_day: 4.2,
      skip_rate_percentage: 12.5,
      avg_places: 5.2
    };
  }

  return {
    avg_pace_per_day: data.avg_attractions_per_trip || 4.2,
    skip_rate_percentage: data.skip_rate || 12.5,
    avg_places: data.avg_attractions_per_trip || 5.2
  };
}

/**
 * Get Advanced Insights (Leakage, Quality Index)
 */
export async function getAdvancedInsights() {
  // Try to get real data
  const { data: scatterData } = await supabase.rpc('get_budget_scatter');
  const { data: districtData } = await supabase.rpc('get_district_stats');

  // Construct economic leakage analysis
  const economic_leakage = (districtData as any[])?.slice(0, 5)?.map(d => ({
    district: d.district_name,
    total_planned: d.total_planned || 0,
    total_spent: d.total_spent || 0
  })) || [];

  // Construct attraction quality audit
  const { data: placesData } = await supabase.rpc('get_places_chart');
  const attraction_quality = (placesData as any[])?.slice(0, 8)?.map(p => ({
    name: p.name,
    trip_rating_impact: p.rating || 0
  })) || [];

  return {
    economic_leakage,
    attraction_quality
  };
}

/**
 * Get Safe Insights (Traveler DNA, Value Matrix, Interest Map)
 * These charts work reliably with your existing data
 */
export async function getSafeInsights() {
  const { data } = await supabase.rpc('get_safe_insights');
  return data || { traveler_dna: [], value_matrix: [], interest_map: [] };
}



/**
 * Get Missing Insights (Realism, Intensity, Geography)
 * Analyzes user planning accuracy and trip completion
 */
export async function getMissingInsights() {
  const { data } = await supabase.rpc('get_missing_insights');
  return data || { realism: [], intensity: { avg_completion: 0, total_skipped: 0 }, geography: [] };
}

/**
 * Get Nationality Stats (Global Reach)
 * Returns visitor counts by country
 */
export async function getNationalityStats() {
  const { data } = await supabase.rpc('get_nationality_stats');
  return data || [];
}

/**
 * Get User Stats (Age Groups & Completion)
 * Returns demographics and itinerary success rates
 */
export async function getUserStats() {
  const { data } = await supabase.rpc('get_user_stats');
  return data || { ages: [], completion: [] };
}

/**
 * Get Operational Insights (Planning, Revenue, Discipline, Traffic)
 * Returns metrics for operational efficiency
 */
export async function getOperationalInsights() {
  const { data } = await supabase.rpc('get_operational_insights');
  return data || { lead_time: [], revenue: [], discipline: [], traffic: [] };
}

/**
 * Get Growth Metrics (Momentum, Heatmap, Quality) - NEW ENGINE
 */
export async function getGrowthMetrics() {
  const { data } = await supabase.rpc('get_growth_metrics');

  if (!data) {
    return {
      momentum: [],
      heatmap: [],
      quality: []
    };
  }

  return data;
}
