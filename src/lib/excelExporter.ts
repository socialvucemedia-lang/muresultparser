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
 * Column definition for each column within a subject group
 */
interface ColumnDef {
    label: string;            // Header label (EXT, INT, TW, OR, TOTAL, RESULT)
    sourceCode: string;       // Which subject code to pull data from
    sourceField: keyof SubjectMarks; // Which field from marks to use
}

/**
 * Merged subject group — a single header entry in the Excel sheet
 * that may combine marks from a theory subject + its lab subject
 */
interface MergedGroup {
    abbr: string;             // Display abbreviation (e.g. 'AP')
    columns: ColumnDef[];     // The sub-columns for this group
}

/**
 * Merged subject groups in university order.
 * Lab subjects are folded into their parent theory subjects:
 *   APL → TW in AP, ACL → TW in AC,
 *   EML → TW+OR in EM, BEEL → TW+OR in BEE,
 *   PCETW → TW in PCE
 */
const MERGED_GROUPS: MergedGroup[] = [
    {
        abbr: 'AM-I',
        columns: [
            { label: 'EXT', sourceCode: '10411', sourceField: 'external' },
            { label: 'INT', sourceCode: '10411', sourceField: 'internal' },
            { label: 'TW', sourceCode: '10411', sourceField: 'termWork' },
            { label: 'TOTAL', sourceCode: '10411', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10411', sourceField: 'status' },
        ],
    },
    {
        abbr: 'AP',
        columns: [
            { label: 'EXT', sourceCode: '10412', sourceField: 'external' },
            { label: 'INT', sourceCode: '10412', sourceField: 'internal' },
            { label: 'TOTAL', sourceCode: '10412', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10412', sourceField: 'status' },
            { label: 'TW', sourceCode: '10416', sourceField: 'total' },    // APL lab total → TW
        ],
    },
    {
        abbr: 'AC',
        columns: [
            { label: 'EXT', sourceCode: '10413', sourceField: 'external' },
            { label: 'INT', sourceCode: '10413', sourceField: 'internal' },
            { label: 'TOTAL', sourceCode: '10413', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10413', sourceField: 'status' },
            { label: 'TW', sourceCode: '10417', sourceField: 'total' },    // ACL lab total → TW
        ],
    },
    {
        abbr: 'EM',
        columns: [
            { label: 'EXT', sourceCode: '10414', sourceField: 'external' },
            { label: 'INT', sourceCode: '10414', sourceField: 'internal' },
            { label: 'TOTAL', sourceCode: '10414', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10414', sourceField: 'status' },
            { label: 'TW', sourceCode: '10418', sourceField: 'termWork' }, // EML lab TW
            { label: 'OR', sourceCode: '10418', sourceField: 'oral' },     // EML lab OR
        ],
    },
    {
        abbr: 'BEE',
        columns: [
            { label: 'EXT', sourceCode: '10415', sourceField: 'external' },
            { label: 'INT', sourceCode: '10415', sourceField: 'internal' },
            { label: 'TOTAL', sourceCode: '10415', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10415', sourceField: 'status' },
            { label: 'TW', sourceCode: '10419', sourceField: 'termWork' }, // BEEL lab TW
            { label: 'OR', sourceCode: '10419', sourceField: 'oral' },     // BEEL lab OR
        ],
    },
    {
        abbr: 'PCE',
        columns: [
            { label: 'EXT', sourceCode: '10420', sourceField: 'external' },
            { label: 'INT', sourceCode: '10420', sourceField: 'internal' },
            { label: 'TOTAL', sourceCode: '10420', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10420', sourceField: 'status' },
            { label: 'TW', sourceCode: '10421', sourceField: 'total' },    // PCETW total → TW
        ],
    },
    {
        abbr: 'EW-I',
        columns: [
            { label: 'TW', sourceCode: '10422', sourceField: 'total' },    // Workshop TW
        ],
    },
    {
        abbr: 'CP',
        columns: [
            { label: 'TW', sourceCode: '10423', sourceField: 'termWork' },
            { label: 'OR', sourceCode: '10423', sourceField: 'oral' },
            { label: 'TOTAL', sourceCode: '10423', sourceField: 'total' },
            { label: 'RESULT', sourceCode: '10423', sourceField: 'status' },
        ],
    },
];

/**
 * Look up a marks field value from a student's subject list
 */
function getMarksValue(
    student: StudentRecord,
    subjectCode: string,
    field: keyof SubjectMarks
): string | number {
    const subj = student.subjects.find(s => s.code === subjectCode);
    if (!subj) return '';
    const val = subj.marks[field];
    if (val === null || val === undefined) return '';
    return val;
}

/**
 * Create the main students data sheet with two-row grouped headers
 * Format: Header Row 1 = Subject group names (merged), Header Row 2 = Component labels
 */
function createStudentSheet(students: StudentRecord[]): XLSX.WorkSheet {
    if (!students || students.length === 0) {
        return XLSX.utils.aoa_to_sheet([['No data available']]);
    }

    const INFO_COLS = ['Seat No', 'Student Name'];

    // ── Build Header Row 1 (Subject Group Names) ─────────────────────
    const headerRow1: string[] = [...INFO_COLS];

    // ── Build Header Row 2 (Component Labels) ────────────────────────
    const headerRow2: string[] = INFO_COLS.map(() => '');

    // Add merged subject groups with variable column counts
    MERGED_GROUPS.forEach(group => {
        // Row 1: group name + empty cells for span
        headerRow1.push(group.abbr, ...Array(group.columns.length - 1).fill(''));
        // Row 2: column labels
        headerRow2.push(...group.columns.map(c => c.label));
    });

    // Summary columns at the end
    headerRow1.push('TOTAL', 'SGPA', 'RESULT');
    headerRow2.push('', '', '');

    // ── Build Data Rows ───────────────────────────────────────────────
    const dataRows = students.map(student => {
        const row: (string | number)[] = [
            student.seatNumber || '',
            student.name || '',
        ];

        // Per-group marks (variable columns)
        MERGED_GROUPS.forEach(group => {
            group.columns.forEach(col => {
                row.push(getMarksValue(student, col.sourceCode, col.sourceField));
            });
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

    // ── Add Cell Merges ──────────────────────────────────────────────
    const merges: XLSX.Range[] = [];
    const infoColCount = INFO_COLS.length;

    // Merge student info cells vertically (span row 1 + row 2)
    for (let c = 0; c < infoColCount; c++) {
        merges.push({ s: { r: 0, c }, e: { r: 1, c } });
    }

    // Merge each subject group name horizontally across its columns
    let colIndex = infoColCount;
    MERGED_GROUPS.forEach(group => {
        const span = group.columns.length;
        if (span > 1) {
            merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + span - 1 },
            });
        } else {
            // Single-column groups: merge vertically instead
            merges.push({ s: { r: 0, c: colIndex }, e: { r: 1, c: colIndex } });
        }
        colIndex += span;
    });

    // Merge summary columns vertically
    for (let i = 0; i < 3; i++) {
        merges.push({ s: { r: 0, c: colIndex + i }, e: { r: 1, c: colIndex + i } });
    }

    ws['!merges'] = merges;

    // ── Column Widths ─────────────────────────────────────────────────
    const colWidths: XLSX.ColInfo[] = [
        { wch: 10 },  // Seat No
        { wch: 25 },  // Student Name
    ];

    // Each column in each group
    MERGED_GROUPS.forEach(group => {
        group.columns.forEach(col => {
            const w = col.label === 'TOTAL' ? 8
                : col.label === 'RESULT' ? 8
                    : 7;
            colWidths.push({ wch: w });
        });
    });

    // Summary columns
    colWidths.push({ wch: 10 }, { wch: 8 }, { wch: 10 });

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
