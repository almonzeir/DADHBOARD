// src/components/ReportButton.tsx
// @ts-nocheck
'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export default function ReportButton() {
    const [loading, setLoading] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        const element = document.getElementById('dashboard-container'); // Capture the main container

        if (!element) {
            setLoading(false);
            console.error('Dashboard container not found!');
            return;
        }

        try {
            // 1. High-Scale Capture
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0f172a', // Force Dark Mode Background
                logging: false,
            });

            // 2. Calculate PDF Dimensions
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 297; // A4 Landscape width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 3. Save
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`MaiKedah_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("PDF Failed", err);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={generatePDF}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
        >
            {loading ? (
                <span>Generating...</span>
            ) : (
                <>
                    <Download size={16} />
                    <span>Export Full Report</span>
                </>
            )}
        </button>
    );
}
