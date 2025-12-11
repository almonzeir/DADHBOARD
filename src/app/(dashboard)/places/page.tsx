// src/app/(dashboard)/places/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePlaces, usePlaceMutations } from '@/hooks/use-places';
import { useDistricts } from '@/hooks/use-districts';
import { PlaceCard } from '@/components/places/place-card';
import { PlaceFormDialog } from '@/components/places/place-form-dialog';
import { DeletePlaceDialog } from '@/components/places/delete-place-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MapPin, LayoutGrid, List, X } from 'lucide-react';
import { toast } from 'sonner';
import { PLACE_CATEGORIES } from '@/lib/constants';
import type { Place, PlaceCategory } from '@/types';

export default function PlacesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { admin } = useAuth();
  
  // Get initial filters from URL
  const initialDistrictId = searchParams.get('district') || '';
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
const [districtFilter, setDistrictFilter] = useState(initialDistrictId || "all");
const [categoryFilter, setCategoryFilter] = useState<string>("all");
const [statusFilter, setStatusFilter] = useState<string>("all");

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Data hooks
  const { data: allPlaces, isLoading, refetch } = usePlaces();
  const { data: districts } = useDistricts();
  const { create, update, remove, toggleStatus, uploadImage, isLoading: mutationLoading } = usePlaceMutations();
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const canEdit = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  // Filter places
const filteredPlaces = useMemo(() => {
  return allPlaces.filter((place) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        place.name.toLowerCase().includes(query) ||
        place.name_ms?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // District filter
    if (districtFilter !== "all" && place.district_id !== districtFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && place.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active" && !place.is_active) return false;
      if (statusFilter === "inactive" && place.is_active) return false;
      if (statusFilter === "hidden_gem" && !place.is_hidden_gem) return false;
    }

    return true;
  });
}, [allPlaces, searchQuery, districtFilter, categoryFilter, statusFilter]);

  // Handlers
  const handleCreate = () => {
    setSelectedPlace(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleEdit = (place: Place) => {
    setSelectedPlace(place);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  const handleDelete = (place: Place) => {
    setSelectedPlace(place);
    setDeleteDialogOpen(true);
  };

  const handleView = (place: Place) => {
    router.push(`/places/${place.id}`);
  };

  const handleToggleStatus = async (place: Place) => {
    const result = await toggleStatus(place.id, !place.is_active);
    if (result.success) {
      toast.success(`Place ${place.is_active ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const handleFormSubmit = async (
    data: Omit<Place, 'id' | 'created_at' | 'updated_at' | 'district'>,
    imageFile?: File
  ) => {
    let imageUrl = data.image_url;

    if (formMode === 'create') {
      const result = await create(data);
      if (result.success && result.data) {
        // Upload image if provided
        if (imageFile) {
          const uploadResult = await uploadImage(imageFile, result.data.id);
          if (uploadResult.success && uploadResult.url) {
            await update(result.data.id, { image_url: uploadResult.url });
          }
        }
        toast.success('Place created successfully');
        setFormDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || 'Failed to create place');
      }
    } else if (selectedPlace) {
      // Upload new image if provided
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, selectedPlace.id);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const result = await update(selectedPlace.id, { ...data, image_url: imageUrl });
      if (result.success) {
        toast.success('Place updated successfully');
        setFormDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || 'Failed to update place');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlace) return;

    const result = await remove(selectedPlace.id);
    if (result.success) {
      toast.success('Place deleted successfully');
      setDeleteDialogOpen(false);
      refetch();
    } else {
      toast.error(result.error || 'Failed to delete place');
    }
  };

const clearFilters = () => {
  setSearchQuery('');
  setDistrictFilter('all');
  setCategoryFilter('all');
  setStatusFilter('all');
};


  const hasActiveFilters = searchQuery || districtFilter || categoryFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Places</h1>
          <p className="text-muted-foreground mt-1">
            Manage attractions and points of interest
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Place
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
<Select value={districtFilter} onValueChange={setDistrictFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All Districts" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Districts</SelectItem>
    {districts.map((district) => (
      <SelectItem key={district.id} value={district.id}>
        {district.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


<Select value={categoryFilter} onValueChange={setCategoryFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem>
    {PLACE_CATEGORIES.map((cat) => (
      <SelectItem key={cat.value} value={cat.value}>
        {cat.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
    <SelectItem value="hidden_gem">Hidden Gems</SelectItem>
  </SelectContent>
</Select>


          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
          </Badge>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground">
              (filtered from {allPlaces.length} total)
            </span>
          )}
        </div>
      )}

      {/* Places Grid/List */}
      {isLoading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : filteredPlaces.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onView={() => handleView(place)}
              onEdit={() => handleEdit(place)}
              onDelete={() => handleDelete(place)}
              onToggleStatus={() => handleToggleStatus(place)}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No places found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Get started by adding your first place'}
          </p>
          {canEdit && !hasActiveFilters && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Place
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <PlaceFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        isLoading={mutationLoading}
        place={selectedPlace}
        mode={formMode}
        districts={districts}
      />

      <DeletePlaceDialog
        place={selectedPlace}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={mutationLoading}
      />
    </div>
  );
}