'use client';

/**
 * Summary panel component showing analysis statistics
 */

import { Users, CheckCircle, XCircle, AlertTriangle, TrendingUp, Award, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { AnalysisSummary } from '@/src/types/student';
import { cn } from '@/lib/utils';

interface SummaryPanelProps {
    analysis: AnalysisSummary;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary';
}

function StatCard({ title, value, icon, subtitle, variant = 'default' }: StatCardProps) {
    const variantStyles = {
        default: 'bg-card border-border/50 text-card-foreground',
        success: 'bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/50',
        danger: 'bg-rose-50/50 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/50',
        warning: 'bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/50',
        primary: 'bg-primary/5 border-primary/20 text-primary',
    };

    const iconStyles = {
        default: 'bg-secondary text-secondary-foreground',
        success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
        danger: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
        warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
        primary: 'bg-primary/10 text-primary',
    };

    return (
        <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-md border shadow-sm', variantStyles[variant])}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                        </div>
                        {subtitle && (
                            <p className="text-xs font-medium opacity-80">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn('rounded-xl p-2.5 shadow-sm ring-1 ring-inset ring-black/5', iconStyles[variant])}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SummaryPanel({ analysis }: SummaryPanelProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Students"
                    value={analysis.totalStudents}
                    icon={<Users className="h-5 w-5" />}
                    subtitle="Processed records"
                    variant="primary"
                />
                <StatCard
                    title="Passed"
                    value={analysis.passedCount}
                    subtitle={`${analysis.passPercentage}% pass rate`}
                    icon={<CheckCircle className="h-5 w-5" />}
                    variant="success"
                />
                <StatCard
                    title="Failed"
                    value={analysis.failedCount}
                    subtitle={`${(100 - analysis.passPercentage).toFixed(1)}% fail rate`}
                    icon={<XCircle className="h-5 w-5" />}
                    variant="danger"
                />
                <StatCard
                    title="Students with KT"
                    value={analysis.studentsWithKT}
                    subtitle={`Avg ${analysis.averageKTPerStudent.toFixed(1)} KT/student`}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant="warning"
                />
            </div>

            {/* Marks Stats */}
            <div className="rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-muted/40 px-6 py-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Marks Analysis
                    </h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
                    <div className="p-6 text-center transition-colors hover:bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                            {analysis.highestMarks}
                        </p>
                    </div>
                    <div className="p-6 text-center transition-colors hover:bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                            {analysis.lowestMarks}
                        </p>
                    </div>
                    <div className="p-6 text-center transition-colors hover:bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight">{analysis.averageMarks}</p>
                    </div>
                    <div className="p-6 text-center transition-colors hover:bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground">Average SGPA</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-primary">
                            {analysis.averageSGPA.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Marks Distribution */}
                <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="h-4 w-4 text-primary" />
                            Performance Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <DistributionBar
                                label="Distinction (≥75%)"
                                value={analysis.marksDistribution.distinction}
                                total={analysis.totalStudents}
                                color="bg-violet-500"
                            />
                            <DistributionBar
                                label="First Class (≥60%)"
                                value={analysis.marksDistribution.firstClass}
                                total={analysis.totalStudents}
                                color="bg-indigo-500"
                            />
                            <DistributionBar
                                label="Second Class (≥50%)"
                                value={analysis.marksDistribution.secondClass}
                                total={analysis.totalStudents}
                                color="bg-sky-500"
                            />
                            <DistributionBar
                                label="Pass Class (≥40%)"
                                value={analysis.marksDistribution.passClass}
                                total={analysis.totalStudents}
                                color="bg-emerald-500"
                            />
                            <DistributionBar
                                label="Fail (<40%)"
                                value={analysis.marksDistribution.fail}
                                total={analysis.totalStudents}
                                color="bg-rose-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* KT Distribution */}
                <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart2 className="h-4 w-4 text-primary" />
                            KT Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <DistributionBar
                                label="All Clear (No KT)"
                                value={analysis.ktDistribution.noKT}
                                total={analysis.totalStudents}
                                color="bg-emerald-500"
                            />
                            <DistributionBar
                                label="1 KT Subject"
                                value={analysis.ktDistribution.oneKT}
                                total={analysis.totalStudents}
                                color="bg-amber-400"
                            />
                            <DistributionBar
                                label="2 KT Subjects"
                                value={analysis.ktDistribution.twoKT}
                                total={analysis.totalStudents}
                                color="bg-orange-500"
                            />
                            <DistributionBar
                                label="3+ KT Subjects"
                                value={analysis.ktDistribution.threeOrMoreKT}
                                total={analysis.totalStudents}
                                color="bg-rose-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface DistributionBarProps {
    label: string;
    value: number;
    total: number;
    color: string;
}

function DistributionBar({ label, value, total, color }: DistributionBarProps) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="group space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground/80">{label}</span>
                <span className="font-mono text-muted-foreground">
                    {value} <span className="opacity-50">/</span> {percentage.toFixed(1)}%
                </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110', color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
