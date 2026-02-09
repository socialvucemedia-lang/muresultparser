'use client';

/**
 * ResultAnalysis - KT analysis breakdown component
 */

import { AlertTriangle, CheckCircle2, XCircle, BookOpen, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { KTResult } from '@/src/types/student';

interface ResultAnalysisProps {
    kt: KTResult;
}

export function ResultAnalysis({ kt }: ResultAnalysisProps) {
    const hasNoKT = kt.totalKT === 0;

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4 border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    KT Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {hasNoKT ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4 animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                            All Clear!
                        </h3>
                        <p className="text-emerald-700 dark:text-emerald-400 max-w-sm">
                            Congratulations! You have successfully passed all subjects in this semester.
                            Keep up the great work! 🎉
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* KT Summary Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KTStatWidget
                                label="Total KTs"
                                value={kt.totalKT}
                                icon={<AlertTriangle className="h-5 w-5" />}
                                color="red"
                                main
                            />
                            <KTStatWidget
                                label="Internal"
                                value={kt.internalKT}
                                icon={<Activity className="h-4 w-4" />}
                                color="orange"
                            />
                            <KTStatWidget
                                label="External"
                                value={kt.externalKT}
                                icon={<FileText className="h-4 w-4" />}
                                color="orange"
                            />
                            <KTStatWidget
                                label="Term Work"
                                value={kt.termWorkKT}
                                icon={<BookOpen className="h-4 w-4" />}
                                color="orange"
                            />
                        </div>

                        {kt.oralKT > 0 && (
                            <div className="flex items-center gap-2 text-sm px-4 py-2 bg-muted/30 rounded-lg border border-border/50">
                                <span className="font-medium text-muted-foreground">Oral/Practical KTs:</span>
                                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-bold">{kt.oralKT}</Badge>
                            </div>
                        )}

                        <Separator className="bg-border/50" />

                        {/* Failed Subjects List */}
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Subjects to Clear ({kt.failedSubjects.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {kt.failedSubjects.map((subject) => (
                                    <div
                                        key={subject}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        {subject}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Motivational Message */}
                        <div className="mt-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/50 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                                    Note from Team
                                </h4>
                                <blockquote className="text-amber-800/90 dark:text-amber-200/90 italic border-l-4 border-amber-500/30 pl-3 py-1 mb-3">
                                    "{getMotivationalQuote()}"
                                </blockquote>
                                <p className="text-xs font-medium text-amber-700/70 dark:text-amber-300/60">
                                    Remember: A single exam does not define your potential found in engineering.
                                </p>
                            </div>

                            {/* Decorative background icon */}
                            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
                                <Activity className="h-32 w-32" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
function getMotivationalQuote() {
    const quotes = [
        "KT aayi hai, zindagi khatam nahi hui bhai. Next attempt tera hi hai.",
        "Engineer wahi jo gir ke bole chal phir se try karte hain.",
        "Backlog temporary hai, comeback permanent hoga.",
        "Paper fail hua hai, tu nahi.",
        "KT life ka tutorial level hai, boss fight abhi baaki hai.",
        "Aaj KT hai, kal placement story hogi.",
        "Stress kam, attempt zyada. Clear ho hi jaayega.",
        "Engineer ka asli power last moment comeback.",
        "KT se darna nahi, usko clear karke legend banna hai.",
        "System fail nahi, bas retry chal raha hai."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

interface KTStatWidgetProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'red' | 'orange';
    main?: boolean;
}

function KTStatWidget({ label, value, icon, color, main }: KTStatWidgetProps) {
    const colorStyles = {
        red: 'bg-red-50 border-red-100 text-red-900',
        orange: 'bg-orange-50 border-orange-100 text-orange-900',
    };

    const iconStyles = {
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div
            className={`
                relative p-4 rounded-xl border transition-all
                ${value > 0 ? (color === 'red' ? colorStyles.red : colorStyles.orange) : 'bg-muted/30 border-border/50 text-muted-foreground opacity-70'}
                ${main && value > 0 ? 'ring-2 ring-red-500/20 shadow-sm' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
                <div className={`p-1.5 rounded-lg ${value > 0 ? (color === 'red' ? iconStyles.red : iconStyles.orange) : 'bg-muted text-muted-foreground'}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`font-bold tracking-tight ${main ? 'text-3xl' : 'text-2xl'}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}
