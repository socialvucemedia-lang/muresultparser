/**
 * Record parser - extracts student data from text lines
 * Updated to handle T1/O1/E1/I1/TOT row structure
 */

import type {
    StudentRecord,
    Subject,
    RawStudentBlock,
    SubjectMapping,
    KTType,
} from '@/src/types/student';
import { detectKT } from '@/src/lib/ktDetector';

/**
 * Subject code to name mapping based on PDF header
 */
const SUBJECT_NAMES: SubjectMapping = {
    '10411': 'Applied Mathematics-I',
    '10412': 'Applied Physics',
    '10413': 'Applied Chemistry',
    '10414': 'Engineering Mechanics',
    '10415': 'Basic Electrical & Electronics Engineering',
    '10416': 'Applied Physics Lab',
    '10417': 'Applied Chemistry Lab',
    '10418': 'Engineering Mechanics Lab',
    '10419': 'Basic Electrical & Electronics Lab',
    '10420': 'Professional Communication Ethics',
    '10421': 'Professional Communication Ethics TW',
    '10422': 'Engineering Workshop-I',
    '10423': 'C Programming',
    '10424': 'Induction cum Universal Human Values',
};

/**
 * Subject codes in order as they appear in PDF
 */
const SUBJECT_CODES = Object.keys(SUBJECT_NAMES);
const NUM_SUBJECTS = SUBJECT_CODES.length;

/**
 * Validate ERN format: must be MU + exactly 16 digits = 18 chars total
 * Example: MU0341120250220778
 */
function isValidErn(ern: string): boolean {
    return /^MU\d{16}$/.test(ern);
}

/**
 * Parse lines to find student blocks
 * A student block starts with a seat number line and ends at the next seat number or EOF
 */
export function findStudentBlocks(lines: string[], pageNumber: number): RawStudentBlock[] {
    const blocks: RawStudentBlock[] = [];
    let currentBlock: string[] = [];
    let blockStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a new student (7-digit seat number at start)
        if (isSeatNumberLine(line)) {
            // Save previous block if exists
            if (currentBlock.length > 0 && blockStart >= 0) {
                blocks.push({
                    text: currentBlock.join('\n'),
                    pageNumber,
                    lineStart: blockStart,
                    lineEnd: i - 1,
                });
            }
            // Start new block
            currentBlock = [line];
            blockStart = i;
        } else if (blockStart >= 0) {
            // Add to current block
            currentBlock.push(line);
        }
    }

    // Don't forget last block
    if (currentBlock.length > 0 && blockStart >= 0) {
        blocks.push({
            text: currentBlock.join('\n'),
            pageNumber,
            lineStart: blockStart,
            lineEnd: lines.length - 1,
        });
    }

    // Post-process blocks to fix split ERN issue
    // ERN sometimes appears at the end of student N's block but belongs to student N+1
    // because PDF text extraction splits "(MU0341...)" across block boundaries
    const trailingErnPattern = /\(?(MU\d{16})\)?/;

    for (let i = 0; i < blocks.length - 1; i++) {
        const blockLines = blocks[i].text.split('\n');
        // Check lines 10-end for a trailing ERN (appears after main student data)
        for (let j = Math.max(10, blockLines.length - 8); j < blockLines.length; j++) {
            const line = blockLines[j];
            const match = line.match(trailingErnPattern);
            if (match && isValidErn(match[1])) {
                // This ERN belongs to the NEXT student - attach it directly to that block
                blocks[i + 1].pendingErn = match[1];
                break;
            }
        }
    }

    return blocks;
}

/**
 * Check if a line starts with a 7-digit seat number
 */
function isSeatNumberLine(line: string): boolean {
    // Match lines starting with 7 digits followed by space and text
    return /^\s*\d{7}\s+[A-Z]/.test(line);
}

/**
 * Parse a single student block into a StudentRecord
 */
export function parseStudentBlock(block: RawStudentBlock): StudentRecord | null {
    const lines = block.text.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length < 3) return null;

    // Parse header line (seat number, name, gender, etc.)
    const header = parseHeaderLine(lines, block.pendingErn);
    if (!header) return null;

    // Find and parse marks rows (T1, O1, E1, I1, TOT)
    const markRows = extractMarkRows(lines);

    // Debug logging
    console.log(`[DEBUG] Student ${header.seatNumber}: TOT=${markRows.TOT.length}, T1=${markRows.T1?.length || 0}, E1=${markRows.E1?.length || 0}, ERN=${header.ern || 'MISSING'}`);
    if (markRows.TOT.length === 0 || !header.ern) {
        console.log(`[DEBUG] Issue with ${header.seatNumber}. All lines:`);
        lines.forEach((l, i) => console.log(`[DEBUG]   L${i}: ${l.substring(0, 100)}`));
    }

    // Parse subjects with component-wise marks
    const subjects = parseSubjectsFromRows(markRows);

    // Extract summary (total marks, result, SGPA)
    const summary = parseSummary(lines);

    // Calculate totals
    const totalMarks = summary.totalMarks || subjects.reduce((sum, s) => sum + s.marks.total, 0);
    const totalCredits = subjects.reduce((sum, s) => sum + s.marks.credits, 0);
    const totalCreditPoints = subjects.reduce((sum, s) => sum + s.marks.creditPoints, 0);

    // Build student record
    const student: StudentRecord = {
        seatNumber: header.seatNumber,
        name: header.name,
        gender: header.gender as 'MALE' | 'FEMALE' | null,
        ern: header.ern,
        college: header.college,
        status: header.status,
        subjects: subjects,
        totalMarks,
        maxMarks: 800,
        result: summary.result,
        sgpa: summary.sgpa,
        cgpa: summary.cgpa,
        totalCredits,
        totalCreditPoints,
        kt: detectKT(subjects),
    };

    return student;
}

/**
 * Parse the header line containing seat number, name, etc.
 * @param pendingErn - ERN found at end of previous block (for split ERN handling)
 */
function parseHeaderLine(lines: string[], pendingErn?: string): {
    seatNumber: string;
    name: string;
    gender: string;
    ern: string | null;
    college: string;
    status: string;
} | null {
    const firstLine = lines[0];

    // Extract seat number (7 digits at start)
    const seatMatch = firstLine.match(/^\s*(\d{7})/);
    if (!seatMatch) return null;

    const seatNumber = seatMatch[1];

    // Find the part after seat number
    const afterSeat = firstLine.substring(seatMatch[0].length).trim();

    // Look for name in subsequent lines if first line is just the seat number
    // The name is usually after the first line with seat number
    // Look for patterns like "1402781    DISHA ATMARAM MASAYE    Regular    FEMALE    ..."

    // Extract status (Regular/ATKT)
    const statusMatch = firstLine.match(/\b(Regular|ATKT)\b/i);
    const status = statusMatch ? statusMatch[1] : 'Regular';

    // Extract gender
    const genderMatch = firstLine.match(/\b(MALE|FEMALE)\b/i);
    const gender = genderMatch ? genderMatch[1].toUpperCase() : '';

    // Extract name - text between seat number and Regular/ATKT
    let name = '';
    if (statusMatch) {
        const beforeStatus = firstLine.substring(seatMatch[0].length, statusMatch.index);
        name = beforeStatus.trim();
    } else {
        // Try to extract name from after seat number
        const namePart = afterSeat.match(/^([A-Z][A-Z\s]+?)(?=\s+(?:Regular|ATKT|MALE|FEMALE|\d|\())/i);
        if (namePart) {
            name = namePart[1].trim();
        } else {
            // Fallback: take everything that looks like a name
            const words = afterSeat.split(/\s+/).filter(w => /^[A-Z]+$/i.test(w));
            name = words.slice(0, 3).join(' ');
        }
    }

    // Extract ERN from header region only (avoid consuming trailing ERN from next student block).
    // ERN format: MU + 16 digits.
    let ern: string | null = null;
    const headerWindow = lines.slice(0, Math.min(lines.length, 10)).join(' ');
    const compactHeaderWindow = headerWindow.replace(/\s+/g, '');

    // Handles both contiguous and whitespace-split ERNs.
    const directErnMatch = compactHeaderWindow.match(/MU\d{16}/i);
    if (directErnMatch) {
        const normalizedErn = directErnMatch[0].toUpperCase();
        if (isValidErn(normalizedErn)) {
            ern = normalizedErn;
        }
    }

    // If no ERN found in this block, use the pending ERN from previous block
    // This handles the case where PDF extraction splits "(MU...)" across block boundaries
    if (!ern && pendingErn && isValidErn(pendingErn)) {
        ern = pendingErn;
    }

    // Extract college (MU-XXX: followed by college name)
    let college = '';
    for (const line of lines.slice(0, 3)) {
        const collegeMatch = line.match(/MU-\d+:\s*(.+?)(?:\s*$)/i);
        if (collegeMatch) {
            college = collegeMatch[1].trim();
            break;
        }
    }

    return {
        seatNumber,
        name: cleanName(name),
        gender,
        ern,
        college,
        status,
    };
}

/**
 * Clean up extracted name
 */
function cleanName(name: string): string {
    // Remove any numbers, special chars, and normalize whitespace
    return name
        .replace(/[^A-Za-z\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(w => w.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Extract T1, O1, E1, I1, TOT rows from lines
 */
interface MarkRows {
    T1: number[] | null;  // Term Work
    O1: number[] | null;  // Oral
    E1: number[] | null;  // External
    I1: number[] | null;  // Internal
    TOT: { total: number; gp: number; grade: string; credits: number; creditPoints: number }[];
}

function extractMarkRows(lines: string[]): MarkRows {
    const rows: MarkRows = {
        T1: null,
        O1: null,
        E1: null,
        I1: null,
        TOT: [],
    };

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Match T1 row
        if (trimmedLine.startsWith('T1')) {
            rows.T1 = parseComponentRow(trimmedLine.substring(2));
        }
        // Match O1 row
        else if (trimmedLine.startsWith('O1')) {
            rows.O1 = parseComponentRow(trimmedLine.substring(2));
        }
        // Match E1 row
        else if (trimmedLine.startsWith('E1')) {
            rows.E1 = parseComponentRow(trimmedLine.substring(2));
        }
        // Match I1 row
        else if (trimmedLine.startsWith('I1')) {
            rows.I1 = parseComponentRow(trimmedLine.substring(2));
        }
        // Match TOT row - keep the one with more subjects parsed
        // (handles case where header row "TOT GP G C G*C" appears after actual TOT row)
        else if (trimmedLine.startsWith('TOT')) {
            const totContent = trimmedLine.substring(3);
            const parsedTot = parseTotRow(totContent);

            // Only use this TOT if it has more subjects than current
            if (parsedTot.length > rows.TOT.length) {
                console.log(`[DEBUG] Found better TOT line. Content: "${totContent.substring(0, 60)}..."`);
                rows.TOT = parsedTot;
                console.log(`[DEBUG] Parsed ${rows.TOT.length} subjects from TOT`);
            }
        }
    }

    return rows;
}

/**
 * Parse a component row (T1, O1, E1, I1) to extract marks
 * These rows contain marks separated by spaces, with optional P/F indicators
 */
function parseComponentRow(content: string): number[] {
    const marks: number[] = [];

    // Split by whitespace and extract numbers
    const parts = content.trim().split(/\s+/);

    for (const part of parts) {
        // Match a number (possibly followed by * and another number, or P/F)
        const numMatch = part.match(/^(\d+)/);
        if (numMatch) {
            marks.push(parseInt(numMatch[1], 10));
        }
    }

    return marks;
}

/**
 * Parse TOT row to extract total marks, GP, grade, credits, credit points
 * Handles various formats including Repeater students with blank columns
 */

function parseTotalWithGrace(totalToken: string): number {
    // Keep displayed PDF total as-is numerically (e.g. "77+" -> 77),
    // so exports match the source gazette values.
    const base = parseInt(totalToken.replace(/\D/g, ''), 10);
    return Number.isNaN(base) ? 0 : base;
}

function parseTotRow(content: string): { total: number; gp: number; grade: string; credits: number; creditPoints: number }[] {
    const subjects: { total: number; gp: number; grade: string; credits: number; creditPoints: number }[] = [];

    // First try strict pattern: total GP grade credits creditPoints
    // Example: 38 0 F 3 0.0 or 42 8 A 4 32.0 or 77+ 7 B+ 3 21.0
    const strictPattern = /(\d+\+?)\s+(\d+)\s+([A-Z][A-Z+]*)\s+([\d.]+)\s+([\d.]+)/g;

    let match;
    while ((match = strictPattern.exec(content)) !== null) {
        subjects.push({
            total: parseTotalWithGrace(match[1]),
            gp: parseInt(match[2], 10),
            grade: match[3],
            credits: parseFloat(match[4]),
            creditPoints: parseFloat(match[5]),
        });
    }

    // If strict matching found subjects, return them
    if (subjects.length > 0) {
        return subjects;
    }

    // Try alternative pattern for edge cases
    // Look for patterns like "36+ 4 D 2 8.0" with + marks
    const altPattern = /(\d+\+?)\s+(\d+)\s+([ABCDFO][+]?)\s+([\d.]+)\s+([\d.]+)/g;

    while ((match = altPattern.exec(content)) !== null) {
        subjects.push({
            total: parseTotalWithGrace(match[1]),
            gp: parseInt(match[2], 10),
            grade: match[3],
            credits: parseFloat(match[4]),
            creditPoints: parseFloat(match[5]),
        });
    }

    // If still no matches, try to parse space-separated values more loosely
    // This handles cases where formatting is not standard
    if (subjects.length === 0) {
        const tokens = content.trim().split(/\s+/);
        let i = 0;
        while (i < tokens.length - 4) {
            // Look for: number, number, grade letter, number, number
            const rawTotalToken = tokens[i] || ''
            const total = parseTotalWithGrace(rawTotalToken);
            const gp = parseFloat(tokens[i + 1] || '');
            const grade = tokens[i + 2];
            const credits = parseFloat(tokens[i + 3] || '');
            const creditPoints = parseFloat(tokens[i + 4] || '');

            // Validate: total > 0, grade is a letter
            if (rawTotalToken && !Number.isNaN(total) && !isNaN(gp) && /^[ABCDFO][+]?$/i.test(grade) && !isNaN(credits) && !isNaN(creditPoints)) {
                subjects.push({
                    total: Math.round(total),
                    gp: Math.round(gp),
                    grade: grade.toUpperCase(),
                    credits,
                    creditPoints,
                });
                i += 5; // Move to next subject
            } else {
                i++; // Move past non-matching token
            }
        }
    }

    return subjects;
}

/**
 * Parse subjects from mark rows
 */
function parseSubjectsFromRows(markRows: MarkRows): Subject[] {
    const subjects: Subject[] = [];

    // Use TOT row as primary source of subject data
    for (let i = 0; i < Math.min(markRows.TOT.length, NUM_SUBJECTS); i++) {
        const totData = markRows.TOT[i];
        const code = SUBJECT_CODES[i];

        // Get component marks if available
        const termWork = markRows.T1 && markRows.T1[i] !== undefined ? markRows.T1[i] : null;
        const oral = markRows.O1 && markRows.O1[i] !== undefined ? markRows.O1[i] : null;
        const external = markRows.E1 && markRows.E1[i] !== undefined ? markRows.E1[i] : null;
        const internal = markRows.I1 && markRows.I1[i] !== undefined ? markRows.I1[i] : null;

        const subject: Subject = {
            code,
            name: SUBJECT_NAMES[code] || code,
            marks: {
                termWork,
                oral,
                external,
                internal,
                total: totData.total,
                gradePoint: totData.gp,
                grade: totData.grade,
                credits: totData.credits,
                creditPoints: totData.creditPoints,
                status: totData.grade === 'F' ? 'F' : 'P',
            },
            isKT: totData.grade === 'F' || totData.gp === 0,
            ktType: detectSubjectKTType(totData, { termWork, oral, external, internal }),
        };

        subjects.push(subject);
    }

    return subjects;
}

/**
 * Detect KT type for a subject based on component marks
 */
function detectSubjectKTType(
    totData: { grade: string; gp: number },
    components: { termWork: number | null; oral: number | null; external: number | null; internal: number | null }
): KTType | null {
    if (totData.grade !== 'F' && totData.gp > 0) {
        return null;
    }

    // Check which component failed
    if (components.external !== null && components.external === 0) {
        return 'external';
    }
    if (components.internal !== null && components.internal === 0) {
        return 'internal';
    }
    if (components.termWork !== null && components.termWork === 0) {
        return 'termWork';
    }
    if (components.oral !== null && components.oral === 0) {
        return 'oral';
    }

    return 'overall';
}

/**
 * Parse summary info (total marks, result, SGPA)
 */
function parseSummary(lines: string[]): {
    totalMarks: number;
    result: 'PASS' | 'FAILED';
    sgpa: number;
    cgpa: number | null;
} {
    let totalMarks = 0;
    let result: 'PASS' | 'FAILED' = 'FAILED';
    let sgpa = 0;
    let cgpa: number | null = null;

    for (const line of lines) {
        const normalizedLine = line.replace(/\s+/g, ' ').trim();

        // Check for MARKS (XXX) RESULT pattern
        // Format: MARKS    (371) PASS or MARKS    (107.0) FAIL
        const marksResultMatch = normalizedLine.match(/MARKS\s*\(?([\d.]+)\)?\s*(PASS|FAIL(?:ED)?)/i);
        if (marksResultMatch) {
            totalMarks = parseFloat(marksResultMatch[1]);
            result = marksResultMatch[2].toUpperCase().startsWith('PASS') ? 'PASS' : 'FAILED';

            // Many gazettes include SGPA at the end of the same MARKS line.
            const trailingNumbers = normalizedLine.match(/([\d.]+)\s+([\d.]+)\s*$/);
            if (trailingNumbers) {
                const candidate = parseFloat(trailingNumbers[2]);
                if (!Number.isNaN(candidate) && candidate >= 0 && candidate <= 10) {
                    sgpa = candidate;
                }
            }
        }

        // Also check for (XXX) PASS/FAILED format in TOT line
        const totResultMatch = normalizedLine.match(/\(([\d.]+)\)\s*(PASS|FAIL(?:ED)?)/i);
        if (totResultMatch && totalMarks === 0) {
            totalMarks = parseFloat(totResultMatch[1]);
            result = totResultMatch[2].toUpperCase().startsWith('PASS') ? 'PASS' : 'FAILED';
        }

        // Explicit SGPA extraction for edge-case formatting.
        const explicitSgpaMatch = normalizedLine.match(/\bSGPA\s*[:=]?\s*([\d.]+)/i);
        if (explicitSgpaMatch) {
            const candidate = parseFloat(explicitSgpaMatch[1]);
            if (!Number.isNaN(candidate) && candidate >= 0 && candidate <= 10) {
                sgpa = candidate;
            }
        }

        // Capture CGPA when available in-line.
        const explicitCgpaMatch = normalizedLine.match(/\bCGPA\s*[:=]?\s*([\d.]+)/i);
        if (explicitCgpaMatch) {
            const candidate = parseFloat(explicitCgpaMatch[1]);
            if (!Number.isNaN(candidate) && candidate >= 0 && candidate <= 10) {
                cgpa = candidate;
            }
        }
    }

    // Fallback: parse total from TOT line
    if (totalMarks === 0) {
        for (const line of lines) {
            if (line.startsWith('TOT')) {
                // Sum all totals from TOT line
                const pattern = /(\d+)\s+\d+\s+[A-Z+]+\s+[\d.]+\s+[\d.]+/g;
                let match;
                let sum = 0;
                while ((match = pattern.exec(line)) !== null) {
                    sum += parseInt(match[1], 10);
                }
                if (sum > 0) {
                    totalMarks = sum;
                }
                break;
            }
        }
    }

    return { totalMarks, result, sgpa, cgpa };
}
