/**
 * Excel export using xlsx library with university-style two-row headers
 */

import * as XLSX from 'xlsx';
import type { StudentRecord, AnalysisSummary, ExportOptions, SubjectMarks } from '@/src/types/student';

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
    const studentSheet = createStudentSheet(students);
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
 * All 14 subject codes in PDF order with their abbreviated names
 */
const ALL_SUBJECTS = [
    { code: '10411', abbr: 'AM-I', name: 'Applied Mathematics-I' },
    { code: '10412', abbr: 'AP', name: 'Applied Physics' },
    { code: '10413', abbr: 'AC', name: 'Applied Chemistry' },
    { code: '10414', abbr: 'EM', name: 'Engineering Mechanics' },
    { code: '10415', abbr: 'BEE', name: 'Basic Electrical & Electronics Engineering' },
    { code: '10416', abbr: 'APL', name: 'Applied Physics Lab' },
    { code: '10417', abbr: 'ACL', name: 'Applied Chemistry Lab' },
    { code: '10418', abbr: 'EML', name: 'Engineering Mechanics Lab' },
    { code: '10419', abbr: 'BEEL', name: 'Basic Electrical & Electronics Engineering Lab' },
    { code: '10420', abbr: 'PCE', name: 'Professional Communication Ethics' },
    { code: '10421', abbr: 'PCETW', name: 'Professional Communication Ethics TW' },
    { code: '10422', abbr: 'EW-I', name: 'Engineering Workshop-I' },
    { code: '10423', abbr: 'CP', name: 'C Programming' },
    { code: '10424', abbr: 'IUHV', name: 'Induction cum Universal Human Values' },
];

/**
 * Standardized component labels for each subject
 */
const COMPONENT_LABELS = ['EXT', 'INT', 'TW', 'OR', 'TOTAL', 'GRADE', 'GP', 'CREDITS', 'RESULT'] as const;

/**
 * Create the main students data sheet with two-row grouped headers
 * Format: Header Row 1 = Subject names (merged), Header Row 2 = Component labels
 */
function createStudentSheet(students: StudentRecord[]): XLSX.WorkSheet {
    if (!students || students.length === 0) {
        return XLSX.utils.aoa_to_sheet([['No data available']]);
    }

    // ── Build Header Row 1 (Subject Groups) ──────────────────────────
    const headerRow1: string[] = [
        'Seat No',
        'Student Name',
        'Status',
        'Gender',
        'ERN',
    ];

    // ── Build Header Row 2 (Component Labels) ────────────────────────
    const headerRow2: string[] = [
        '', // align with Seat No
        '', // align with Student Name
        '', // align with Status
        '', // align with Gender
        '', // align with ERN
    ];

    // Add subject groups - each subject spans 9 columns
    ALL_SUBJECTS.forEach(subj => {
        // Header Row 1: Subject name appears once, then 8 empty cells for span
        headerRow1.push(subj.abbr, '', '', '', '', '', '', '', '');

        // Header Row 2: Component labels
        headerRow2.push(...COMPONENT_LABELS);
    });

    // Add summary columns at the end
    headerRow1.push('TOTAL', 'SGPA', 'RESULT');
    headerRow2.push('', '', '');

    // ── Build Data Rows ───────────────────────────────────────────────
    const dataRows = students.map(student => {
        const row: (string | number)[] = [
            student.seatNumber || '',
            student.name || '',
            student.status || '',
            student.gender || '',
            student.ern || '',
        ];

        // Per-subject marks (9 columns each)
        ALL_SUBJECTS.forEach(subjDef => {
            const subj = student.subjects.find(s => s.code === subjDef.code);
            const marks = subj?.marks;

            row.push(
                marks?.external ?? '',       // EXT
                marks?.internal ?? '',       // INT
                marks?.termWork ?? '',       // TW
                marks?.oral ?? '',           // OR
                marks?.total ?? '',          // TOTAL
                marks?.grade || '',          // GRADE
                marks?.gradePoint ?? '',     // GP
                marks?.credits ?? '',        // CREDITS
                marks?.status || '',         // RESULT (P/F)
            );
        });

        // Summary columns
        row.push(
            student.totalMarks || '',
            student.sgpa || '',
            student.result || '',
        );

        return row;
    });

    // ── Create Worksheet ──────────────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...dataRows]);

    // ── Add Cell Merges for Subject Groups ───────────────────────────
    const merges: XLSX.Range[] = [];

    // Merge student info cells in row 1
    merges.push(
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Seat No
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Student Name
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Status
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Gender
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // ERN
    );

    // Merge each subject name across its 9 component columns
    let colIndex = 5; // Start after student info columns
    ALL_SUBJECTS.forEach(() => {
        merges.push({
            s: { r: 0, c: colIndex },     // Start column
            e: { r: 0, c: colIndex + 8 }, // End column (9 cols total)
        });
        colIndex += 9;
    });

    // Merge summary columns in row 1
    merges.push(
        { s: { r: 0, c: colIndex }, e: { r: 1, c: colIndex } },     // TOTAL
        { s: { r: 0, c: colIndex + 1 }, e: { r: 1, c: colIndex + 1 } }, // SGPA
        { s: { r: 0, c: colIndex + 2 }, e: { r: 1, c: colIndex + 2 } }, // RESULT
    );

    ws['!merges'] = merges;

    // ── Column Widths ─────────────────────────────────────────────────
    const colWidths: XLSX.ColInfo[] = [
        { wch: 10 },  // Seat No
        { wch: 25 },  // Student Name
        { wch: 10 },  // Status
        { wch: 8 },   // Gender
        { wch: 20 },  // ERN
    ];

    // Each subject has 9 columns
    ALL_SUBJECTS.forEach(() => {
        colWidths.push(
            { wch: 7 },   // EXT
            { wch: 7 },   // INT
            { wch: 7 },   // TW
            { wch: 7 },   // OR
            { wch: 8 },   // TOTAL
            { wch: 8 },   // GRADE
            { wch: 7 },   // GP
            { wch: 9 },   // CREDITS
            { wch: 8 },   // RESULT
        );
    });

    // Summary columns
    colWidths.push(
        { wch: 10 },  // TOTAL
        { wch: 8 },   // SGPA
        { wch: 10 },  // RESULT
    );

    ws['!cols'] = colWidths;

    // Freeze header rows and first 2 columns
    ws['!freeze'] = { xSplit: 2, ySplit: 2, topLeftCell: 'C3' };

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

    const studentSheet = createStudentSheet(students);
    XLSX.utils.book_append_sheet(wb, studentSheet, 'Students');

    if (options.includeSummarySheet && analysis) {
        const summarySheet = createSummarySheet(analysis);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
