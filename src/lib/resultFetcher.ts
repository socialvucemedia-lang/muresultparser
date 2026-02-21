/**
 * Result fetcher - handles data loading and caching for student results
 */

import type { StudentRecord } from '@/src/types/student';
import { BRANCHES, DEFAULT_BRANCH } from '@/src/config/branches';

/**
 * Results cache structure: Record<filename, ResultData>
 */
interface CacheEntry {
    data: Record<string, StudentRecord>;
    timestamp: number;
}

// Cache by filename to support multiple branch files
let resultsCache: Record<string, CacheEntry> = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches results for a specific branch/file
 */
export async function fetchResults(branchId: string = DEFAULT_BRANCH): Promise<Record<string, StudentRecord>> {
    const branch = BRANCHES.find(b => b.id === branchId);
    const fileName = branch ? branch.file : 'results.json';

    // Return cached data if still valid
    const now = Date.now();
    const cacheEntry = resultsCache[fileName];

    if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_DURATION_MS) {
        return cacheEntry.data;
    }

    try {
        const response = await fetch(`/data/${fileName}`, {
            headers: {
                'Cache-Control': 'max-age=300',
            },
        });

        if (!response.ok) {
            // If specific branch file not found, try fallback or just throw
            if (response.status === 404 && branchId !== DEFAULT_BRANCH) {
                console.warn(`File ${fileName} not found for branch ${branchId}, falling back to results.json`);
                // Try to fetch default file as fallback
                return fetchResults(DEFAULT_BRANCH);
            }
            throw new Error(`Failed to fetch results for ${branchId}: ${response.status}`);
        }

        const data = await response.json() as Record<string, StudentRecord>;

        // Update cache
        resultsCache[fileName] = {
            data,
            timestamp: now
        };

        return data;
    } catch (error) {
        // If we have stale cache, return it on error
        if (cacheEntry) {
            console.warn('Using stale cache due to fetch error:', error);
            return cacheEntry.data;
        }
        throw error;
    }
}

/**
 * Search result type
 */
export interface SearchResult {
    found: boolean;
    student: StudentRecord | null;
    query: string;
}

/**
 * Searches for a student by ERN or Seat Number in a specific branch
 */
export async function searchStudent(query: string, branchId: string = DEFAULT_BRANCH): Promise<SearchResult> {
    if (!query || !query.trim()) {
        return { found: false, student: null, query };
    }

    const normalizedQuery = query.trim().toUpperCase();

    try {
        const results = await fetchResults(branchId);

        // Direct lookup by ERN key
        if (results[normalizedQuery]) {
            return {
                found: true,
                student: results[normalizedQuery],
                query: normalizedQuery,
            };
        }

        // Fallback: search by ern or seatNumber field
        for (const [key, student] of Object.entries(results)) {
            if (student.ern?.toUpperCase() === normalizedQuery || student.seatNumber?.toUpperCase() === normalizedQuery) {
                return {
                    found: true,
                    student,
                    query: normalizedQuery,
                };
            }
        }
    } catch (error) {
        console.error('Search failed:', error);
    }

    return { found: false, student: null, query: normalizedQuery };
}

/**
 * Validates search query format
 * Returns null if valid, error message if invalid
 */
export function validateSearchQuery(query: string): string | null {
    if (!query || !query.trim()) {
        return 'Please enter an ERN or Seat Number';
    }

    const normalized = query.trim().toUpperCase();

    if (normalized.startsWith('MU')) {
        // ERN validation
        if (normalized.length < 15) {
            return 'ERN seems too short. Please check and try again.';
        }
    } else if (/^\d+$/.test(normalized)) {
        // Seat Number validation - mostly digits, any length over 3 should be fine for now or adjust based on minimum seat number length you have
        if (normalized.length < 4) {
            return 'Seat number seems too short. Please check and try again.';
        }
    } else {
        return 'Query must start with MU for ERN or contain only numbers for Seat Number.';
    }

    if (!/^[A-Z0-9]+$/.test(normalized)) {
        return 'Query should only contain letters and numbers';
    }

    return null;
}

/**
 * Clear the results cache (useful for force refresh)
 */
export function clearResultsCache(): void {
    resultsCache = {};
}

/**
 * Preload results in the background (call on page load)
 */
export function preloadResults(branchId: string = DEFAULT_BRANCH): void {
    fetchResults(branchId).catch(console.error);
}
