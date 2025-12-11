// src/components/reports/report-card.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
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
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {stats.map((stat, index) => (
              <Badge key={index} variant="secondary" className="font-normal">
                {stat.label}: <span className="font-semibold ml-1">{stat.value}</span>
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
            className="flex-1"
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
            className="flex-1"
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