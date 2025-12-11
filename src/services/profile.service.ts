// src/services/profile.service.ts

import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/types';

const supabase = createClient();

// ============================================
// PROFILE OPERATIONS
// ============================================

/**
 * Get current admin profile
 */
export async function getProfile(): Promise<AdminUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('admin_users_ak')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Update admin profile
 */
export async function updateProfile(
  updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('admin_users_ak')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

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

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('admin_users_ak')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar',
    };
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First verify current password by re-authenticating
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      throw new Error('Not authenticated');
    }

    // Try to sign in with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    };
  }
}

/**
 * Get admin activity log
 */
export async function getMyActivityLog(limit: number = 10): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('admin_activity_log_ak')
      .select('*')
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }
}

/**
 * Delete account (request deletion)
 */
export async function requestAccountDeletion(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Log the deletion request
    await supabase
      .from('admin_activity_log_ak')
      .insert({
        admin_id: user.id,
        action: 'account_deletion_requested',
        details: { requested_at: new Date().toISOString() },
      });

    // For now, just mark as inactive - actual deletion should be handled by super_admin
    // In production, you might want to implement a soft delete or request workflow

    return { success: true };
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request deletion',
    };
  }
}