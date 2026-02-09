/**
 * Data validation utilities
 */

import type { StudentRecord, Subject } from '@/src/types/student';

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    studentSeat?: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    studentSeat?: string;
}

/**
 * Validate a parsed student record
 */
export function validateStudent(student: StudentRecord): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!student.seatNumber || !/^\d{7}$/.test(student.seatNumber)) {
        errors.push({
            field: 'seatNumber',
            message: 'Invalid seat number format (expected 7 digits)',
            studentSeat: student.seatNumber,
        });
    }

    if (!student.name || student.name.trim().length < 2) {
        errors.push({
            field: 'name',
            message: 'Student name is required',
            studentSeat: student.seatNumber,
        });
    }

    // Marks validation
    if (student.totalMarks < 0 || student.totalMarks > student.maxMarks) {
        warnings.push({
            field: 'totalMarks',
            message: `Total marks ${student.totalMarks} may be invalid (max: ${student.maxMarks})`,
            studentSeat: student.seatNumber,
        });
    }

    // SGPA validation
    if (student.sgpa < 0 || student.sgpa > 10) {
        warnings.push({
            field: 'sgpa',
            message: `SGPA ${student.sgpa} is out of valid range (0-10)`,
            studentSeat: student.seatNumber,
        });
    }

    // Result consistency
    if (student.result === 'PASS' && student.kt.hasKT) {
        warnings.push({
            field: 'result',
            message: 'Student marked as PASS but has KT subjects',
            studentSeat: student.seatNumber,
        });
    }

    // Subject validation
    for (const subject of student.subjects) {
        const subjectValidation = validateSubject(subject, student.seatNumber);
        errors.push(...subjectValidation.errors);
        warnings.push(...subjectValidation.warnings);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate a subject record
 */
function validateSubject(subject: Subject, studentSeat: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Grade-GP consistency
    const expectedGP = gradeToGP(subject.marks.grade);
    if (expectedGP !== null && subject.marks.gradePoint !== expectedGP) {
        warnings.push({
            field: `subject.${subject.code}.gradePoint`,
            message: `Grade ${subject.marks.grade} doesn't match GP ${subject.marks.gradePoint}`,
            studentSeat,
        });
    }

    // Credit points consistency
    const expectedCP = subject.marks.credits * subject.marks.gradePoint;
    if (Math.abs(subject.marks.creditPoints - expectedCP) > 0.1) {
        warnings.push({
            field: `subject.${subject.code}.creditPoints`,
            message: `Credit points ${subject.marks.creditPoints} doesn't match expected ${expectedCP}`,
            studentSeat,
        });
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Grade to GP mapping
 */
function gradeToGP(grade: string): number | null {
    const mapping: Record<string, number> = {
        'O': 10,
        'A+': 9,
        'A': 8,
        'B+': 7,
        'B': 6,
        'C': 5,
        'D': 4,
        'F': 0,
    };
    return mapping[grade] ?? null;
}

/**
 * Check for duplicate seat numbers
 */
export function findDuplicates(students: StudentRecord[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const student of students) {
        if (seen.has(student.seatNumber)) {
            duplicates.push(student.seatNumber);
        } else {
            seen.add(student.seatNumber);
        }
    }

    return duplicates;
}

/**
 * Validate entire parsed result
 */
export function validateParsedResult(students: StudentRecord[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for duplicates
    const duplicates = findDuplicates(students);
    for (const dup of duplicates) {
        errors.push({
            field: 'seatNumber',
            message: `Duplicate seat number found: ${dup}`,
        });
    }

    // Validate each student
    for (const student of students) {
        const result = validateStudent(student);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
