/**
 * Parser engine - orchestrates the complete parsing flow
 */

import type {
    StudentRecord,
    ParsedResult,
    ParserProgress,
    ParsingMetadata,
} from '@/src/types/student';
import { extractPdfText, type ExtractionConfig } from './pdfExtractor';
import { findStudentBlocks, parseStudentBlock } from './recordParser';
import { generateAnalysis } from './analysisEngine';
import { validateParsedResult } from './validator';

/**
 * Parser configuration
 */
export interface ParserConfig {
    onProgress?: (progress: ParserProgress) => void;
    signal?: AbortSignal;
    validateResults?: boolean;
}

/**
 * Main parser function - orchestrates extraction, parsing, and analysis
 */
export async function parseResultPdf(
    file: File,
    config: ParserConfig = {}
): Promise<ParsedResult> {
    const { onProgress, signal, validateResults = true } = config;
    const startTime = Date.now();

    const students: StudentRecord[] = [];
    const seenSeats = new Set<string>();
    let totalPages = 0;
    let currentPage = 0;

    // Update progress helper
    const updateProgress = (updates: Partial<ParserProgress>) => {
        onProgress?.({
            currentPage,
            totalPages,
            studentsFound: students.length,
            status: 'extracting',
            error: null,
            ...updates,
        });
    };

    try {
        // Extract and parse page by page
        const extractionConfig: ExtractionConfig = {
            onProgress: (p) => {
                totalPages = p.totalPages;
                currentPage = p.currentPage;
                updateProgress({ status: 'extracting' });
            },
            signal,
        };

        const pageGenerator = extractPdfText(file, extractionConfig);

        for await (const page of pageGenerator) {
            // Check cancellation
            if (signal?.aborted) {
                throw new DOMException('Parsing cancelled', 'AbortError');
            }

            updateProgress({ status: 'parsing', currentPage: page.pageNumber });

            // Find student blocks in this page
            const blocks = findStudentBlocks(page.lines, page.pageNumber);

            // Parse each block
            for (const block of blocks) {
                const student = parseStudentBlock(block);
                if (student && !seenSeats.has(student.seatNumber)) {
                    students.push(student);
                    seenSeats.add(student.seatNumber);
                    updateProgress({ studentsFound: students.length });
                }
            }
        }

        updateProgress({ status: 'analyzing' });

        // Validate if requested
        if (validateResults) {
            const validation = validateParsedResult(students);
            if (validation.warnings.length > 0) {
                console.warn('Validation warnings:', validation.warnings);
            }
        }

        // Generate analysis
        const analysis = generateAnalysis(students);

        // Create metadata
        const metadata: ParsingMetadata = {
            sourceFile: file.name,
            totalPages,
            parsedAt: new Date(),
            parseTimeMs: Date.now() - startTime,
            examSession: 'December 2025', // Could be extracted from PDF
            university: 'University of Mumbai',
        };

        updateProgress({ status: 'complete' });

        return {
            students,
            metadata,
            analysis,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            updateProgress({ status: 'cancelled', error: 'Parsing cancelled by user' });
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateProgress({ status: 'error', error: errorMessage });
        throw error;
    }
}

/**
 * Quick parse - just get student count without full analysis
 */
export async function quickParse(
    file: File,
    signal?: AbortSignal
): Promise<{ count: number; pages: number }> {
    let count = 0;
    let pages = 0;
    const seenSeats = new Set<string>();

    const pageGenerator = extractPdfText(file, { signal });

    for await (const page of pageGenerator) {
        pages++;
        const blocks = findStudentBlocks(page.lines, page.pageNumber);

        for (const block of blocks) {
            const student = parseStudentBlock(block);
            if (student && !seenSeats.has(student.seatNumber)) {
                count++;
                seenSeats.add(student.seatNumber);
            }
        }
    }

    return { count, pages };
}
