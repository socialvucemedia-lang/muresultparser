/**
 * Excel export using xlsx library
 */

import * as XLSX from 'xlsx';
import type { StudentRecord, AnalysisSummary, ExportOptions } from '@/src/types/student';
import { getKTSummary } from './ktDetector';

/**
 * Export students and analysis to Excel
 */
export function exportToExcel(
    students: StudentRecord[],
    analysis: AnalysisSummary | null,
    options: ExportOptions = { includeSubjectDetails: false, includeSummarySheet: true, fileName: 'results' }
): void {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add main student sheet
    const studentSheet = createStudentSheet(students, options.includeSubjectDetails);
    XLSX.utils.book_append_sheet(wb, studentSheet, 'Students');

    // Add summary sheet if requested
    if (options.includeSummarySheet && analysis) {
        const summarySheet = createSummarySheet(analysis);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    }

    // Generate and download
    const fileName = `${options.fileName}_${formatDate(new Date())}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Create the main students data sheet
 */
function createStudentSheet(students: StudentRecord[], includeSubjects: boolean): XLSX.WorkSheet {
    // Define headers
    const headers = [
        'Sr. No.',
        'Seat No',
        'Name',
        'Gender',
        'ERN',
        'College',
        'Total Marks',
        'Result',
        'SGPA',
        'Total KT',
        'Internal KT',
        'External KT',
        'Term Work KT',
        'Failed Subjects',
    ];

    if (includeSubjects) {
        // Add subject columns
        headers.push(
            'Applied Maths-I',
            'Applied Physics',
            'Applied Chemistry',
            'Engineering Mechanics',
            'Basic Electrical',
            'Physics Lab',
            'Chemistry Lab',
            'Mechanics Lab',
            'Electrical Lab',
            'Prof. Comm. Ethics',
            'Prof. Comm. TW',
            'Workshop-I',
            'C Programming',
            'Human Values'
        );
    }

    // Create rows
    const rows = students.map((student, index) => {
        const row: (string | number)[] = [
            index + 1,
            student.seatNumber,
            student.name,
            student.gender || '',
            student.ern || '',
            student.college,
            student.totalMarks,
            student.result,
            student.sgpa,
            student.kt.totalKT,
            student.kt.internalKT,
            student.kt.externalKT,
            student.kt.termWorkKT,
            student.kt.failedSubjects.join(', '),
        ];

        if (includeSubjects) {
            // Add subject totals
            for (const subject of student.subjects) {
                row.push(`${subject.marks.total} (${subject.marks.grade})`);
            }
        }

        return row;
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    ws['!cols'] = [
        { wch: 6 },   // Sr. No.
        { wch: 10 },  // Seat No
        { wch: 25 },  // Name
        { wch: 8 },   // Gender
        { wch: 22 },  // ERN
        { wch: 40 },  // College
        { wch: 12 },  // Total Marks
        { wch: 8 },   // Result
        { wch: 8 },   // SGPA
        { wch: 10 },  // Total KT
        { wch: 12 },  // Internal KT
        { wch: 12 },  // External KT
        { wch: 14 },  // Term Work KT
        { wch: 40 },  // Failed Subjects
    ];

    return ws;
}

/**
 * Create the summary statistics sheet
 */
function createSummarySheet(analysis: AnalysisSummary): XLSX.WorkSheet {
    const data = [
        ['Analysis Summary'],
        [],
        ['Metric', 'Value'],
        ['Total Students', analysis.totalStudents],
        ['Passed', analysis.passedCount],
        ['Failed', analysis.failedCount],
        ['Pass Percentage', `${analysis.passPercentage}%`],
        [],
        ['Marks Analysis'],
        ['Highest Marks', analysis.highestMarks],
        ['Lowest Marks', analysis.lowestMarks],
        ['Average Marks', analysis.averageMarks],
        ['Average SGPA', analysis.averageSGPA],
        [],
        ['KT Analysis'],
        ['Students with KT', analysis.studentsWithKT],
        ['Average KT per Student', analysis.averageKTPerStudent],
        [],
        ['Marks Distribution'],
        ['Distinction (≥75%)', analysis.marksDistribution.distinction],
        ['First Class (≥60%)', analysis.marksDistribution.firstClass],
        ['Second Class (≥50%)', analysis.marksDistribution.secondClass],
        ['Pass Class (≥40%)', analysis.marksDistribution.passClass],
        ['Fail (<40%)', analysis.marksDistribution.fail],
        [],
        ['KT Distribution'],
        ['No KT', analysis.ktDistribution.noKT],
        ['1 KT', analysis.ktDistribution.oneKT],
        ['2 KT', analysis.ktDistribution.twoKT],
        ['3+ KT', analysis.ktDistribution.threeOrMoreKT],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 25 },
        { wch: 15 },
    ];

    return ws;
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate downloadable blob (alternative to direct download)
 */
export function generateExcelBlob(
    students: StudentRecord[],
    analysis: AnalysisSummary | null,
    options: ExportOptions
): Blob {
    const wb = XLSX.utils.book_new();

    const studentSheet = createStudentSheet(students, options.includeSubjectDetails);
    XLSX.utils.book_append_sheet(wb, studentSheet, 'Students');

    if (options.includeSummarySheet && analysis) {
        const summarySheet = createSummarySheet(analysis);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
