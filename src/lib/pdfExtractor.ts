/**
 * PDF text extraction using pdfjs-dist
 * Processes PDFs page-by-page to avoid memory issues
 */

import type { ParserProgress } from "@/src/types/student";

// Types from pdfjs-dist (avoiding import issues with Next.js)
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  destroy(): Promise<void>;
}

interface PDFPageProxy {
  getTextContent(): Promise<TextContent>;
  cleanup(): void;
}

interface TextContent {
  items: TextItem[];
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

/**
 * Configuration for PDF extraction
 */
export interface ExtractionConfig {
  onProgress?: (progress: ParserProgress) => void;
  signal?: AbortSignal;
}

/**
 * Result of extracting a single page
 */
export interface PageExtractionResult {
  pageNumber: number;
  text: string;
  lines: string[];
}

/**
 * Lazy load pdfjs-dist only when needed (browser-only)
 */
async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  // Set worker source - using CDN for reliability
  const pdfjsVersion = pdfjs.version || "5.0.375";
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

  return pdfjs;
}

/**
 * Extract text from a PDF file
 * Yields page-by-page for memory efficiency
 */
export async function* extractPdfText(
  file: File,
  config: ExtractionConfig = {},
): AsyncGenerator<PageExtractionResult, void, unknown> {
  const { onProgress, signal } = config;

  // Load PDF.js
  const pdfjs = await loadPdfJs();

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Check for cancellation
  if (signal?.aborted) {
    throw new DOMException("Extraction cancelled", "AbortError");
  }

  // Load PDF document
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf: PDFDocumentProxy = (await loadingTask.promise) as any;
  const totalPages = pdf.numPages;

  try {
    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // Check for cancellation before each page
      if (signal?.aborted) {
        throw new DOMException("Extraction cancelled", "AbortError");
      }

      // Update progress
      onProgress?.({
        currentPage: pageNum,
        totalPages,
        studentsFound: 0,
        status: "extracting",
        error: null,
      });

      // Get page and extract text
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      const textContent: TextContent = await page.getTextContent();

      // Sort text items by position and reconstruct lines with improved table handling
      const lines = reconstructTableLines(textContent.items as TextItem[]);
      const text = lines.join("\n");

      // Clean up page to free memory
      page.cleanup();

      yield {
        pageNumber: pageNum,
        text,
        lines,
      };
    }
  } finally {
    // Always destroy the document to free memory
    await pdf.destroy();
  }
}

/**
 * Reconstruct lines from PDF text items with improved table handling
 * Groups by Y, detects columns, and aligns text
 */
function reconstructTableLines(items: TextItem[]): string[] {
  if (items.length === 0) return [];

  // Group items by approximate Y position
  const lineMap = new Map<number, TextItem[]>();
  const yThreshold = 3; // Tighter threshold for better grouping

  for (const item of items) {
    const y = Math.round(item.transform[5] / yThreshold) * yThreshold;
    if (!lineMap.has(y)) {
      lineMap.set(y, []);
    }
    lineMap.get(y)!.push(item);
  }

  // Sort lines by Y position (descending for top-to-bottom)
  const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

  // Detect common column positions (X bins)
  const allX = items.map((i) => Math.round(i.transform[4] / 10) * 10);
  const uniqueX = [...new Set(allX)].sort((a, b) => a - b);
  const columns = uniqueX; // Use as column boundaries

  // Build lines with tab-separated columns
  const lines: string[] = [];

  for (const y of sortedYs) {
    const lineItems = lineMap.get(y)!;
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

    const colValues = new Array(columns.length).fill("");
    for (const item of lineItems) {
      const xBin = Math.round(item.transform[4] / 10) * 10;
      const colIndex = columns.indexOf(xBin);
      if (colIndex >= 0) {
        colValues[colIndex] += item.str.trim();
      }
    }

    // Join non-empty columns with tabs or spaces
    const line = colValues.filter((v) => v.trim()).join("\t");
    if (line.trim()) {
      lines.push(line);
    }
  }

  return lines;
}

/**
 * Get PDF metadata without full extraction
 */
export async function getPdfInfo(
  file: File,
): Promise<{ pageCount: number; fileName: string }> {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  await pdf.destroy();

  return {
    pageCount,
    fileName: file.name,
  };
}

/**
 * Validate that a file is a valid PDF
 */
export function validatePdfFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "File must be a PDF" };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 50MB" };
  }

  return { valid: true };
}
