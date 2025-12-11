// src/components/reports/report-filters.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, Filter, X } from 'lucide-react';
import { TRIP_STATUSES } from '@/lib/constants';
import type { District } from '@/types';

interface ReportFiltersProps {
  districts: District[];
  filters: {
    startDate: string;
    endDate: string;
    districtId: string;
    status: string;
  };
  onFiltersChange: (filters: {
    startDate: string;
    endDate: string;
    districtId: string;
    status: string;
  }) => void;
}

export function ReportFilters({
  districts,
  filters,
  onFiltersChange,
}: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasFilters = filters.startDate || filters.endDate || filters.districtId || filters.status;

  const clearFilters = () => {
onFiltersChange({
  startDate: '',
  endDate: '',
  districtId: '',
  status: '',
});

  };

  const activeFiltersCount = [
    filters.startDate,
    filters.endDate,
    filters.districtId,
    filters.status,
  ].filter(Boolean).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Report Filters</h4>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                className="h-9"
              />
            </div>
          </div>

          {/* District */}
          <div className="space-y-1">
<Select
  value={filters.districtId || "all"}
  onValueChange={(value) =>
    onFiltersChange({ ...filters, districtId: value === "all" ? "" : value })
  }
>
  <SelectTrigger className="h-9">
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

          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs">Trip Status</Label>
<Select
  value={filters.status || "all"}
  onValueChange={(value) =>
    onFiltersChange({ ...filters, status: value === "all" ? "" : value })
  }
>
  <SelectTrigger className="h-9">
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

          </div>

          <Button className="w-full" onClick={() => setIsOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}