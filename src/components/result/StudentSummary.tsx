'use client';

/**
 * StudentSummary - Display student information and academic summary
 */

import { User, GraduationCap, Building2, Hash, Trophy, TrendingUp, Star, Award, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentRecord } from '@/src/types/student';

interface StudentSummaryProps {
    student: StudentRecord;
}

export function StudentSummary({ student }: StudentSummaryProps) {
    const isPassed = student.result === 'PASS';

    return (
        <div className="space-y-6">
            {/* Result Status Banner */}
            <div
                className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${isPassed
                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
                    : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20'
                    }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32 transform rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className={`p-3 rounded-full mb-3 ${isPassed ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                        <Trophy className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-1">Result Status</h3>
                    <span
                        className={`text-4xl sm:text-5xl font-black tracking-tight ${isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                            }`}
                    >
                        {student.result}
                    </span>
                    {student.sgpa > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 border backdrop-blur-sm">
                            <span className="text-muted-foreground text-sm font-medium">SGPA</span>
                            <span className="font-bold text-lg text-foreground">{student.sgpa.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Info Card */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="pb-4 border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-primary" />
                        Student Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InfoItem
                            icon={<User className="h-4 w-4" />}
                            label="Name"
                            value={student.name}
                            className="lg:col-span-2"
                        />
                        <InfoItem
                            icon={<Hash className="h-4 w-4" />}
                            label="Seat Number"
                            value={student.seatNumber}
                        />
                        <InfoItem
                            icon={<GraduationCap className="h-4 w-4" />}
                            label="Gender"
                            value={student.gender || 'N/A'}
                        />
                        <InfoItem
                            icon={<Building2 className="h-4 w-4" />}
                            label="College"
                            value={student.college}
                            className="lg:col-span-3"
                        />
                        <InfoItem
                            icon={<TrendingUp className="h-4 w-4" />}
                            label="Status"
                            value={student.status}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Academic Summary Widget Area */}
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-primary" />
                    Performance Overview
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Marks Widget */}
                    <StatWidget
                        label="Total Marks"
                        value={`${student.totalMarks}`}
                        subValue={`/ ${student.maxMarks}`}
                        subHeading={`${((student.totalMarks / student.maxMarks) * 100).toFixed(1)}%`}
                        icon={<BookOpen className="h-5 w-5" />}
                        color="indigo"
                    />

                    {/* SGPA Widget */}
                    <StatWidget
                        label="SGPA"
                        value={student.sgpa > 0 ? student.sgpa.toFixed(2) : 'N/A'}
                        subHeading="Semester Grade"
                        icon={<Star className="h-5 w-5" />}
                        color="purple"
                    />

                    {/* Credits Widget */}
                    <StatWidget
                        label="Credits"
                        value={student.totalCredits.toString()}
                        subHeading={`Points: ${student.totalCreditPoints}`}
                        icon={<Award className="h-5 w-5" />}
                        color="blue"
                    />

                    {/* KT Widget */}
                    <StatWidget
                        label="Total KT"
                        value={student.kt.totalKT.toString()}
                        subHeading={student.kt.totalKT === 0 ? "All Clear" : "Subjects Failed"}
                        icon={<AlertTriangle className="h-5 w-5" />}
                        color={student.kt.totalKT > 0 ? "red" : "emerald"}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * High visibility stat widget inspired by uploaded designs
 */
interface StatWidgetProps {
    label: string;
    value: string;
    subValue?: string;
    subHeading?: string;
    icon: React.ReactNode;
    color: 'indigo' | 'purple' | 'blue' | 'red' | 'emerald';
}

function StatWidget({ label, value, subValue, subHeading, icon, color }: StatWidgetProps) {
    const colorStyles = {
        indigo: 'bg-zinc-50 border-zinc-200 text-zinc-900',
        purple: 'bg-zinc-100 border-zinc-200 text-zinc-900', // Changed to Grey
        blue: 'bg-blue-50 border-blue-100 text-blue-900',
        red: 'bg-red-50 border-red-100 text-red-900',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    };

    const iconStyles = {
        indigo: 'bg-zinc-100 text-zinc-700',
        purple: 'bg-zinc-200 text-zinc-700', // Changed to Grey
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    // Dark mode overrides could be added here if needed, keeping it light/custom for the "card" look

    return (
        <div className={`relative p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] ${colorStyles[color]}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium opacity-70">{label}</span>
                <div className={`p-2 rounded-xl ${iconStyles[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
                {subValue && <span className="text-lg font-medium opacity-60">{subValue}</span>}
            </div>
            {subHeading && (
                <p className="text-xs font-medium mt-1 opacity-70 bg-white/50 inline-block px-1.5 py-0.5 rounded">
                    {subHeading}
                </p>
            )}
        </div>
    );
}

// ... InfoItem component remains same ...
interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    className?: string;
}

function InfoItem({ icon, label, value, className = '' }: InfoItemProps) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="mt-1 p-2 rounded-lg bg-primary/5 text-primary">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="font-semibold text-sm sm:text-base truncate">{value}</p>
            </div>
        </div>
    );
}
