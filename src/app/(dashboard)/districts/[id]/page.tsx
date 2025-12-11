// src/app/(dashboard)/districts/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDistrict, useDistrictMutations } from '@/hooks/use-districts';
import { DistrictFormDialog } from '@/components/districts/district-form-dialog';
import { DeleteDistrictDialog } from '@/components/districts/delete-district-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Building,
  Home,
  Route,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { District } from '@/types';
import Image from 'next/image';

export default function DistrictDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAuth();
  const districtId = params.id as string;

  const { data: district, stats, isLoading, refetch } = useDistrict(districtId);
  const { update, remove, uploadImage, isLoading: mutationLoading } = useDistrictMutations();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canEdit = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  const handleEditSubmit = async (data: Omit<District, 'id' | 'created_at'>, imageFile?: File) => {
    let imageUrl = data.image_url;

    if (imageFile) {
      const uploadResult = await uploadImage(imageFile, districtId);
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url;
      }
    }

    const result = await update(districtId, { ...data, image_url: imageUrl });
    if (result.success) {
      toast.success('District updated successfully');
      setEditDialogOpen(false);
      refetch();
    } else {
      toast.error(result.error || 'Failed to update district');
    }
  };

  const handleDeleteConfirm = async () => {
    const result = await remove(districtId);
    if (result.success) {
      toast.success('District deleted successfully');
      router.push('/districts');
    } else {
      toast.error(result.error || 'Failed to delete district');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">District Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested district could not be found.
        </p>
        <Button onClick={() => router.push('/districts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Districts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{district.name}</h1>
            {district.name_ms && district.name_ms !== district.name && (
              <p className="text-muted-foreground">{district.name_ms}</p>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              {district.image_url ? (
                <Image
                  src={district.image_url}
                  alt={district.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {district.description || 'No description available for this district.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Overview of this district</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span>Places</span>
                </div>
                <Badge variant="secondary">{stats?.placesCount || 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <span>Accommodations</span>
                </div>
                <Badge variant="secondary">{stats?.accommodationsCount || 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-muted-foreground" />
                  <span>Trips</span>
                </div>
                <Badge variant="secondary">{stats?.tripsCount || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/places?district=${districtId}`)}
              >
                <Building className="h-4 w-4 mr-2" />
                View Places
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/trips?district=${districtId}`)}
              >
                <Route className="h-4 w-4 mr-2" />
                View Trips
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Added on {formatDate(district.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <DistrictFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isLoading={mutationLoading}
        district={district}
        mode="edit"
      />

      <DeleteDistrictDialog
        district={district ? { ...district, ...stats } : null}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={mutationLoading}
      />
    </div>
  );
}