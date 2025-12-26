// @ts-nocheck
// src/lib/export-utils.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// ============================================
// CSV EXPORT
// ============================================

/**
 * Convert data array to CSV string
 */
export function convertToCSV(data: any[], columns: { key: string; label: string }[]): string {
  if (data.length === 0) return '';

  // Header row
  const header = columns.map(col => `"${col.label}"`).join(',');

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];

      // Handle different value types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }

      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// PDF EXPORT
// ============================================

interface PDFReportOptions {
  title: string;
  subtitle?: string;
  columns: { key: string; label: string; width?: number }[];
  data: any[];
  summary?: { label: string; value: string | number }[];
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generate and download PDF report
 */
export function generatePDFReport(options: PDFReportOptions): void {
  const {
    title,
    subtitle,
    columns,
    data,
    summary,
    orientation = 'portrait',
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    `Generated on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 12;

  // Summary section
  if (summary && summary.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Summary', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    summary.forEach((item, index) => {
      const xPos = margin + (index % 3) * 60;
      if (index > 0 && index % 3 === 0) {
        yPosition += 12;
      }

      doc.setTextColor(100);
      doc.text(item.label, xPos, yPosition);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(String(item.value), xPos, yPosition + 5);
      doc.setFont('helvetica', 'normal');
    });

    yPosition += 20;
  }

  // Data table
  if (data.length > 0) {
    const tableHeaders = columns.map(col => col.label);
    const tableData = data.map(item =>
      columns.map(col => {
        let value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
          // Format numbers
          if (col.key.includes('budget') || col.key.includes('fee') || col.key.includes('price')) {
            return `RM ${value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
          }
          return value.toLocaleString();
        }
        return String(value);
      })
    );

    autoTable(doc, {
      startY: yPosition,
      head: [tableHeaders],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as Record<number, { cellWidth: number }>),
    });
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'MaiKedah Admin Dashboard',
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download
  doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ============================================
// PREDEFINED REPORT COLUMNS
// ============================================

export const TRIPS_REPORT_COLUMNS = [
  { key: 'title', label: 'Trip Title', width: 50 },
  { key: 'status', label: 'Status', width: 20 },
  { key: 'start_date', label: 'Start Date', width: 25 },
  { key: 'end_date', label: 'End Date', width: 25 },
  { key: 'districts', label: 'Districts', width: 35 },
  { key: 'no_traveler', label: 'Travelers', width: 20 },
  { key: 'visitor_segment', label: 'Segment', width: 25 },
  { key: 'budget', label: 'Budget (RM)', width: 25 },
];

export const PLACES_REPORT_COLUMNS = [
  { key: 'name', label: 'Place Name', width: 45 },
  { key: 'category', label: 'Category', width: 25 },
  { key: 'district', label: 'District', width: 30 },
  { key: 'entrance_fee', label: 'Fee (RM)', width: 20 },
  { key: 'rating', label: 'Rating', width: 15 },
  { key: 'popularity_score', label: 'Popularity', width: 20 },
  { key: 'is_active', label: 'Status', width: 20 },
];

export const DISTRICTS_REPORT_COLUMNS = [
  { key: 'name', label: 'District Name', width: 50 },
  { key: 'name_ms', label: 'Name (Malay)', width: 50 },
  { key: 'places_count', label: 'Places', width: 25 },
  { key: 'trips_count', label: 'Trips', width: 25 },
];