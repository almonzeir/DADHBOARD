// src/components/analytics/date-range-picker.tsx

'use client';

import * as React from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

const presets = [
  { label: 'Last 7 days', value: '7d', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: '30d', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 months', value: '3m', getDates: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'Last 6 months', value: '6m', getDates: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: 'This month', value: 'tm', getDates: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Last month', value: 'lm', getDates: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'This year', value: 'ty', getDates: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) },
];

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetChange = (value: string) => {
    const preset = presets.find(p => p.value === value);
    if (preset) {
      onDateRangeChange(preset.getDates());
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Preset Selector */}
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Quick select" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Range */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal min-w-60',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateRangeChange(undefined);
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}