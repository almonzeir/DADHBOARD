// src/services/places.service.ts

import { createClient } from '@/lib/supabase/client';
import type { Place, PlaceCategory } from '@/types';

const supabase = createClient();

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Get all places with optional filters
 */
export async function getPlaces(filters?: {
  districtId?: string;
  category?: PlaceCategory;
  isActive?: boolean;
  isHiddenGem?: boolean;
  search?: string;
}): Promise<Place[]> {
  let query = supabase
    .from('places')
    .select(`
      *,
      district:districts(id, name, name_ms)
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

  if (filters?.isHiddenGem !== undefined) {
    query = query.eq('is_hidden_gem', filters.isHiddenGem);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,name_ms.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching places:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get place by ID
 */
export async function getPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      district:districts(id, name, name_ms, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching place:', error);
    return null;
  }

  return data;
}

/**
 * Get places count by district
 */
export async function getPlacesCountByDistrict(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('places')
    .select('district_id')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching places count:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data?.forEach((place) => {
    counts[place.district_id] = (counts[place.district_id] || 0) + 1;
  });

  return counts;
}

/**
 * Get places count by category
 */
export async function getPlacesCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('places')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching places count:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data?.forEach((place) => {
    counts[place.category] = (counts[place.category] || 0) + 1;
  });

  return counts;
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new place
 */
export async function createPlace(
  data: Omit<Place, 'id' | 'created_at' | 'updated_at' | 'district'>
): Promise<{ success: boolean; data?: Place; error?: string }> {
  try {
    const { data: newPlace, error } = await supabase
      .from('places')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        district:districts(id, name, name_ms)
      `)
      .single();

    if (error) throw error;

    return { success: true, data: newPlace };
  } catch (error) {
    console.error('Error creating place:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create place',
    };
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update a place
 */
export async function updatePlace(
  id: string,
  data: Partial<Omit<Place, 'id' | 'created_at' | 'district'>>
): Promise<{ success: boolean; data?: Place; error?: string }> {
  try {
    const { data: updatedPlace, error } = await supabase
      .from('places')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        district:districts(id, name, name_ms)
      `)
      .single();

    if (error) throw error;

    return { success: true, data: updatedPlace };
  } catch (error) {
    console.error('Error updating place:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update place',
    };
  }
}

/**
 * Toggle place active status
 */
export async function togglePlaceStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('places')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error toggling place status:', error);
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
 * Delete a place
 */
export async function deletePlace(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if place has trips associated
    const { data: trips } = await supabase
      .from('travel_plans')
      .select('id')
      .contains('places', [id])
      .limit(1);

    if (trips && trips.length > 0) {
      return {
        success: false,
        error: 'Cannot delete place. It is associated with existing trips.',
      };
    }

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting place:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete place',
    };
  }
}

// ============================================
// IMAGE OPERATIONS
// ============================================

/**
 * Upload place image
 */
export async function uploadPlaceImage(
  file: File,
  placeId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${placeId}-${Date.now()}.${fileExt}`;
    const filePath = `places/${fileName}`;

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