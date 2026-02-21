'use client';

/**
 * useResultLookup - React hook for ERN-based result lookup
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { StudentRecord } from '@/src/types/student';
import { searchStudent, validateSearchQuery, preloadResults } from '@/src/lib/resultFetcher';
import { DEFAULT_BRANCH } from '@/src/config/branches';

/**
 * Lookup state
 */
export interface LookupState {
    isLoading: boolean;
    error: string | null;
    student: StudentRecord | null;
    searched: boolean;
    searchedQuery: string;
}

/**
 * Lookup actions
 */
export interface LookupActions {
    search: (query: string, branchId?: string) => Promise<void>;
    reset: () => void;
    validate: (query: string) => string | null;
}

/**
 * Hook return type
 */
export type UseResultLookupReturn = LookupState & LookupActions;

/**
 * Initial state
 */
const initialState: LookupState = {
    isLoading: false,
    error: null,
    student: null,
    searched: false,
    searchedQuery: '',
};

/**
 * Hook for result lookup by ERN
 */
export function useResultLookup(): UseResultLookupReturn {
    const [state, setState] = useState<LookupState>(initialState);

    // Preload default results on mount
    useEffect(() => {
        preloadResults();
    }, []);

    /**
     * Search for student by query
     */
    const search = useCallback(async (query: string, branchId: string = DEFAULT_BRANCH): Promise<void> => {
        // Validate first
        const validationError = validateSearchQuery(query);
        if (validationError) {
            setState({
                isLoading: false,
                error: validationError,
                student: null,
                searched: true,
                searchedQuery: query,
            });
            return;
        }

        // Start loading
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            const result = await searchStudent(query, branchId);

            if (result.found && result.student) {
                setState({
                    isLoading: false,
                    error: null,
                    student: result.student,
                    searched: true,
                    searchedQuery: result.query,
                });
            } else {
                setState({
                    isLoading: false,
                    error: `No result found for query: ${result.query} in ${branchId === 'all' ? 'any file' : 'selected branch'}. Please check the number and try again.`,
                    student: null,
                    searched: true,
                    searchedQuery: result.query,
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred. Please try again.';

            setState({
                isLoading: false,
                error: errorMessage,
                student: null,
                searched: true,
                searchedQuery: query,
            });
        }
    }, []);

    /**
     * Reset to initial state
     */
    const reset = useCallback((): void => {
        setState(initialState);
    }, []);

    /**
     * Validate query
     */
    const validate = useCallback((query: string): string | null => {
        return validateSearchQuery(query);
    }, []);

    // Memoize return value
    return useMemo(() => ({
        ...state,
        search,
        reset,
        validate,
    }), [state, search, reset, validate]);
}
