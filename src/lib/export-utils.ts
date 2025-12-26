// src/lib/export-utils.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';

// ============================================
// VISUAL REPORT EXPORT (HTML -> PDF)
// ============================================

export async function generateVisualReport(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report element not found');
  }

  try {
    // Wait for a moment to ensure rendering is complete (especially charts)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true, // For images if any
      backgroundColor: '#0f172a', // Ensure slate-950 background
      logging: false,
    } as any);

    const imgData = canvas.toDataURL('image/png');

    // PDF Dimensions (A4 Landscape or Custom Wide)
    // A4 Landscape: 297mm x 210mm
    // Let's use custom wide format to match screen ratio better if needed,
    // but A4 Landscape is standard for printing.
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit width
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    // If the content is very long, we might need multiple pages,
    // but for this specific executive summary, we fit to one wide page or split.
    // For now, let's fit width and allow height to flow or scale down.

    const finalImgWidth = pdfWidth;
    const finalImgHeight = (imgHeight * pdfWidth) / imgWidth;

    pdf.addImage(imgData, 'PNG', 0, 0, finalImgWidth, finalImgHeight);

    pdf.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { success: false, error: 'Failed to generate visual report' };
  }
}

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
      const value = item[col.key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '""';
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return `"${String(value).replace(/"/g, '""')}"`;
      }
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
// PDF EXPORT (Legacy/Table-based)
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
  yPosition += 5;

  // Separator Line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
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
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
          // Format numbers
          if (col.key.includes('budget') || col.key.includes('fee') || col.key.includes('price')) {
            return `RM ${value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
          }
          return value.toLocaleString();
        }
        // Format dates if the key suggests it and it's a valid date string
        if ((col.key.includes('date') || col.key.includes('created_at')) && typeof value === 'string' && !isNaN(Date.parse(value))) {
            try {
                return format(new Date(value), 'yyyy-MM-dd');
            } catch {
                return String(value);
            }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages();
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
  { key: 'title', label: 'Trip Title', width: 40 },
  { key: 'status', label: 'Status', width: 20 },
  { key: 'start_date', label: 'Start', width: 25 },
  { key: 'districts', label: 'Districts', width: 30 },
  { key: 'no_traveler', label: 'Pax', width: 15 },
  { key: 'visitor_segment', label: 'Segment', width: 25 },
  { key: 'budget', label: 'Budget (RM)', width: 25 },
  { key: 'created_at', label: 'Date Created', width: 25 },
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
