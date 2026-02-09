/**
 * KT (Keep Term) detection logic
 */

import type { Subject, KTResult, KTType } from '@/src/types/student';

/**
 * Detect KT status across all subjects for a student
 */
export function detectKT(subjects: Subject[]): KTResult {
    let totalKT = 0;
    let internalKT = 0;
    let externalKT = 0;
    let termWorkKT = 0;
    let oralKT = 0;
    const failedSubjects: string[] = [];

    for (const subject of subjects) {
        const { marks, code, name } = subject;

        // Check for KT conditions
        const isFailure = isSubjectFailed(marks.grade, marks.gradePoint, marks.status);

        if (isFailure) {
            totalKT++;
            failedSubjects.push(name || code);

            // Categorize by type if possible
            const ktType = detectKTType(subject);
            switch (ktType) {
                case 'internal':
                    internalKT++;
                    break;
                case 'external':
                    externalKT++;
                    break;
                case 'termWork':
                    termWorkKT++;
                    break;
                case 'oral':
                    oralKT++;
                    break;
                default:
                    // Count as external by default for theory subjects
                    if (isTheorySubject(code)) {
                        externalKT++;
                    } else {
                        termWorkKT++;
                    }
            }
        }
    }

    return {
        totalKT,
        internalKT,
        externalKT,
        termWorkKT,
        oralKT,
        failedSubjects,
        hasKT: totalKT > 0,
    };
}

/**
 * Check if a subject is failed based on grade, GP, or status
 */
function isSubjectFailed(
    grade: string | null | undefined,
    gradePoint: number | null | undefined,
    status: 'P' | 'F' | 'ABS' | null | undefined
): boolean {
    // F grade = failed
    if (grade === 'F') return true;

    // GP = 0 = failed
    if (gradePoint === 0) return true;

    // Status F or ABS = failed
    if (status === 'F' || status === 'ABS') return true;

    return false;
}

/**
 * Determine what type of KT this is based on marks breakdown
 */
function detectKTType(subject: Subject): KTType | null {
    const { marks, code } = subject;

    // If we have detailed marks, check which component failed
    if (marks.internal !== null && marks.internal === 0) {
        return 'internal';
    }

    if (marks.external !== null && marks.external === 0) {
        return 'external';
    }

    if (marks.termWork !== null && marks.termWork === 0) {
        return 'termWork';
    }

    if (marks.oral !== null && marks.oral === 0) {
        return 'oral';
    }

    // Based on subject type
    if (isTheorySubject(code)) {
        return 'external'; // Theory subjects primarily have external exams
    }

    if (isLabSubject(code)) {
        return 'termWork'; // Lab subjects are term work based
    }

    return 'overall';
}

/**
 * Subject codes that are theory-based (have external exams)
 */
function isTheorySubject(code: string): boolean {
    const theoryCodes = ['10411', '10412', '10413', '10414', '10415', '10420', '10424'];
    return theoryCodes.includes(code);
}

/**
 * Subject codes that are lab/practical-based
 */
function isLabSubject(code: string): boolean {
    const labCodes = ['10416', '10417', '10418', '10419', '10421', '10422', '10423'];
    return labCodes.includes(code);
}

/**
 * Get KT summary string for display
 */
export function getKTSummary(kt: KTResult): string {
    if (!kt.hasKT) return 'No KT';

    const parts: string[] = [];
    if (kt.externalKT > 0) parts.push(`${kt.externalKT} External`);
    if (kt.internalKT > 0) parts.push(`${kt.internalKT} Internal`);
    if (kt.termWorkKT > 0) parts.push(`${kt.termWorkKT} TW`);

    return parts.join(', ') || `${kt.totalKT} KT`;
}
