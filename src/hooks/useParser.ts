'use client';

/**
 * Custom hook for PDF parsing state management
 */

import { useState, useCallback, useRef } from 'react';
import type { ParsedResult, ParserProgress, StudentRecord, AnalysisSummary } from '@/src/types/student';
import { parseResultPdf } from '@/src/lib/parserEngine';
import { validatePdfFile, getPdfInfo } from '@/src/lib/pdfExtractor';

/**
 * Parser state
 */
export interface ParserState {
    // File state
    file: File | null;
    fileInfo: { pageCount: number; fileName: string } | null;

    // Parsing state
    isLoading: boolean;
    isParsing: boolean;
    progress: ParserProgress | null;

    // Results state
    result: ParsedResult | null;
    students: StudentRecord[];
    analysis: AnalysisSummary | null;

    // Error state
    error: string | null;
}

/**
 * Parser actions
 */
export interface ParserActions {
    setFile: (file: File | null) => Promise<void>;
    startParsing: () => Promise<void>;
    cancelParsing: () => void;
    reset: () => void;
}

/**
 * Initial state
 */
const initialState: ParserState = {
    file: null,
    fileInfo: null,
    isLoading: false,
    isParsing: false,
    progress: null,
    result: null,
    students: [],
    analysis: null,
    error: null,
};

/**
 * useParser hook
 */
export function useParser(): ParserState & ParserActions {
    const [state, setState] = useState<ParserState>(initialState);
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Set file and validate
     */
    const setFile = useCallback(async (file: File | null) => {
        if (!file) {
            setState(prev => ({ ...prev, file: null, fileInfo: null, error: null }));
            return;
        }

        // Validate file
        const validation = validatePdfFile(file);
        if (!validation.valid) {
            setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get file info
            const fileInfo = await getPdfInfo(file);
            setState(prev => ({
                ...prev,
                file,
                fileInfo,
                isLoading: false,
                error: null,
                // Clear previous results
                result: null,
                students: [],
                analysis: null,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                file: null,
                fileInfo: null,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load file',
            }));
        }
    }, []);

    /**
     * Start parsing
     */
    const startParsing = useCallback(async () => {
        if (!state.file) {
            setState(prev => ({ ...prev, error: 'No file selected' }));
            return;
        }

        // Create abort controller
        abortControllerRef.current = new AbortController();

        setState(prev => ({
            ...prev,
            isParsing: true,
            progress: {
                currentPage: 0,
                totalPages: prev.fileInfo?.pageCount || 0,
                studentsFound: 0,
                status: 'loading',
                error: null,
            },
            error: null,
        }));

        try {
            const result = await parseResultPdf(state.file, {
                onProgress: (progress) => {
                    setState(prev => ({ ...prev, progress }));
                },
                signal: abortControllerRef.current.signal,
                validateResults: true,
            });

            setState(prev => ({
                ...prev,
                isParsing: false,
                result,
                students: result.students,
                analysis: result.analysis,
                progress: {
                    ...prev.progress!,
                    status: 'complete',
                },
            }));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                setState(prev => ({
                    ...prev,
                    isParsing: false,
                    progress: prev.progress ? { ...prev.progress, status: 'cancelled' } : null,
                }));
                return;
            }

            setState(prev => ({
                ...prev,
                isParsing: false,
                error: error instanceof Error ? error.message : 'Parsing failed',
                progress: prev.progress ? { ...prev.progress, status: 'error' } : null,
            }));
        }
    }, [state.file, state.fileInfo]);

    /**
     * Cancel parsing
     */
    const cancelParsing = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Reset all state
     */
    const reset = useCallback(() => {
        cancelParsing();
        setState(initialState);
    }, [cancelParsing]);

    return {
        ...state,
        setFile,
        startParsing,
        cancelParsing,
        reset,
    };
}
