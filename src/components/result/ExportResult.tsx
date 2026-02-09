'use client';

/**
 * ExportResult - Excel export for individual student result
 */

import { useState, useCallback } from 'react';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import type { StudentRecord } from '@/src/types/student';

interface ExportResultProps {
    student: StudentRecord;
}

export function ExportResult({ student }: ExportResultProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        setIsExporting(true);

        try {
            // Create workbook
            const wb = XLSX.utils.book_new();

            // Student Info Sheet
            const infoData = [
                ['Student Result Report'],
                [],
                ['Name', student.name],
                ['Seat Number', student.seatNumber],
                ['ERN', student.ern || 'N/A'],
                ['College', student.college],
                ['Gender', student.gender || 'N/A'],
                ['Status', student.status],
                [],
                ['Academic Summary'],
                ['Total Marks', `${student.totalMarks}/${student.maxMarks}`],
                ['Result', student.result],
                ['SGPA', student.sgpa > 0 ? student.sgpa.toFixed(2) : 'N/A'],
                ['Total Credits', student.totalCredits],
                ['Credit Points', student.totalCreditPoints],
                [],
                ['KT Summary'],
                ['Total KT', student.kt.totalKT],
                ['Internal KT', student.kt.internalKT],
                ['External KT', student.kt.externalKT],
                ['Term Work KT', student.kt.termWorkKT],
                ['Oral KT', student.kt.oralKT],
                ['Failed Subjects', student.kt.failedSubjects.join(', ') || 'None'],
            ];

            const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
            infoSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
            XLSX.utils.book_append_sheet(wb, infoSheet, 'Summary');

            // Subjects Sheet
            const subjectHeaders = [
                'Sr. No.',
                'Subject Code',
                'Subject Name',
                'Term Work',
                'Oral',
                'Internal',
                'External',
                'Total',
                'Grade',
                'Grade Point',
                'Credits',
                'Credit Points',
                'Status',
                'KT Type',
            ];

            const subjectRows = student.subjects.map((subject, index) => [
                index + 1,
                subject.code,
                subject.name,
                subject.marks.termWork ?? '-',
                subject.marks.oral ?? '-',
                subject.marks.internal ?? '-',
                subject.marks.external ?? '-',
                subject.marks.total,
                subject.marks.grade,
                subject.marks.gradePoint,
                subject.marks.credits,
                subject.marks.creditPoints,
                subject.marks.status || '-',
                subject.isKT ? (subject.ktType || 'Yes') : '-',
            ]);

            const subjectSheet = XLSX.utils.aoa_to_sheet([subjectHeaders, ...subjectRows]);
            subjectSheet['!cols'] = [
                { wch: 6 },   // Sr. No.
                { wch: 12 },  // Code
                { wch: 30 },  // Name
                { wch: 10 },  // TW
                { wch: 8 },   // Oral
                { wch: 10 },  // Internal
                { wch: 10 },  // External
                { wch: 8 },   // Total
                { wch: 8 },   // Grade
                { wch: 12 },  // GP
                { wch: 8 },   // Credits
                { wch: 14 },  // Credit Points
                { wch: 8 },   // Status
                { wch: 12 },  // KT Type
            ];
            XLSX.utils.book_append_sheet(wb, subjectSheet, 'Subjects');

            // Generate filename
            const sanitizedName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Result_${sanitizedName}_${student.seatNumber}.xlsx`;

            // Download
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [student]);

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            className="gap-2"
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Download Excel
                </>
            )}
        </Button>
    );
}
