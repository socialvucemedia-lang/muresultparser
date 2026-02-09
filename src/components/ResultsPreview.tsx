'use client';

/**
 * Results preview table component with subject breakdown
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Search, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StudentRecord } from '@/src/types/student';
import { SubjectBreakdown } from './SubjectBreakdown';
import { cn } from '@/lib/utils';

interface ResultsPreviewProps {
    students: StudentRecord[];
    maxRows?: number;
}

type SortField = 'seatNumber' | 'name' | 'totalMarks' | 'sgpa' | 'totalKT' | 'result';
type SortDirection = 'asc' | 'desc';

export function ResultsPreview({ students, maxRows = 50 }: ResultsPreviewProps) {
    const [sortField, setSortField] = useState<SortField>('seatNumber');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

    // Filter and sort students
    const displayedStudents = useMemo(() => {
        let filtered = students;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = students.filter(s =>
                s.seatNumber.includes(query) ||
                s.name.toLowerCase().includes(query) ||
                s.ern?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'seatNumber':
                    comparison = a.seatNumber.localeCompare(b.seatNumber);
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'totalMarks':
                    comparison = a.totalMarks - b.totalMarks;
                    break;
                case 'sgpa':
                    comparison = a.sgpa - b.sgpa;
                    break;
                case 'totalKT':
                    comparison = a.kt.totalKT - b.kt.totalKT;
                    break;
                case 'result':
                    comparison = a.result.localeCompare(b.result);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        // Limit rows if not showing all
        return showAll ? sorted : sorted.slice(0, maxRows);
    }, [students, sortField, sortDirection, searchQuery, showAll, maxRows]);

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <div className="h-3 w-3" />; // Placeholder to prevent layout shift
        return sortDirection === 'asc'
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />;
    };

    const SortableHeader = ({ field, label, align = 'left' }: { field: SortField, label: string, align?: 'left' | 'center' | 'right' }) => (
        <th className={cn(
            "group sticky top-0 z-10 whitespace-nowrap bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted/80 hover:text-foreground",
            align === 'left' && "text-left",
            align === 'center' && "text-center",
            align === 'right' && "text-right"
        )}>
            <button
                onClick={() => handleSort(field)}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/20",
                    align === 'center' && "justify-center",
                    align === 'right' && "justify-end ml-auto"
                )}
            >
                {label}
                <span className={cn("text-muted-foreground/50 transition-colors group-hover:text-primary", sortField === field && "text-primary")}>
                    <SortIcon field={field} />
                </span>
            </button>
        </th>
    );

    return (
        <div className="space-y-6">
            {/* Subject Breakdown Modal */}
            {selectedStudent && (
                <SubjectBreakdown
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search student, seat no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 sm:w-80 transition-all duration-200"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                    <span className="font-semibold text-foreground">{searchQuery ? displayedStudents.length : students.length}</span> students found
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
                <div className="max-h-[650px] overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/30">
                            <tr>
                                <SortableHeader field="seatNumber" label="Seat No" />
                                <SortableHeader field="name" label="Student Name" />
                                <SortableHeader field="totalMarks" label="Marks" align="center" />
                                <SortableHeader field="sgpa" label="SGPA" align="center" />
                                <SortableHeader field="totalKT" label="KT Count" align="center" />
                                <SortableHeader field="result" label="Status" align="center" />
                                <th className="sticky top-0 z-10 whitespace-nowrap bg-muted/50 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {displayedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/30" />
                                            <p>No students found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedStudents.map((student, idx) => (
                                    <tr
                                        key={student.seatNumber}
                                        className="group transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            {student.seatNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base max-w-[280px] truncate" title={student.name}>
                                                {student.name || <span className="text-muted-foreground italic">Unknown</span>}
                                            </div>
                                            {student.ern && (
                                                <div className="text-xs text-muted-foreground font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {student.ern}
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center tabular-nums">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-base">{student.totalMarks}</span>
                                                <span className="text-muted-foreground text-[10px] uppercase font-medium tracking-wide">of {student.maxMarks}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center tabular-nums">
                                            <span className="font-bold text-foreground text-base">
                                                {student.sgpa.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            {student.kt.totalKT > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/30 shadow-sm">
                                                    {student.kt.totalKT} Subject{student.kt.totalKT > 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/30 text-xs font-medium">—</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset shadow-sm',
                                                    student.result === 'PASS'
                                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/30'
                                                        : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-500/30'
                                                )}
                                            >
                                                {student.result === 'PASS' ? (
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                ) : (
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                )}
                                                {student.result === 'PASS' ? 'Pass' : 'Fail'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedStudent(student)}
                                                className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View Details</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {students.length > maxRows && !showAll && !searchQuery && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(true)}
                        className="rounded-full px-8 py-5 h-auto text-sm border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors shadow-sm"
                    >
                        Show all {students.length} students
                    </Button>
                </div>
            )}
        </div>
    );
}
