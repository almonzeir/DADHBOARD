// src/services/admin.service.ts

import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/types';

const supabase = createClient();

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Get pending admin requests (for Super Admin)
 */
export async function getPendingAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users_ak')
    .select('*')
    .eq('role', 'pending')
    .eq('is_approved', false)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending admins:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all organization admins (for Super Admin)
 */
export async function getOrganizationAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users_ak')
    .select('*')
    .eq('role', 'org_admin')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching organization admins:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get staff members for an organization admin
 */
export async function getStaffMembers(parentAdminId: string): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users_ak')
    .select('*')
    .eq('parent_admin_id', parentAdminId)
    .eq('role', 'org_staff')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff members:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users_ak')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching admin:', error);
    return null;
  }

  return data;
}

/**
 * Get staff count for an org admin
 */
export async function getStaffCount(parentAdminId: string): Promise<number> {
  const { count, error } = await supabase
    .from('admin_users_ak')
    .select('*', { count: 'exact', head: true })
    .eq('parent_admin_id', parentAdminId)
    .eq('role', 'org_staff');

  if (error) {
    console.error('Error fetching staff count:', error);
    return 0;
  }

  return count || 0;
}

// ============================================
// APPROVAL OPERATIONS (Super Admin)
// ============================================

/**
 * Approve a pending admin request
 */
export async function approveAdmin(
  adminId: string,
  approverId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users_ak')
      .update({
        role: 'org_admin',
        is_approved: true,
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)
      .eq('role', 'pending');

    if (error) throw error;

    // Log the action
    await logAdminActivity(approverId, 'approve_admin', adminId, {
      action_type: 'approval',
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving admin:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to approve admin' 
    };
  }
}

/**
 * Reject a pending admin request
 */
export async function rejectAdmin(
  adminId: string,
  approverId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the pending admin record
    const { error } = await supabase
      .from('admin_users_ak')
      .delete()
      .eq('id', adminId)
      .eq('role', 'pending');

    if (error) throw error;

    // Log the action
    await logAdminActivity(approverId, 'reject_admin', adminId, {
      action_type: 'rejection',
      reason,
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting admin:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reject admin' 
    };
  }
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete an organization admin (cascades to staff)
 */
export async function deleteOrganizationAdmin(
  adminId: string,
  deleterId: string
): Promise<{ success: boolean; error?: string; deletedStaffCount?: number }> {
  try {
    // First, get the count of staff that will be deleted
    const staffCount = await getStaffCount(adminId);

    // Delete all staff members first (cascade)
    if (staffCount > 0) {
      const { error: staffError } = await supabase
        .from('admin_users_ak')
        .delete()
        .eq('parent_admin_id', adminId)
        .eq('role', 'org_staff');

      if (staffError) throw staffError;
    }

    // Then delete the org admin
    const { error } = await supabase
      .from('admin_users_ak')
      .delete()
      .eq('id', adminId)
      .eq('role', 'org_admin');

    if (error) throw error;

    // Log the action
    await logAdminActivity(deleterId, 'delete_org_admin', adminId, {
      action_type: 'deletion',
      cascade_deleted_staff: staffCount,
    });

    return { success: true, deletedStaffCount: staffCount };
  } catch (error) {
    console.error('Error deleting organization admin:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete admin' 
    };
  }
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(
  staffId: string,
  deleterId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users_ak')
      .delete()
      .eq('id', staffId)
      .eq('role', 'org_staff');

    if (error) throw error;

    // Log the action
    await logAdminActivity(deleterId, 'delete_staff', staffId, {
      action_type: 'deletion',
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete staff' 
    };
  }
}

// ============================================
// INVITE OPERATIONS (Org Admin)
// ============================================

/**
 * Invite a new staff member using SECURITY DEFINER function
 */
export async function inviteStaffMember(
  email: string,
  fullName: string,
  parentAdminId: string,
  organizationId: string | null,
  organizationName: string | null
): Promise<{ success: boolean; error?: string; tempPassword?: string }> {
  try {
    // Generate temporary password
    const tempPassword = generateTempPassword();
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // Step 2: Use the SECURITY DEFINER function to insert admin record
    const { data, error: rpcError } = await supabase.rpc('invite_staff_member', {
      p_user_id: authData.user.id,
      p_email: email,
      p_full_name: fullName,
      p_parent_admin_id: parentAdminId,  // ✅ Pass parent admin ID explicitly
      p_organization_id: organizationId,
      p_organization_name: organizationName,
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw new Error(rpcError.message);
    }

    // Check the result from the function
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw new Error((data as any).error || 'Failed to create staff record');
      }
    }

    return { success: true, tempPassword };
  } catch (error) {
    console.error('Error inviting staff member:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to invite staff' 
    };
  }
}

// ============================================
// ACTIVITY LOG
// ============================================

/**
 * Log admin activity
 */
export async function logAdminActivity(
  adminId: string,
  action: string,
  targetUserId: string | null,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await supabase
      .from('admin_activity_log_ak')
      .insert({
        admin_id: adminId,
        action,
        target_user_id: targetUserId,
        details,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error logging admin activity:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Get recent admin activities
 */
export async function getAdminActivities(limit: number = 20): Promise<any[]> {
  const { data, error } = await supabase
    .from('admin_activity_log_ak')
    .select(`
      *,
      admin:admin_id (
        id,
        full_name,
        email,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching admin activities:', error);
    return [];
  }

  return data || [];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a temporary password
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(
  adminId: string,
  updates: Partial<AdminUser>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users_ak')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
}