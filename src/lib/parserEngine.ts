/**
 * Parser engine - orchestrates the complete parsing flow
 * Now delegates to the FastAPI Python parser service via /api/parse
 */

import type {
  StudentRecord,
  ParsedResult,
  ParserProgress,
  ParsingMetadata,
} from "@/src/types/student";
import { generateAnalysis } from "./analysisEngine";

/**
 * Parser configuration
 */
export interface ParserConfig {
  onProgress?: (progress: ParserProgress) => void;
  signal?: AbortSignal;
  validateResults?: boolean;
}

/**
 * Main parser function - sends PDF to FastAPI service and returns results
 */
export async function parseResultPdf(
  file: File,
  config: ParserConfig = {},
): Promise<ParsedResult> {
  const { onProgress, signal } = config;
  const startTime = Date.now();

  // Progress: uploading
  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    studentsFound: 0,
    status: "extracting",
    error: null,
  });

  try {
    // Check cancellation
    if (signal?.aborted) {
      throw new DOMException("Parsing cancelled", "AbortError");
    }

    // Progress: sending to parser
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      studentsFound: 0,
      status: "parsing",
      error: null,
    });

    // Send PDF to API
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse", {
      method: "POST",
      body: formData,
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Parser service error" }));
      throw new Error(errorData.error || `Parsing failed (HTTP ${response.status})`);
    }

    const result = await response.json();

    // Progress: analyzing
    onProgress?.({
      currentPage: 0,
      totalPages: result.metadata?.totalPages || 0,
      studentsFound: result.students?.length || 0,
      status: "analyzing",
      error: null,
    });

    // Map students from API response to StudentRecord[]
    const students: StudentRecord[] = (result.students || []).map((s: Record<string, unknown>) => ({
      seatNumber: s.seatNumber as string || "",
      name: s.name as string || "",
      gender: s.gender as "MALE" | "FEMALE" | null,
      ern: s.ern as string | null,
      college: s.college as string || "",
      status: s.status as string || "Regular",
      subjects: (s.subjects as Array<Record<string, unknown>> || []).map((sub: Record<string, unknown>) => ({
        code: sub.code as string || "",
        name: sub.name as string || "",
        marks: sub.marks as StudentRecord["subjects"][0]["marks"],
        isKT: sub.isKT as boolean || false,
        ktType: sub.ktType as StudentRecord["subjects"][0]["ktType"],
      })),
      totalMarks: s.totalMarks as number || 0,
      maxMarks: s.maxMarks as number || 800,
      result: s.result as "PASS" | "FAILED" || "FAILED",
      sgpa: s.sgpa as number || 0,
      cgpa: s.cgpa as number | null || null,
      totalCredits: s.totalCredits as number || 0,
      totalCreditPoints: s.totalCreditPoints as number || 0,
      kt: (s.kt as StudentRecord["kt"]) || {
        totalKT: 0,
        internalKT: 0,
        externalKT: 0,
        termWorkKT: 0,
        oralKT: 0,
        failedSubjects: [],
        hasKT: false,
      },
    }));

    // Use server-side analysis or generate client-side
    const analysis = result.analysis || generateAnalysis(students);

    // Create metadata
    const metadata: ParsingMetadata = {
      sourceFile: file.name,
      totalPages: result.metadata?.totalPages || 0,
      parsedAt: new Date(),
      parseTimeMs: Date.now() - startTime,
      examSession: result.metadata?.examSession || "December 2025",
      university: result.metadata?.university || "University of Mumbai",
    };

    // Progress: complete
    onProgress?.({
      currentPage: metadata.totalPages,
      totalPages: metadata.totalPages,
      studentsFound: students.length,
      status: "complete",
      error: null,
    });

    return {
      students,
      metadata,
      analysis,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      onProgress?.({
        currentPage: 0,
        totalPages: 0,
        studentsFound: 0,
        status: "cancelled",
        error: "Parsing cancelled by user",
      });
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      studentsFound: 0,
      status: "error",
      error: errorMessage,
    });
    throw error;
  }
}

/**
 * Quick parse - just get student count without full analysis
 */
export async function quickParse(
  file: File,
  signal?: AbortSignal,
): Promise<{ count: number; pages: number }> {
  const result = await parseResultPdf(file, { signal });
  return {
    count: result.students.length,
    pages: result.metadata.totalPages,
  };
}

