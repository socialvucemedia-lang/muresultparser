'use client';

/**
 * SubjectsTable - Display subject marks with KT highlighting
 */

import { BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Subject } from '@/src/types/student';

interface SubjectsTableProps {
    subjects: Subject[];
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
    return (
        <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Subject-wise Marks
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[300px]">Subject</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                                <TableHead className="text-center">Grade</TableHead>
                                <TableHead className="text-center">GP</TableHead>
                                <TableHead className="text-center">Credits</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.map((subject) => (
                                <TableRow
                                    key={subject.code}
                                    className={`
                                        transition-colors
                                        ${subject.isKT ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20' : 'hover:bg-muted/50'}
                                    `}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{subject.name}</span>
                                            {subject.isKT && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">
                                                    KT
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                            {subject.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-foreground/80">
                                        {subject.marks.total}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <GradeBadge grade={subject.marks.grade} />
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {subject.marks.gradePoint}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {subject.marks.credits}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={subject.marks.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4 bg-muted/10">
                    {subjects.map((subject) => (
                        <SubjectCard key={subject.code} subject={subject} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface SubjectCardProps {
    subject: Subject;
}

function SubjectCard({ subject }: SubjectCardProps) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all shadow-sm ${subject.isKT
                    ? 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-800/50'
                    : 'bg-card border-border hover:border-primary/20'
                }`}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight">
                            {subject.name}
                        </h4>
                        {subject.isKT && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase">
                                KT
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground bg-muted/50 inline-block px-1.5 rounded">
                        {subject.code}
                    </p>
                </div>
                <StatusBadge status={subject.marks.status} />
            </div>

            <div className="grid grid-cols-4 gap-2 py-3 bg-muted/20 rounded-lg border border-border/50">
                <div className="text-center border-r border-border/50 last:border-0">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Total</p>
                    <p className="font-bold text-sm">{subject.marks.total}</p>
                </div>
                <div className="text-center border-r border-border/50 last:border-0">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Grade</p>
                    <GradeBadge grade={subject.marks.grade} />
                </div>
                <div className="text-center border-r border-border/50 last:border-0">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Point</p>
                    <p className="font-semibold text-sm">{subject.marks.gradePoint}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Crd</p>
                    <p className="font-semibold text-sm">{subject.marks.credits}</p>
                </div>
            </div>
        </div>
    );
}

function GradeBadge({ grade }: { grade: string }) {
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'O':
                return 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-md';
            case 'A+':
                return 'bg-emerald-400 text-white';
            case 'A':
                return 'bg-green-400 text-white';
            case 'B+':
                return 'bg-blue-400 text-white';
            case 'B':
                return 'bg-blue-300 text-blue-900';
            case 'C':
                return 'bg-amber-400 text-amber-900';
            case 'D':
                return 'bg-orange-400 text-white';
            case 'F':
                return 'bg-red-500 text-white shadow-red-500/20 shadow-md';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <span
            className={`inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(grade)}`}
        >
            {grade}
        </span>
    );
}

function StatusBadge({ status }: { status: 'P' | 'F' | 'ABS' | null }) {
    if (status === 'P') {
        return (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30">
                Pass
            </Badge>
        );
    }
    if (status === 'F') {
        return (
            <Badge variant="destructive" className="shadow-red-500/20 shadow-sm">
                Fail
            </Badge>
        );
    }
    if (status === 'ABS') {
        return (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Absent
            </Badge>
        );
    }
    return <span className="text-muted-foreground">-</span>;
}
