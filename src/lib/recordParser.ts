/**
 * Record parser - extracts student data from text lines
 * Updated to handle T1/O1/E1/I1/TOT row structure
 */

import type {
  StudentRecord,
  Subject,
  SubjectMarks,
  RawStudentBlock,
  SubjectMapping,
  KTType,
} from "@/src/types/student";
import { detectKT } from "@/src/lib/ktDetector";

/**
 * Subject code to name mapping based on PDF header
 */
const SUBJECT_NAMES: SubjectMapping = {
  "10411": "Applied Mathematics-I",
  "10412": "Applied Physics",
  "10413": "Applied Chemistry",
  "10414": "Engineering Mechanics",
  "10415": "Basic Electrical & Electronics Engineering",
  "10416": "Applied Physics Lab",
  "10417": "Applied Chemistry Lab",
  "10418": "Engineering Mechanics Lab",
  "10419": "Basic Electrical & Electronics Lab",
  "10420": "Professional Communication Ethics",
  "10421": "Professional Communication Ethics TW",
  "10422": "Engineering Workshop-I",
  "10423": "C Programming",
  "10424": "Induction cum Universal Human Values",
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
  return /^MU\d{16}$/.test(ern.trim());
}

/**
 * Parse lines to find student blocks
 * A student block starts with a seat number line and ends at the next seat number or EOF
 */
export function findStudentBlocks(
  lines: string[],
  pageNumber: number,
): RawStudentBlock[] {
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
          text: currentBlock.join("\n"),
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
      text: currentBlock.join("\n"),
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
    const blockLines = blocks[i].text.split("\n");
    // Check lines 10-end for a trailing ERN (appears after main student data)
    for (
      let j = Math.max(10, blockLines.length - 8);
      j < blockLines.length;
      j++
    ) {
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
  // Improved: Match 7 digits followed by at least one uppercase word (for name)
  // Reduces false positives from mark lines
  const match = line.match(/^\s*(\d{7})\s+([A-Z]+(?:\s+[A-Z]+)*)\s*/);
  return !!match && match[2].trim().length > 5;
}

/**
 * Parse a single student block into a StudentRecord
 */
export function parseStudentBlock(
  block: RawStudentBlock,
): StudentRecord | null {
  const lines = block.text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  if (lines.length < 3) return null;

  // Parse header line (seat number, name, gender, etc.)
  const header = parseHeaderLine(lines, block.pendingErn);
  if (!header) return null;

  // Find and parse marks rows (T1, O1, E1, I1, TOT)
  const markRows = extractMarkRows(lines);

  // Debug logging
  console.log(
    `[DEBUG] Student ${header.seatNumber}: TOT=${markRows.TOT.length}, T1=${markRows.T1?.length || 0}, E1=${markRows.E1?.length || 0}, ERN=${header.ern || "MISSING"}`,
  );
  if (markRows.TOT.length === 0 || !header.ern) {
    console.log(`[DEBUG] Issue with ${header.seatNumber}. All lines:`);
    lines.forEach((l, i) =>
      console.log(`[DEBUG]   L${i}: ${l.substring(0, 100)}`),
    );
  }

  // Parse subjects with component-wise marks
  const subjects = parseSubjectsFromRows(markRows);

  // Extract summary (total marks, result, SGPA)
  const summary = parseSummary(lines);

  // Calculate totals
  const totalMarks =
    summary.totalMarks || subjects.reduce((sum, s) => sum + s.marks.total, 0);
  const totalCredits = subjects.reduce((sum, s) => sum + s.marks.credits, 0);
  const totalCreditPoints = subjects.reduce(
    (sum, s) => sum + s.marks.creditPoints,
    0,
  );

  // Build student record
  const student: StudentRecord = {
    seatNumber: header.seatNumber,
    name: header.name,
    gender: header.gender as "MALE" | "FEMALE" | null,
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
function parseHeaderLine(
  lines: string[],
  pendingErn?: string,
): {
  seatNumber: string;
  name: string;
  gender: string;
  ern: string | null;
  college: string;
  status: string;
} | null {
  const firstLine = lines[0];

  // Extract seat number (7 digits at start), more robust for extra spaces
  const seatMatch = firstLine.match(/^\s*(\d{7})\s*/);
  if (!seatMatch) return null;

  const seatNumber = seatMatch[1];

  // Find the part after seat number
  let afterSeat = firstLine.substring(seatMatch[0].length).trim();

  // Look for name in subsequent lines if first line is just the seat number
  let nameLine = afterSeat;

  // The name is usually after the first line with seat number
  // Look for patterns like "1402781    DISHA ATMARAM MASAYE    Regular    FEMALE    ..."

  // Extract status (Regular/ATKT), allowing for extra spaces or casing
  const statusMatch = firstLine.match(/\b\s*(Regular|ATKT)\s*\b/i);
  const status = statusMatch ? statusMatch[1].trim() : "Regular";

  // Extract gender, allowing for extra spaces
  const genderMatch = firstLine.match(/\b\s*(MALE|FEMALE)\s*\b/i);
  const gender = genderMatch ? genderMatch[1].trim().toUpperCase() : "";

  // Extract name - text between seat number and Regular/ATKT
  let name = "";
  if (statusMatch) {
    const beforeStatus = firstLine.substring(
      seatMatch[0].length,
      statusMatch.index,
    );
    name = beforeStatus.trim();
  } else {
    // Try to extract name from after seat number
    const namePart = afterSeat.match(
      /^([A-Z][A-Z\s]+?)(?=\s+(?:Regular|ATKT|MALE|FEMALE|\d|\())/i,
    );
    if (namePart) {
      name = namePart[1].trim();
    } else {
      // Fallback: take everything that looks like a name
      const words = afterSeat.split(/\s+/).filter((w) => /^[A-Z]+$/i.test(w));
      name = words.slice(0, 3).join(" ");
    }
  }

  // Extract ERN - strictly require MU prefix + exactly 16 digits
  // ERN format: MU0341120250220778 (MU + 16 digits = 18 chars total)
  let ern: string | null = null;

  // Search lines in the block for ERN (limit to first 5 lines where header info lives)
  for (let i = 0; i < Math.min(lines.length, 5) && !ern; i++) {
    const line = lines[i].trim();

    // Pattern 1: Full ERN with optional parentheses and spaces (MU0341120250220778)
    const fullMatch = line.match(/\(?\s*(MU\d{16})\s*\)?/);
    if (fullMatch && isValidErn(fullMatch[1])) {
      ern = fullMatch[1];
      break;
    }

    // Pattern 2: ERN with opening paren but no closing, allowing spaces
    const openMatch = line.match(/\(?\s*(MU\d{16})\s*(?:\s|$|\))/);
    if (openMatch && isValidErn(openMatch[1])) {
      ern = openMatch[1];
      break;
    }

    // Pattern 3: Cross-line ERN assembly, more flexible for splits
    const partialMatch = line.match(/\(?\s*(MU\d{1,15})\s*(?:\s*$|\))/);
    if (partialMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const remainingDigits = nextLine.match(/^(\d{1,16})\s*\)?/);
      if (remainingDigits) {
        const assembled = partialMatch[1] + remainingDigits[1];
        if (isValidErn(assembled)) {
          ern = assembled;
          break;
        }
      }
    }
  }

  // If not found in first 5 lines, do a broader search (but still strict MU pattern)
  if (!ern) {
    for (let i = 5; i < lines.length && !ern; i++) {
      const line = lines[i].trim();
      const match = line.match(/\(?\s*(MU\d{16})\s*\)?/);
      if (match && isValidErn(match[1])) {
        ern = match[1];
        break;
      }
    }
  }

  // If no ERN found in this block, use the pending ERN from previous block
  // This handles the case where PDF extraction splits "(MU...)" across block boundaries
  if (!ern && pendingErn && isValidErn(pendingErn)) {
    ern = pendingErn;
  }

  // Extract college (MU-XXX: followed by college name)
  let college = "";
  for (const line of lines.slice(0, 5)) {
    // Expand search to first 5 lines for split cases
    const trimmed = line.trim();
    const collegeMatch = trimmed.match(/MU-\d+:\s*(.+?)(?:\s*$|\()/i); // Allow for following paren
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
    .replace(/[^A-Za-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Extract T1, O1, E1, I1, TOT rows from lines
 */
interface MarkRows {
  T1: number[] | null; // Term Work
  O1: number[] | null; // Oral
  E1: number[] | null; // External
  I1: number[] | null; // Internal
  TOT: {
    total: number;
    gp: number;
    grade: string;
    credits: number;
    creditPoints: number;
  }[];
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
    const trimmedLine = line.trim().replace(/\s+/g, " "); // Normalize multiple spaces

    // Match rows with flexible spacing
    if (trimmedLine.match(/^\s*T1\s*/)) {
      rows.T1 = parseComponentRow(trimmedLine.replace(/^\s*T1\s*/, ""));
    } else if (trimmedLine.match(/^\s*O1\s*/)) {
      rows.O1 = parseComponentRow(trimmedLine.replace(/^\s*O1\s*/, ""));
    } else if (trimmedLine.match(/^\s*E1\s*/)) {
      rows.E1 = parseComponentRow(trimmedLine.replace(/^\s*E1\s*/, ""));
    } else if (trimmedLine.match(/^\s*I1\s*/)) {
      rows.I1 = parseComponentRow(trimmedLine.replace(/^\s*I1\s*/, ""));
    } else if (trimmedLine.match(/^\s*TOT\s*/)) {
      const totContent = trimmedLine.replace(/^\s*TOT\s*/, "");
      const parsedTot = parseTotRow(totContent);

      // Keep the TOT with most subjects, or if equal, the one with higher totals
      if (
        parsedTot.length > rows.TOT.length ||
        (parsedTot.length === rows.TOT.length &&
          parsedTot.reduce((sum, s) => sum + s.total, 0) >
            rows.TOT.reduce((sum, s) => sum + s.total, 0))
      ) {
        console.log(
          `[DEBUG] Found better TOT line. Content: "${totContent.substring(0, 60)}..."`,
        );
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

  // Normalize spaces and split
  const normalized = content.trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ");

  for (const part of parts) {
    // Match number, optionally with grace (@\d)
    const numMatch = part.match(/^(\d+)(?:\s*@\d+)?/);
    if (numMatch) {
      let value = parseInt(numMatch[1], 10);
      const graceMatch = part.match(/@\d+/);
      if (graceMatch) {
        value += parseInt(graceMatch[0].slice(1), 10);
      }
      marks.push(value);
    }
  }

  return marks;
}

/**
 * Parse TOT row to extract total marks, GP, grade, credits, credit points
 * Handles various formats including Repeater students with blank columns
 */
function parseTotRow(content: string): {
  total: number;
  gp: number;
  grade: string;
  credits: number;
  creditPoints: number;
}[] {
  const subjects: {
    total: number;
    gp: number;
    grade: string;
    credits: number;
    creditPoints: number;
  }[] = [];

  // First try strict pattern: total GP grade credits creditPoints
  // Example: 38 0 F 3 0.0 or 42 8 A 4 32.0 or 77+ 7 B+ 3 21.0
  const strictPattern =
    /(\d+\+?)(\s*@\d+)?\s+(\d+)\s+([A-Z][A-Z+]*)\s+([\d.]+)\s+([\d.]+)/g;

  let match;
  while ((match = strictPattern.exec(content)) !== null) {
    let total = parseInt(match[1].replace("+", ""), 10);
    if (match[2]) {
      const grace = parseInt(match[2].match(/@(\d+)/)[1], 10);
      total += grace;
    }
    subjects.push({
      total,
      gp: parseInt(match[3], 10),
      grade: match[4],
      credits: parseFloat(match[5]),
      creditPoints: parseFloat(match[6]),
    });
  }

  // If strict matching found subjects, return them
  if (subjects.length > 0) {
    return subjects;
  }

  // Try alternative pattern for edge cases
  // Look for patterns like "36+ 4 D 2 8.0" with + marks
  const altPattern =
    /(\d+)\+?(\s*@\d+)?\s+(\d+)\s+([ABCDFO][+]?)\s+([\d.]+)\s+([\d.]+)/g;

  while ((match = altPattern.exec(content)) !== null) {
    let total = parseInt(match[1], 10);
    if (match[2]) {
      const grace = parseInt(match[2].match(/@(\d+)/)[1], 10);
      total += grace;
    }
    subjects.push({
      total,
      gp: parseInt(match[3], 10),
      grade: match[4],
      credits: parseFloat(match[5]),
      creditPoints: parseFloat(match[6]),
    });
  }

  // If still no matches, try robust token-based parsing
  // Handles merged tokens like "F3", grace marks, + marks
  if (subjects.length === 0) {
    const tokens = content.trim().split(/\s+/);
    let i = 0;
    while (i < tokens.length) {
      const totalStr = tokens[i];
      if (!/^\d/.test(totalStr)) {
        i++;
        continue;
      }

      let total = 0;
      let grace = 0;

      // Handle total and possible merged grace
      const totalMatch = totalStr.match(/^(\d+\+?)(@\d+)?$/);
      if (totalMatch) {
        total = parseInt(totalMatch[1].replace("+", ""), 10);
        if (totalMatch[2]) {
          grace = parseInt(totalMatch[2].slice(1), 10);
          total += grace;
          i++;
        } else {
          i++;
          // Check next for separate grace
          if (i < tokens.length && tokens[i].startsWith("@")) {
            grace = parseInt(tokens[i].slice(1), 10);
            total += grace;
            i++;
          }
        }
      } else {
        i++;
        continue;
      }

      // GP
      if (i >= tokens.length || isNaN(parseInt(tokens[i]))) continue;
      const gp = parseInt(tokens[i], 10);
      i++;

      // Grade, possibly merged with credits
      if (i >= tokens.length) continue;
      let gradeToken = tokens[i];
      i++;
      let grade = gradeToken;
      let creditsToken;
      let merged = false;
      const mergedMatch = gradeToken.match(/^([A-Z+]+)(\d+(?:\.\d+)?)$/i);
      if (mergedMatch && /^[ABCDFO][+]?$/i.test(mergedMatch[1])) {
        grade = mergedMatch[1].toUpperCase();
        creditsToken = mergedMatch[2];
        merged = true;
      } else {
        creditsToken = tokens[i];
        i++;
      }

      const credits = parseFloat(creditsToken);
      if (isNaN(credits)) continue;

      // If merged, we already consumed grade+credits in one token, so don't increment again for credits

      // Credit points
      if (i >= tokens.length) continue;
      const creditPoints = parseFloat(tokens[i]);
      if (isNaN(creditPoints)) continue;
      i++;

      // Validate grade
      if (/^[ABCDFO][+]?$/i.test(grade)) {
        subjects.push({
          total,
          gp,
          grade,
          credits,
          creditPoints,
        });
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
    const termWork =
      markRows.T1 && markRows.T1[i] !== undefined ? markRows.T1[i] : null;
    const oral =
      markRows.O1 && markRows.O1[i] !== undefined ? markRows.O1[i] : null;
    const external =
      markRows.E1 && markRows.E1[i] !== undefined ? markRows.E1[i] : null;
    const internal =
      markRows.I1 && markRows.I1[i] !== undefined ? markRows.I1[i] : null;

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
        status: totData.grade === "F" ? "F" : "P",
      },
      isKT: totData.grade === "F" || totData.gp === 0,
      ktType: detectSubjectKTType(totData, {
        termWork,
        oral,
        external,
        internal,
      }),
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
  components: {
    termWork: number | null;
    oral: number | null;
    external: number | null;
    internal: number | null;
  },
): KTType | null {
  if (totData.grade !== "F" && totData.gp > 0) {
    return null;
  }

  // Check which component failed
  if (components.external !== null && components.external === 0) {
    return "external";
  }
  if (components.internal !== null && components.internal === 0) {
    return "internal";
  }
  if (components.termWork !== null && components.termWork === 0) {
    return "termWork";
  }
  if (components.oral !== null && components.oral === 0) {
    return "oral";
  }

  return "overall";
}

/**
 * Parse summary info (total marks, result, SGPA)
 */
function parseSummary(lines: string[]): {
  totalMarks: number;
  result: "PASS" | "FAILED";
  sgpa: number;
  cgpa: number | null;
} {
  let totalMarks = 0;
  let result: "PASS" | "FAILED" = "FAILED";
  let sgpa = 0;
  let cgpa: number | null = null;

  for (const line of lines) {
    const trimmed = line.trim().replace(/\s+/g, " "); // Normalize spaces

    // Flexible match for MARKS (XXX) RESULT, allowing extra spaces or parens
    const marksResultMatch = trimmed.match(
      /MARKS\s*\(?\s*([\d.]+)\s*\)?\s*(PASS|FAIL(?:ED)?)/i,
    );
    if (marksResultMatch) {
      totalMarks = parseFloat(marksResultMatch[1]);
      result = marksResultMatch[2].toUpperCase().startsWith("PASS")
        ? "PASS"
        : "FAILED";
    }

    // Flexible match for (XXX) PASS/FAILED in TOT or other lines
    const totResultMatch = trimmed.match(
      /\(?\s*([\d.]+)\s*\)?\s*(PASS|FAIL(?:ED)?)/i,
    );
    if (totResultMatch && totalMarks === 0) {
      totalMarks = parseFloat(totResultMatch[1]);
      result = totResultMatch[2].toUpperCase().startsWith("PASS")
        ? "PASS"
        : "FAILED";
    }

    // Find SGPA/CGPA - look for patterns like X.XX or X.XXXX at line end
    const sgpaMatches = trimmed.match(/([\d.]+)\s*(?:SGPA|CGPA)?\s*$/i);
    if (sgpaMatches) {
      const val = parseFloat(sgpaMatches[1]);
      if (val <= 10 && val >= 0) {
        if (trimmed.toUpperCase().includes("CGPA")) {
          cgpa = val;
        } else {
          sgpa = val;
        }
      }
    }
  }

  // Fallback: parse total from TOT line
  if (totalMarks === 0) {
    for (const line of lines) {
      if (line.startsWith("TOT")) {
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
