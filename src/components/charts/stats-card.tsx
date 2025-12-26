// @ts-nocheck
// src/components/charts/stats-card.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mt-4" />
          <Skeleton className="h-3 w-16 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            "bg-primary/10"
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1",
              changeType === 'positive' && "text-green-600 dark:text-green-400",
              changeType === 'negative' && "text-red-600 dark:text-red-400",
              changeType === 'neutral' && "text-muted-foreground"
            )}>
              {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
              {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
