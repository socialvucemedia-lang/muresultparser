/**
 * Excel export using xlsx library
 */

import * as XLSX from 'xlsx';
import type { StudentRecord, AnalysisSummary, ExportOptions, SubjectMarks } from '@/src/types/student';
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
 * All 14 subject codes in PDF order with their names
 * isLab = true → only show TOT column in Excel
 */
const ALL_SUBJECTS = [
    { code: '10411', abbr: 'AM-I', name: 'Applied Mathematics-I', isLab: false },
    { code: '10412', abbr: 'AP', name: 'Applied Physics', isLab: false },
    { code: '10413', abbr: 'AC', name: 'Applied Chemistry', isLab: false },
    { code: '10414', abbr: 'EM', name: 'Engineering Mechanics', isLab: false },
    { code: '10415', abbr: 'BEE', name: 'Basic Electrical & Electronics Engineering', isLab: false },
    { code: '10416', abbr: 'APL', name: 'Applied Physics Lab', isLab: true },
    { code: '10417', abbr: 'ACL', name: 'Applied Chemistry Lab', isLab: true },
    { code: '10418', abbr: 'EML', name: 'Engineering Mechanics Lab', isLab: true },
    { code: '10419', abbr: 'BEEL', name: 'Basic Electrical & Electronics Engineering Lab', isLab: true },
    { code: '10420', abbr: 'PCE', name: 'Professional Communication Ethics', isLab: true },
    { code: '10421', abbr: 'PCETW', name: 'Professional Communication Ethics TW', isLab: true },
    { code: '10422', abbr: 'EW-I', name: 'Engineering Workshop-I', isLab: true },
    { code: '10423', abbr: 'CP', name: 'C Programming', isLab: true },
    { code: '10424', abbr: 'IUHV', name: 'Induction cum Universal Human Values', isLab: true },
];

/**
 * Per-subject column suffixes
 */
const SUBJECT_COLUMNS = ['T1', 'O1', 'E1', 'I1', 'TOT', 'Grade', 'KT'] as const;

/**
 * Map column suffix to SubjectMarks field
 */
function getMarkValue(marks: SubjectMarks, col: typeof SUBJECT_COLUMNS[number]): string | number {
    switch (col) {
        case 'T1': return marks.termWork ?? '';
        case 'O1': return marks.oral ?? '';
        case 'E1': return marks.external ?? '';
        case 'I1': return marks.internal ?? '';
        case 'TOT': return marks.total ?? '';
        case 'Grade': return marks.grade || '';
        case 'KT': return '';  // handled at subject level
    }
}

/**
 * Create the main students data sheet with full subject breakdown
 * Format: Student Info | 14 subjects × 7 columns | Summary
 */
function createStudentSheet(students: StudentRecord[], includeSubjects: boolean): XLSX.WorkSheet {
    if (!students || students.length === 0) {
        return XLSX.utils.aoa_to_sheet([['No data available']]);
    }

    // ── Build header row ──────────────────────────────────────────────
    const headers: string[] = [
        'Seat No', 'Name', 'Status', 'Gender', 'ERN', 'College',
    ];

    // Add columns per subject: full breakdown for theory, just TOT for labs
    ALL_SUBJECTS.forEach(subj => {
        if (subj.isLab) {
            headers.push(`${subj.abbr} TOT`);
        } else {
            SUBJECT_COLUMNS.forEach(col => {
                headers.push(`${subj.abbr} ${col}`);
            });
        }
    });

    // Summary columns at the end
    headers.push('Total Marks', 'Result', 'Remark', 'SGPA');

    // ── Build data rows ───────────────────────────────────────────────
    const dataRows = students.map(student => {
        const row: (string | number)[] = [
            student.seatNumber || '',
            student.name || '',
            student.status || '',
            student.gender || '',
            student.ern || '',
            student.college || '',
        ];

        // Per-subject marks
        ALL_SUBJECTS.forEach(subDef => {
            const subj = student.subjects.find(s => s.code === subDef.code);

            if (subDef.isLab) {
                // Labs: only TOT column
                row.push(subj?.marks?.total ?? '');
            } else if (subj && subj.marks) {
                // Theory: full T1, O1, E1, I1, TOT, Grade, KT
                SUBJECT_COLUMNS.forEach(col => {
                    if (col === 'KT') {
                        row.push(subj.isKT ? 'KT' : '');
                    } else {
                        row.push(getMarkValue(subj.marks, col));
                    }
                });
            } else {
                // Theory subject not found – fill 7 empty cells
                SUBJECT_COLUMNS.forEach(() => row.push(''));
            }
        });

        // Summary columns
        row.push(
            student.totalMarks || '',
            student.result || '',
            student.kt?.hasKT ? `KT (${student.kt.totalKT})` : '',
            student.sgpa || '',
        );

        return row;
    });

    // ── Create worksheet ──────────────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // ── Column widths ─────────────────────────────────────────────────
    const colWidths: XLSX.ColInfo[] = [
        { wch: 12 },  // Seat No
        { wch: 28 },  // Name
        { wch: 10 },  // Status
        { wch: 8 },   // Gender
        { wch: 24 },  // ERN
        { wch: 20 },  // College
    ];

    // Column widths per subject: 7 for theory, 1 for labs
    ALL_SUBJECTS.forEach(subj => {
        if (subj.isLab) {
            colWidths.push({ wch: 8 });   // TOT only
        } else {
            colWidths.push(
                { wch: 8 },   // T1
                { wch: 8 },   // O1
                { wch: 8 },   // E1
                { wch: 8 },   // I1
                { wch: 8 },   // TOT
                { wch: 8 },   // Grade
                { wch: 6 },   // KT
            );
        }
    });

    // Summary columns
    colWidths.push(
        { wch: 12 },  // Total Marks
        { wch: 10 },  // Result
        { wch: 12 },  // Remark
        { wch: 8 },   // SGPA
    );

    ws['!cols'] = colWidths;

    // Freeze first row (headers) and first 2 columns (Seat No + Name)
    ws['!freeze'] = { xSplit: 2, ySplit: 1, topLeftCell: 'C2' };

    return ws;
}

/**
 * Create the summary statistics sheet
 */
function createSummarySheet(analysis: AnalysisSummary): XLSX.WorkSheet {
    const data = [
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['          RESULT ANALYSIS SUMMARY          '],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [],
        ['📊 Overall Statistics'],
        ['─────────────────────────────────────────'],
        ['Metric', 'Value'],
        ['Total Students', analysis.totalStudents],
        ['Students Passed', analysis.passedCount],
        ['Students Failed', analysis.failedCount],
        ['Pass Percentage', `${analysis.passPercentage}%`],
        [],
        ['📈 Marks Analysis'],
        ['─────────────────────────────────────────'],
        ['Highest Marks', analysis.highestMarks],
        ['Lowest Marks', analysis.lowestMarks],
        ['Average Marks', analysis.averageMarks],
        ['Average SGPA', analysis.averageSGPA],
        [],
        ['⚠️ KT Analysis'],
        ['─────────────────────────────────────────'],
        ['Students with KT', analysis.studentsWithKT],
        ['Average KT per Student', analysis.averageKTPerStudent],
        [],
        ['🎓 Marks Distribution'],
        ['─────────────────────────────────────────'],
        ['Category', 'Count'],
        ['Distinction (≥75%)', analysis.marksDistribution.distinction],
        ['First Class (≥60%)', analysis.marksDistribution.firstClass],
        ['Second Class (≥50%)', analysis.marksDistribution.secondClass],
        ['Pass Class (≥40%)', analysis.marksDistribution.passClass],
        ['Fail (<40%)', analysis.marksDistribution.fail],
        [],
        ['📋 KT Distribution'],
        ['─────────────────────────────────────────'],
        ['KT Count', 'Students'],
        ['No KT', analysis.ktDistribution.noKT],
        ['1 KT', analysis.ktDistribution.oneKT],
        ['2 KT', analysis.ktDistribution.twoKT],
        ['3+ KT', analysis.ktDistribution.threeOrMoreKT],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 30 },
        { wch: 20 },
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
