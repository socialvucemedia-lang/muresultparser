'use client';

/**
 * Parser progress indicator component
 */

import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import type { ParserProgress as ProgressType } from '@/src/types/student';

interface ParserProgressProps {
    progress: ProgressType;
    onCancel: () => void;
}

export function ParserProgress({ progress, onCancel }: ParserProgressProps) {
    const percentage = progress.totalPages > 0
        ? Math.round((progress.currentPage / progress.totalPages) * 100)
        : 0;

    const statusMessages: Record<string, string> = {
        loading: 'Preparing document...',
        extracting: 'Uploading PDF to parser...',
        parsing: 'Processing document...',
        analyzing: 'Waiting for results...',
        complete: 'Processing complete!',
        error: 'Processing failed',
        cancelled: 'Operation cancelled',
    };

    const isActive = ['loading', 'extracting', 'parsing', 'analyzing'].includes(progress.status);

    return (
        <Card className="border-none bg-background/60 shadow-xl backdrop-blur-xl ring-1 ring-border/50">
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-inset ring-primary/20">
                                {isActive ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                )}
                                {isActive && (
                                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold leading-none tracking-tight">
                                    {statusMessages[progress.status] || 'Processing...'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1.5">
                                    {progress.totalPages > 0
                                        ? `Page ${progress.currentPage} of ${progress.totalPages}`
                                        : 'Initializing...'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold tabular-nums tracking-tight text-primary">
                                {percentage}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress value={percentage} className="h-3 bg-secondary" />
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {progress.studentsFound} students extracted
                            </div>
                            {isActive && (
                                <button
                                    onClick={onCancel}
                                    className="text-destructive hover:text-destructive/80 hover:underline transition-all"
                                >
                                    Cancel Operation
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
