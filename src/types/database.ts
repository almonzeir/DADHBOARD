// src/types/database.ts

// Updated to match your RLS policies
export type AdminRole = 'super_admin' | 'org_admin' | 'org_staff' | 'pending';

/* export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  organization_id: string | null;
  parent_admin_id: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  requested_at: string | null;
  organization_name: string | null;
  organization_type: string | null;
  request_reason: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
} */

// Update AdminUser in src/types/database.ts

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  avatar_url?: string | null;
  phone?: string | null;
  is_approved: boolean;
  organization_id?: string | null;
  organization_name?: string | null;
  organization_type?: string | null;
  parent_admin_id?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  request_reason?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// In src/types/database.ts, update DashboardStats:

export interface DashboardStats {
  totalTourists: number;
  totalPlaces: number;
  totalDistricts: number;
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  pendingApprovals: number;
  avgRating: number;
  totalRevenue: number;
}

// Also update TripsByMonth to include travelers:
export interface TripsByMonth {
  month: string;
  trips: number;
  travelers?: number;
}

export interface District {
  id: string;
  name: string;
  name_ms: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

// src/types/database.ts

// Add these types if not already present

export type PlaceCategory = 
  | 'historical'
  | 'nature'
  | 'food'
  | 'shopping'
  | 'religious'
  | 'adventure'
  | 'beach'
  | 'cultural'
  | 'entertainment'
  | 'other';

export interface Place {
  id: string;
  name: string;
  name_ms?: string | null;
  description?: string | null;
  district_id: string;
  category: PlaceCategory;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  opening_hours?: string | null;
  entrance_fee?: number | null;
  average_duration?: number | null; // in minutes
  rating?: number | null;
  popularity_score?: number | null;
  is_active: boolean;
  is_hidden_gem?: boolean | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  created_at: string;
  updated_at?: string | null;
  // Joined fields
  district?: District | null;
}

export interface PlaceWithDistrict extends Place {
  district: District;
}

export interface Accommodation {
  id: string;
  name: string;
  district_id: string;
  type: string | null;
  image_path: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  price_per_night: number | null;
  rating: number | null;
  amenities: string[] | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  district?: District;
}

/* export interface TravelPlan {
  id: string;
  user_id: string;
  title: string | null;
  start_date: string;
  end_date: string;
  districts: string[] | null;
  attractions: string[] | null;
  status: string | null;
  ai_suggestions: Record<string, unknown> | null;
  created_at: string;
  budget: number | null;
  no_traveler: number | null;
  // Joined
  tourist?: Tourist;
  visits?: Visit[];
} */

export interface Visit {
  id: string;
  trip_id: string;
  attraction_id: string;
  visit_date: string | null;
  status: string | null;
  created_at: string;
  // Joined
  place?: Place;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  nationality: string | null;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Tourist {
  id: string;
  email: string | null;
  full_name: string | null;
  origin_country: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  tourist_id: string;
  attraction_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  tourist?: Tourist;
  place?: Place;
}

export interface GeneratedReport {
  id: string;
  title: string;
  file_path: string | null;
  generated_by: string;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  // Joined
  admin?: AdminUser;
}

// Analytics Types
export interface DashboardStats {
  totalTrips: number;
  totalTourists: number;
  totalPlaces: number;
  totalDistricts: number;
  completedTrips: number;
  pendingApprovals: number;
  avgRating: number;
  totalRevenue: number;
}

export interface TripsByDistrict {
  district: string;
  count: number;
}

export interface TripsByMonth {
  month: string;
  trips: number;
}

export interface TopPlace {
  id: string;
  name: string;
  visits: number;
  rating: number;
}

// Add to src/types/database.ts

export type TripStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type VisitorSegment = 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Business' | 'Group';

export interface TripSlot {
  type: 'attraction' | 'travel' | 'meal' | 'break';
  place?: {
    id: string;
    name: string;
    category: string;
    latitude?: number;
    longitude?: number;
    avg_price?: number;
    rating?: number;
    image_path?: string;
    description?: string;
    suggested_duration?: number;
  };
  startTime: string;
  endTime: string;
  travelTime?: number;
}

export interface TripDay {
  day: number;
  date: string;
  slots: TripSlot[];
  totalCost?: number;
}

export interface TripAttractions {
  days: TripDay[];
}

export interface TripAISuggestions {
  budget: number;
  interests: string[];
  travelerType: string;
  travelerCount: number;
  removedPlaces?: string[];
}

export interface TravelPlan {
  id: string;
  user_id: string;
  title: string | null;
  start_date: string;
  end_date: string;
  districts: string; // JSON string of district IDs
  attractions: string; // JSON string of TripAttractions
  status: TripStatus;
  ai_suggestions: string; // JSON string of TripAISuggestions
  created_at: string;
  budget: string; // Decimal stored as string
  no_traveler: number;
  visitor_segment: VisitorSegment;
  // Parsed fields (not from DB, computed)
  parsed_districts?: string[];
  parsed_attractions?: TripAttractions;
  parsed_ai_suggestions?: TripAISuggestions;
  district_names?: string[];
}

