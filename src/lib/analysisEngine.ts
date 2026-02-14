/**
 * Analysis engine - generates statistics from parsed student data
 */

import type { StudentRecord, AnalysisSummary, MarksDistribution, KTDistribution } from '@/src/types/student';

/**
 * Generate comprehensive analysis from parsed students
 */
export function generateAnalysis(students: StudentRecord[]): AnalysisSummary {
    if (students.length === 0) {
        return createEmptyAnalysis();
    }

    const totalStudents = students.length;
    const passedStudents = students.filter(s => s.result === 'PASS');
    const failedStudents = students.filter(s => s.result === 'FAILED');
    const studentsWithKT = students.filter(s => s.kt.hasKT);

    // Calculate marks statistics
    const marks = students.map(s => s.totalMarks).filter(m => m > 0);
    const highestMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const lowestMarks = marks.length > 0 ? Math.min(...marks) : 0;
    const averageMarks = marks.length > 0
        ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length)
        : 0;

    // Calculate SGPA statistics
    const sgpas = students.map(s => s.sgpa).filter(s => s > 0);
    const averageSGPA = sgpas.length > 0

        ? Math.round((sgpas.reduce((a, b) => a + b, 0) / sgpas.length) * 100) / 100
        : 0;

    // Calculate KT average
    const totalKTs = students.reduce((sum, s) => sum + s.kt.totalKT, 0);
    const averageKTPerStudent = totalStudents > 0
        ? Math.round((totalKTs / totalStudents) * 100) / 100
        : 0;

    return {
        totalStudents,
        passedCount: passedStudents.length,
        failedCount: failedStudents.length,
        passPercentage: Math.round((passedStudents.length / totalStudents) * 10000) / 100,
        studentsWithKT: studentsWithKT.length,
        averageKTPerStudent,
        highestMarks,
        lowestMarks,
        averageMarks,
        averageSGPA,
        marksDistribution: calculateMarksDistribution(students),
        ktDistribution: calculateKTDistribution(students),
    };
}

/**
 * Calculate marks distribution by class
 */
function calculateMarksDistribution(students: StudentRecord[]): MarksDistribution {
    const maxMarks = 800; // From PDF

    const distribution: MarksDistribution = {
        distinction: 0,
        firstClass: 0,
        secondClass: 0,
        passClass: 0,
        fail: 0,
    };

    for (const student of students) {
        const percentage = (student.totalMarks / maxMarks) * 100;

        if (percentage >= 75) {
            distribution.distinction++;
        } else if (percentage >= 60) {
            distribution.firstClass++;
        } else if (percentage >= 50) {
            distribution.secondClass++;
        } else if (percentage >= 40 && student.result === 'PASS') {
            distribution.passClass++;
        } else {
            distribution.fail++;
        }
    }

    return distribution;
}

/**
 * Calculate KT count distribution
 */
function calculateKTDistribution(students: StudentRecord[]): KTDistribution {
    const distribution: KTDistribution = {
        noKT: 0,
        oneKT: 0,
        twoKT: 0,
        threeOrMoreKT: 0,
    };

    for (const student of students) {
        const ktCount = student.kt.totalKT;

        if (ktCount === 0) {
            distribution.noKT++;
        } else if (ktCount === 1) {
            distribution.oneKT++;
        } else if (ktCount === 2) {
            distribution.twoKT++;
        } else {
            distribution.threeOrMoreKT++;
        }
    }

    return distribution;
}

/**
 * Create empty analysis for no students
 */
function createEmptyAnalysis(): AnalysisSummary {
    return {
        totalStudents: 0,
        passedCount: 0,
        failedCount: 0,
        passPercentage: 0,
        studentsWithKT: 0,
        averageKTPerStudent: 0,
        highestMarks: 0,
        lowestMarks: 0,
        averageMarks: 0,
        averageSGPA: 0,
        marksDistribution: {
            distinction: 0,
            firstClass: 0,
            secondClass: 0,
            passClass: 0,
            fail: 0,
        },
        ktDistribution: {
            noKT: 0,
            oneKT: 0,
            twoKT: 0,
            threeOrMoreKT: 0,
        },
    };
}

/**
 * Get performance grade based on SGPA
 */
export function getSGPAGrade(sgpa: number): string {
    if (sgpa >= 9.0) return 'Outstanding';
    if (sgpa >= 8.0) return 'Excellent';
    if (sgpa >= 7.0) return 'Very Good';
    if (sgpa >= 6.0) return 'Good';
    if (sgpa >= 5.0) return 'Average';
    if (sgpa >= 4.0) return 'Below Average';
    return 'Poor';
}

/**
 * Get color class for result
 */
export function getResultColor(result: 'PASS' | 'FAILED'): string {
    return result === 'PASS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
}
