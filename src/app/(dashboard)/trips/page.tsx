// src/app/(dashboard)/trips/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTrips, useTripStats, useTripMutations } from '@/hooks/use-trips';
import { useDistricts } from '@/hooks/use-districts';
import { TripCard } from '@/components/trips/trip-card';
import { DeleteTripDialog } from '@/components/trips/delete-trip-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Route,
  X,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { TRIP_STATUSES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { TravelPlan, TripStatus } from '@/types';

export default function TripsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { admin } = useAuth();

  // Get initial filters from URL
const initialDistrictId = searchParams.get('district') || "all";
const initialStatus = searchParams.get('status') || "all";

const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
const [districtFilter, setDistrictFilter] = useState(initialDistrictId);


  // State
  const [searchQuery, setSearchQuery] = useState('');
/*   const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [districtFilter, setDistrictFilter] = useState(initialDistrictId); */

  // Data hooks
/*   const { data: trips, isLoading, refetch } = useTrips({
    status: statusFilter as TripStatus | undefined,
    districtId: districtFilter || undefined,
    search: searchQuery || undefined,
  }); */
  const { data: trips, isLoading, refetch } = useTrips({
  status: statusFilter === "all" ? undefined : (statusFilter as TripStatus),
  districtId: districtFilter === "all" ? undefined : districtFilter,
  search: searchQuery || undefined,
});
  const { data: stats, refetch: refetchStats } = useTripStats();
  const { data: districts } = useDistricts();
  const { updateStatus, remove, isLoading: mutationLoading } = useTripMutations();

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TravelPlan | null>(null);

  const canEdit = admin?.role === 'super_admin' || admin?.role === 'org_admin';

  // Filter trips by search (additional client-side filtering)
  const filteredTrips = useMemo(() => {
    if (!searchQuery) return trips;

    const query = searchQuery.toLowerCase();
    return trips.filter(trip =>
      trip.title.toLowerCase().includes(query) ||
      trip.district_names?.some(d => d.toLowerCase().includes(query))
    );
  }, [trips, searchQuery]);

  // Handlers
  const handleView = (trip: TravelPlan) => {
    router.push(`/trips/${trip.id}`);
  };

  const handleDelete = (trip: TravelPlan) => {
    setSelectedTrip(trip);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (trip: TravelPlan, status: TripStatus) => {
    const result = await updateStatus(trip.id, status);
    if (result.success) {
      toast.success(`Trip marked as ${status}`);
      refetch();
      refetchStats();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrip) return;

    const result = await remove(selectedTrip.id);
    if (result.success) {
      toast.success('Trip deleted successfully');
      setDeleteDialogOpen(false);
      refetch();
      refetchStats();
    } else {
      toast.error(result.error || 'Failed to delete trip');
    }
  };

const clearFilters = () => {
  setSearchQuery('');
  setStatusFilter('all');
  setDistrictFilter('all');
};


  const hasActiveFilters = searchQuery || statusFilter || districtFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Trips</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all travel plans
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Travelers</p>
                <p className="text-2xl font-bold">{stats.totalTravelers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    {TRIP_STATUSES.map((status) => (
      <SelectItem key={status.value} value={status.value}>
        {status.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


        {/* District Filter */}
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


        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
          </Badge>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground">
              (filtered from {stats.total} total)
            </span>
          )}
        </div>
      )}

      {/* Trips List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onView={() => handleView(trip)}
              onDelete={() => handleDelete(trip)}
              onStatusChange={(status) => handleStatusChange(trip, status)}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Route className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trips found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'No travel plans have been created yet'}
          </p>
        </div>
      )}

      

      {/* Delete Dialog */}
      <DeleteTripDialog
        trip={selectedTrip}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={mutationLoading}
      />
    </div>
  );
}