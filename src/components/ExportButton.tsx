'use client';

/**
 * Export button component
 */

import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentRecord, AnalysisSummary } from '@/src/types/student';
import { exportToExcel } from '@/src/lib/excelExporter';

interface ExportButtonProps {
    students: StudentRecord[];
    analysis: AnalysisSummary | null;
    disabled?: boolean;
}

export function ExportButton({ students, analysis, disabled = false }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (students.length === 0) return;

        setIsExporting(true);
        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 100));

            exportToExcel(students, analysis, {
                includeSubjectDetails: true,
                includeSummarySheet: true,
                fileName: 'academic_results',
            });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={disabled || students.length === 0 || isExporting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
            size="sm"
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                </>
            )}
        </Button>
    );
}
