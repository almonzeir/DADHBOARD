// src/app/(dashboard)/districts/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDistrictsWithStats, useDistrictMutations, DistrictWithStats } from '@/hooks/use-districts';
import { DistrictCard } from '@/components/districts/district-card';
import { DistrictFormDialog } from '@/components/districts/district-form-dialog';
import { DeleteDistrictDialog } from '@/components/districts/delete-district-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MapPin, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import type { District } from '@/types';

export default function DistrictsPage() {
  const router = useRouter();
  const { admin } = useAuth();
  const { data: districts, isLoading, refetch } = useDistrictsWithStats();
  const { create, update, remove, uploadImage, isLoading: mutationLoading } = useDistrictMutations();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'places' | 'trips'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictWithStats | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const isSuperAdmin = admin?.role === 'super_admin';
  const canEdit = isSuperAdmin || admin?.role === 'org_admin';

  // Filter and sort districts
  const filteredDistricts = districts
    .filter((district) =>
      district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.name_ms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'places':
          return (b.placesCount || 0) - (a.placesCount || 0);
        case 'trips':
          return (b.tripsCount || 0) - (a.tripsCount || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Handlers
  const handleCreate = () => {
    setSelectedDistrict(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleEdit = (district: DistrictWithStats) => {
    setSelectedDistrict(district);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  const handleDelete = (district: DistrictWithStats) => {
    setSelectedDistrict(district);
    setDeleteDialogOpen(true);
  };

  const handleView = (district: DistrictWithStats) => {
    router.push(`/districts/${district.id}`);
  };

  const handleFormSubmit = async (data: Omit<District, 'id' | 'created_at'>, imageFile?: File) => {
    let imageUrl = data.image_url;

    // Upload image if provided
    if (imageFile && formMode === 'create') {
      // For create, we'll need to create first then upload
      // This is a simplified approach - in production, consider using a temp ID or different flow
    }

    if (formMode === 'create') {
      const result = await create(data);
      if (result.success) {
        // Upload image if file is provided
        if (imageFile && result.data) {
          const uploadResult = await uploadImage(imageFile, result.data.id);
          if (uploadResult.success && uploadResult.url) {
            await update(result.data.id, { image_url: uploadResult.url });
          }
        }
        toast.success('District created successfully');
        setFormDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || 'Failed to create district');
      }
    } else if (selectedDistrict) {
      // Upload new image if provided
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, selectedDistrict.id);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const result = await update(selectedDistrict.id, { ...data, image_url: imageUrl });
      if (result.success) {
        toast.success('District updated successfully');
        setFormDialogOpen(false);
        refetch();
      } else {
        toast.error(result.error || 'Failed to update district');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDistrict) return;

    const result = await remove(selectedDistrict.id);
    if (result.success) {
      toast.success('District deleted successfully');
      setDeleteDialogOpen(false);
      refetch();
    } else {
      toast.error(result.error || 'Failed to delete district');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Districts</h1>
          <p className="text-muted-foreground mt-1">
            Manage the 12 districts of Kedah
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add District
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="places">Most Places</SelectItem>
              <SelectItem value="trips">Most Trips</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {/* Districts Grid/List */}
      {isLoading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredDistricts.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredDistricts.map((district) => (
            <DistrictCard
              key={district.id}
              district={district}
              onView={() => handleView(district)}
              onEdit={() => handleEdit(district)}
              onDelete={() => handleDelete(district)}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No districts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by adding your first district'}
          </p>
          {canEdit && !searchQuery && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add District
            </Button>
          )}
        </div>
      )}

      {/* Summary */}
      {!isLoading && filteredDistricts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDistricts.length} of {districts.length} districts
        </div>
      )}

      {/* Dialogs */}
      <DistrictFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        isLoading={mutationLoading}
        district={selectedDistrict}
        mode={formMode}
      />

      <DeleteDistrictDialog
        district={selectedDistrict}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={mutationLoading}
      />
    </div>
  );
}