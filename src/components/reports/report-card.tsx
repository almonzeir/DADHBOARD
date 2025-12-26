// src/components/reports/report-card.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, Loader2, ArrowDownToLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  stats?: { label: string; value: string | number }[];
  onExportCSV: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

export function ReportCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  stats,
  onExportCSV,
  onExportPDF,
  isLoading = false,
}: ReportCardProps) {
  return (
    <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {stats.map((stat, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="font-medium bg-muted/70 text-xs py-1.5 px-3"
              >
                {stat.label}: <span className="font-bold ml-1 text-foreground">{stat.value}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl border-dashed hover:border-solid hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/30 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl border-dashed hover:border-solid hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/30 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}