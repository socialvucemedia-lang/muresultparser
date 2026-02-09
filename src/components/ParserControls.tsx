'use client';

/**
 * Parser controls component
 */

import { Play, RotateCcw, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ParserControlsProps {
    onParse: () => void;
    onReset: () => void;
    canParse: boolean;
    canReset: boolean;
    isParsing: boolean;
}

export function ParserControls({
    onParse,
    onReset,
    canParse,
    canReset,
    isParsing,
}: ParserControlsProps) {
    if (!canParse && !canReset && !isParsing) return null;

    return (
        <div className="flex w-full items-center justify-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Button
                size="lg"
                onClick={onParse}
                disabled={!canParse || isParsing}
                className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:shadow-none"
            >
                {isParsing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Parse Results
                    </>
                )}
            </Button>

            <Button
                variant="outline"
                size="lg"
                onClick={onReset}
                disabled={!canReset || isParsing}
                className="h-12 px-6 text-base border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground transition-colors"
            >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
            </Button>
        </div>
    );
}
