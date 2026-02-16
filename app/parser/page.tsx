'use client';

/**
 * Main PDF Parser page
 */

import { FileText, GraduationCap, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParser } from '@/src/hooks/useParser';
import { UploadZone } from '@/src/components/UploadZone';
import { ParserProgress } from '@/src/components/ParserProgress';
import { ParserControls } from '@/src/components/ParserControls';
import { ResultsPreview } from '@/src/components/ResultsPreview';
import { SummaryPanel } from '@/src/components/SummaryPanel';
import { JsonExportButton } from '@/src/components/JsonExportButton';
import { ExportButton } from '@/src/components/ExportButton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PdfParserPage() {
    const {
        file,
        fileInfo,
        isLoading,
        isParsing,
        progress,
        students,
        analysis,
        error,
        setFile,
        startParsing,
        cancelParsing,
        reset,
    } = useParser();

    const hasResults = students.length > 0;
    const canParse = file !== null && !isParsing && !hasResults;
    const canReset = file !== null || hasResults;

    return (
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[background:radial-gradient(#1f2937_1px,transparent_1px)]"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors" title="Back to Home">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-semibold tracking-tight text-foreground">Mumbai University Result's Parser</h1>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Result Analysis Tool</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasResults && (
                            <>
                                <JsonExportButton students={students} />
                                <ExportButton students={students} analysis={analysis} />
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-10">

                    {/* Hero / Upload Section */}
                    {!hasResults && !isParsing && (
                        <section className="flex flex-col items-center justify-center space-y-8 py-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-4 max-w-2xl">
                                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                    Parse University Results Instantly
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Upload your PDF gazette to extract student marks, analyze performance, and detect ATKTs automatically.
                                </p>
                            </div>

                            <div className="w-full max-w-xl transition-all duration-300 ease-in-out hover:scale-[1.01]">
                                <div className="rounded-2xl border bg-card p-1 shadow-sm ring-1 ring-inset ring-border/50">
                                    <UploadZone
                                        onFileSelect={(f) => setFile(f)}
                                        file={file}
                                        fileInfo={fileInfo}
                                        isLoading={isLoading}
                                        error={error}
                                        onClear={reset}
                                        disabled={isParsing}
                                    />
                                </div>
                            </div>

                            {file && (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <ParserControls
                                        onParse={startParsing}
                                        onReset={reset}
                                        canParse={canParse}
                                        canReset={canReset}
                                        isParsing={isParsing}
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    {/* Progress Section */}
                    {isParsing && progress && (
                        <section className="mx-auto w-full max-w-xl py-20 animate-in fade-in zoom-in-95 duration-500">
                            <div className="rounded-2xl border bg-card/50 px-8 py-10 shadow-lg backdrop-blur-sm ring-1 ring-primary/10">
                                <ParserProgress progress={progress} onCancel={cancelParsing} />
                            </div>
                        </section>
                    )}

                    {/* Error Alert */}
                    {error && !isParsing && (
                        <div className="mx-auto w-full max-w-xl animate-in shake duration-300">
                            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 text-destructive-foreground shadow-sm">
                                <AlertTitle className="font-semibold tracking-tight text-destructive">Parsing Error</AlertTitle>
                                <AlertDescription className="text-destructive/90">{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Results Section */}
                    {hasResults && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Summary */}
                            {analysis && (
                                <section>
                                    <SummaryPanel analysis={analysis} />
                                </section>
                            )}

                            {/* Results Table */}
                            <section className="rounded-2xl border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
                                <div className="border-b bg-muted/30 px-6 py-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">Student Records</h3>
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                        {students.length} Students
                                    </span>
                                </div>
                                <ResultsPreview students={students} maxRows={100} />
                            </section>

                            {/* Reset Button */}
                            <section className="flex justify-center pb-12">
                                <ParserControls
                                    onParse={startParsing}
                                    onReset={reset}
                                    canParse={false}
                                    canReset={canReset}
                                    isParsing={isParsing}
                                />
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t bg-muted/30 py-12 backdrop-blur-sm">
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex flex-col items-center gap-2 sm:items-start">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <span className="font-semibold tracking-tight text-foreground">Mumbai University Result's Parser</span>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Made by students of <span className="font-semibold text-foreground">RGIT</span> with love <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                            </p>
                        </div>

                        <nav className="flex items-center gap-8">
                            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                About Us
                            </Link>
                            <Link href="/terms" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                Terms & Conditions
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-8 border-t border-border/40 pt-8 text-center sm:text-left">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} RGIT Academic Tools. This tool processes all data locally in your browser.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
