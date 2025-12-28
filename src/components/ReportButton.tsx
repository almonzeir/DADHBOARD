// src/components/ReportButton.tsx
'use client';

import { useReports } from '@/hooks/use-reports';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportButton() {
    const { generateExecutiveReport, isLoading } = useReports();

    return (
        <Button
            onClick={() => generateExecutiveReport()}
            disabled={isLoading}
            variant="default"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Download size={16} />
            )}
            <span>{isLoading ? 'Processing Intelligence...' : 'Export Strategic Report'}</span>
        </Button>
    );
}
