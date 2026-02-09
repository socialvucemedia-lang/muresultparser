'use client';

/**
 * Subject breakdown component showing detailed marks for each subject
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StudentRecord, Subject } from '@/src/types/student';
import { cn } from '@/lib/utils';

interface SubjectBreakdownProps {
    student: StudentRecord;
    onClose: () => void;
}

export function SubjectBreakdown({ student, onClose }: SubjectBreakdownProps) {
    return (
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Seat: {student.seatNumber} | Total: {student.totalMarks} | SGPA: {student.sgpa.toFixed(2)}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="whitespace-nowrap px-2 py-2 text-left font-medium">Subject</th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">T1<br /><span className="text-xs text-muted-foreground">Term Work</span></th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">O1<br /><span className="text-xs text-muted-foreground">Oral</span></th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">E1<br /><span className="text-xs text-muted-foreground">External</span></th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">I1<br /><span className="text-xs text-muted-foreground">Internal</span></th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">Total</th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">Grade</th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">GP</th>
                                <th className="whitespace-nowrap px-2 py-2 text-center font-medium">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {student.subjects.map((subject) => (
                                <SubjectRow key={subject.code} subject={subject} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function SubjectRow({ subject }: { subject: Subject }) {
    const { marks, isKT } = subject;

    const formatMark = (mark: number | null) => {
        if (mark === null) return '-';
        return mark.toString();
    };

    return (
        <tr className={cn('hover:bg-muted/30', isKT && 'bg-red-50/50 dark:bg-red-950/20')}>
            <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                    {isKT && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    <div className="max-w-[180px]">
                        <div className="font-medium truncate" title={subject.name}>
                            {subject.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{subject.code}</div>
                    </div>
                </div>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                <span className={cn(marks.termWork === 0 && marks.status === 'F' && 'text-red-500 font-bold')}>
                    {formatMark(marks.termWork)}
                </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                <span className={cn(marks.oral === 0 && marks.status === 'F' && 'text-red-500 font-bold')}>
                    {formatMark(marks.oral)}
                </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                <span className={cn(marks.external === 0 && marks.status === 'F' && 'text-red-500 font-bold')}>
                    {formatMark(marks.external)}
                </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                <span className={cn(marks.internal === 0 && marks.status === 'F' && 'text-red-500 font-bold')}>
                    {formatMark(marks.internal)}
                </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center font-medium">
                {marks.total}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                <span
                    className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        marks.grade === 'F'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : marks.grade === 'O' || marks.grade === 'A+' || marks.grade === 'A'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}
                >
                    {marks.grade}
                </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                {marks.gradePoint}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-center">
                {marks.credits}
            </td>
        </tr>
    );
}
