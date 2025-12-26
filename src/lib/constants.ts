// src/lib/constants.ts

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'MaiKedah Admin';

// ============================================
// ADMIN ROLES
// ============================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  ORG_STAFF: 'org_staff',
  PENDING: 'pending',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  org_staff: 'Staff Admin',
  pending: 'Pending Approval',
};

export const ADMIN_ROLES = [
  { 
    value: 'super_admin', 
    label: 'Super Admin', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Full system access'
  },
  { 
    value: 'org_admin', 
    label: 'Organization Admin', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Organization management'
  },
  { 
    value: 'org_staff', 
    label: 'Staff', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Limited access'
  },
  { 
    value: 'pending', 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    description: 'Awaiting approval'
  },
] as const;

// ============================================
// KEDAH DISTRICTS
// ============================================

export const KEDAH_DISTRICTS = [
  'Baling',
  'Bandar Baharu',
  'Kota Setar',
  'Kuala Muda',
  'Kubang Pasu',
  'Kulim',
  'Langkawi',
  'Padang Terap',
  'Pendang',
  'Pokok Sena',
  'Sik',
  'Yan',
] as const;

// ============================================
// PLACE CATEGORIES
// ============================================

export const PLACE_CATEGORIES = [
  { value: 'historical', label: 'Historical', icon: 'Landmark' },
  { value: 'nature', label: 'Nature', icon: 'Trees' },
  { value: 'food', label: 'Food & Dining', icon: 'Utensils' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'religious', label: 'Religious', icon: 'Church' },
  { value: 'adventure', label: 'Adventure', icon: 'Mountain' },
  { value: 'beach', label: 'Beach', icon: 'Waves' },
  { value: 'cultural', label: 'Cultural', icon: 'Theater' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Sparkles' },
  { value: 'other', label: 'Other', icon: 'MapPin' },
] as const;

export const PLACE_CATEGORY_COLORS: Record<string, string> = {
  historical: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  nature: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  religious: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  adventure: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  beach: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  cultural: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  entertainment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

// ============================================
// TRIP STATUSES
// ============================================

export const TRIP_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
] as const;

export function getTripStatusColor(status: string): string {
  const found = TRIP_STATUSES.find(s => s.value === status);
  return found?.color || TRIP_STATUSES[0].color;
}

export function getTripStatusLabel(status: string): string {
  const found = TRIP_STATUSES.find(s => s.value === status);
  return found?.label || status;
}

// ============================================
// VISITOR SEGMENTS
// ============================================

export const VISITOR_SEGMENTS = [
  { value: 'Solo', label: 'Solo Traveler' },
  { value: 'Couple', label: 'Couple' },
  { value: 'Family', label: 'Family' },
  { value: 'Friends', label: 'Friends' },
  { value: 'Business', label: 'Business' },
  { value: 'Group', label: 'Group Tour' },
] as const;

// ============================================
// ORGANIZATION TYPES
// ============================================

export const ORGANIZATION_TYPES = [
  { value: 'government', label: 'Government Agency' },
  { value: 'tourism_board', label: 'Tourism Board' },
  { value: 'travel_agency', label: 'Travel Agency' },
  { value: 'hotel_association', label: 'Hotel Association' },
  { value: 'tour_operator', label: 'Tour Operator' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'educational', label: 'Educational Institution' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================
// NAVIGATION
// ============================================

export const NAVIGATION_ITEMS = {
  super_admin: [
    { label: 'Executive Summary', href: '/', icon: 'LayoutDashboard' },
    { label: 'Admin Management', href: '/admin-management', icon: 'Users' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  org_admin: [
    { label: 'Executive Summary', href: '/', icon: 'LayoutDashboard' },
    { label: 'Team Management', href: '/admin-management', icon: 'Users' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  org_staff: [
    { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { label: 'Districts', href: '/districts', icon: 'Map' },
    { label: 'Places', href: '/places', icon: 'MapPin' },
    { label: 'Tourists', href: '/users', icon: 'UserCircle' },
    { label: 'Trips', href: '/trips', icon: 'Route' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  pending: [
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getRoleColor(role: string): string {
  const found = ADMIN_ROLES.find(r => r.value === role);
  return found?.color || ADMIN_ROLES[3].color;
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

export function getOrganizationTypeLabel(type: string): string {
  const found = ORGANIZATION_TYPES.find(t => t.value === type);
  return found?.label || type.replace(/_/g, ' ');
}

export function getPlaceCategoryLabel(category: string): string {
  const found = PLACE_CATEGORIES.find(c => c.value === category);
  return found?.label || category;
}

export function getPlaceCategoryColor(category: string): string {
  return PLACE_CATEGORY_COLORS[category] || PLACE_CATEGORY_COLORS.other;
}

export function getVisitorSegmentLabel(segment: string): string {
  const found = VISITOR_SEGMENTS.find(s => s.value === segment);
  return found?.label || segment;
}