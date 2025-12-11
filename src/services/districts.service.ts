// src/services/districts.service.ts

import { createClient } from '@/lib/supabase/client';
import type { District } from '@/types';

const supabase = createClient();

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Get all districts
 */
export async function getDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get district by ID
 */
export async function getDistrictById(id: string): Promise<District | null> {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching district:', error);
    return null;
  }

  return data;
}

/**
 * Get district statistics (places count, accommodations count)
 */
export async function getDistrictStats(districtId: string): Promise<{
  placesCount: number;
  accommodationsCount: number;
  tripsCount: number;
}> {
  // Get places count
  const { count: placesCount } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('district_id', districtId)
    .eq('is_active', true);

  // Get accommodations count
  const { count: accommodationsCount } = await supabase
    .from('accommodations')
    .select('*', { count: 'exact', head: true })
    .eq('district_id', districtId)
    .eq('is_active', true);

  // Get trips count (trips that include this district)
  const { data: trips } = await supabase
    .from('travel_plans')
    .select('districts');

  const tripsCount = trips?.filter(trip => 
    trip.districts && Array.isArray(trip.districts) && trip.districts.includes(districtId)
  ).length || 0;

  return {
    placesCount: placesCount || 0,
    accommodationsCount: accommodationsCount || 0,
    tripsCount,
  };
}

/**
 * Get all districts with their statistics
 */
export async function getDistrictsWithStats(): Promise<(District & {
  placesCount: number;
  accommodationsCount: number;
  tripsCount: number;
})[]> {
  const districts = await getDistricts();
  
  const districtsWithStats = await Promise.all(
    districts.map(async (district) => {
      const stats = await getDistrictStats(district.id);
      return { ...district, ...stats };
    })
  );

  return districtsWithStats;
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new district
 */
export async function createDistrict(
  data: Omit<District, 'id' | 'created_at'>
): Promise<{ success: boolean; data?: District; error?: string }> {
  try {
    const { data: newDistrict, error } = await supabase
      .from('districts')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: newDistrict };
  } catch (error) {
    console.error('Error creating district:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create district',
    };
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update a district
 */
export async function updateDistrict(
  id: string,
  data: Partial<Omit<District, 'id' | 'created_at'>>
): Promise<{ success: boolean; data?: District; error?: string }> {
  try {
    const { data: updatedDistrict, error } = await supabase
      .from('districts')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: updatedDistrict };
  } catch (error) {
    console.error('Error updating district:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update district',
    };
  }
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete a district
 */
export async function deleteDistrict(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if district has places or accommodations
    const { count: placesCount } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('district_id', id);

    const { count: accommodationsCount } = await supabase
      .from('accommodations')
      .select('*', { count: 'exact', head: true })
      .eq('district_id', id);

    if ((placesCount || 0) > 0 || (accommodationsCount || 0) > 0) {
      return {
        success: false,
        error: `Cannot delete district. It has ${placesCount || 0} places and ${accommodationsCount || 0} accommodations associated with it.`,
      };
    }

    const { error } = await supabase
      .from('districts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting district:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete district',
    };
  }
}

// ============================================
// IMAGE OPERATIONS
// ============================================

/**
 * Upload district image
 */
export async function uploadDistrictImage(
  file: File,
  districtId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${districtId}-${Date.now()}.${fileExt}`;
    const filePath = `districts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Delete district image
 */
export async function deleteDistrictImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // e.g., "districts/xxx.jpg"

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}