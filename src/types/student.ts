/**
 * Type definitions for university result PDF parsing
 */

/**
 * Subject marks breakdown
 */
export interface SubjectMarks {
  termWork: number | null;
  oral: number | null;
  external: number | null;
  internal: number | null;
  total: number;
  gradePoint: number;
  grade: string;
  credits: number;
  creditPoints: number;
  status: 'P' | 'F' | 'ABS' | null; // Pass, Fail, Absent
}

/**
 * Individual subject record
 */
export interface Subject {
  code: string;
  name: string;
  marks: SubjectMarks;
  isKT: boolean;
  ktType: KTType | null;
}

/**
 * KT (Keep Term) type categorization
 */
export type KTType = 'internal' | 'external' | 'termWork' | 'oral' | 'overall';

/**
 * KT detection results for a student
 */
export interface KTResult {
  totalKT: number;
  internalKT: number;
  externalKT: number;
  termWorkKT: number;
  oralKT: number;
  failedSubjects: string[];
  hasKT: boolean;
}

/**
 * Complete student record
 */
export interface StudentRecord {
  seatNumber: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | null;
  ern: string | null;
  college: string;
  status: 'Regular' | 'ATKT' | string;
  subjects: Subject[];
  totalMarks: number;
  maxMarks: number;
  result: 'PASS' | 'FAILED';
  sgpa: number;
  cgpa: number | null;
  totalCredits: number;
  totalCreditPoints: number;
  kt: KTResult;
}

/**
 * Parsed result container
 */
export interface ParsedResult {
  students: StudentRecord[];
  metadata: ParsingMetadata;
  analysis: AnalysisSummary | null;
}

/**
 * Metadata about the parsing operation
 */
export interface ParsingMetadata {
  sourceFile: string;
  totalPages: number;
  parsedAt: Date;
  parseTimeMs: number;
  examSession: string;
  university: string;
}

/**
 * Analysis summary statistics
 */
export interface AnalysisSummary {
  totalStudents: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
  studentsWithKT: number;
  averageKTPerStudent: number;
  highestMarks: number;
  lowestMarks: number;
  averageMarks: number;
  averageSGPA: number;
  marksDistribution: MarksDistribution;
  ktDistribution: KTDistribution;
}

/**
 * Distribution of marks in ranges
 */
export interface MarksDistribution {
  distinction: number;   // >= 75%
  firstClass: number;    // >= 60%
  secondClass: number;   // >= 50%
  passClass: number;     // >= 40%
  fail: number;          // < 40%
}

/**
 * Distribution of KT counts
 */
export interface KTDistribution {
  noKT: number;
  oneKT: number;
  twoKT: number;
  threeOrMoreKT: number;
}

/**
 * Parser progress state
 */
export interface ParserProgress {
  currentPage: number;
  totalPages: number;
  studentsFound: number;
  status: ParserStatus;
  error: string | null;
}

/**
 * Parser status enum
 */
export type ParserStatus =
  | 'idle'
  | 'loading'
  | 'extracting'
  | 'parsing'
  | 'analyzing'
  | 'complete'
  | 'error'
  | 'cancelled';

/**
 * Subject code to name mapping (from PDF header)
 */
export interface SubjectMapping {
  [code: string]: string;
}

/**
 * Raw text block for a student (before parsing)
 */
export interface RawStudentBlock {
  text: string;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  pendingErn?: string; // ERN found at end of previous block (handles split ERN across blocks)
}

/**
 * Excel export options
 */
export interface ExportOptions {
  includeSubjectDetails: boolean;
  includeSummarySheet: boolean;
  fileName: string;
}
