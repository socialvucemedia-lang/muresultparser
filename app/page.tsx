'use client';

/**
 * Student Result Lookup Page
 * Allows students to search their results by ERN
 */

import { GraduationCap, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { useResultLookup } from '@/src/hooks/useResultLookup';
import { ERNSearch } from '@/src/components/result/ERNSearch';
import { StudentSummary } from '@/src/components/result/StudentSummary';
import { SubjectsTable } from '@/src/components/result/SubjectsTable';
import { ResultAnalysis } from '@/src/components/result/ResultAnalysis';
import { ShareResult } from '@/src/components/result/ShareResult';
import { ExportResult } from '@/src/components/result/ExportResult';

export default function ResultPage() {
  const {
    isLoading,
    error,
    student,
    searched,
    search,
    reset,
  } = useResultLookup();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">MU Result</span>
            </Link>
            <nav>
              <Link
                href="/parser"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
              >
                PDF Parser For College's
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 border border-zinc-200 mb-6 shadow-inner">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-foreground">
            Check Your Results
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Instant access to your academic performance. Enter your ERN below to see detailed subject marks and analysis.
          </p>
        </section>

        {/* Search Section */}
        <section className="mb-12 relative z-20">
          <ERNSearch
            onSearch={search}
            onReset={reset}
            isLoading={isLoading}
            hasResult={searched}
          />
        </section>

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="max-w-xl mx-auto mb-8 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Results Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {student && !isLoading && (
          <section className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border backdrop-blur-sm shadow-sm">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Hello, {student.name.split(' ')[0]}!
                </h2>
                <p className="text-sm text-muted-foreground">Here is your result summary.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <ShareResult student={student} />
                </div>

              </div>
            </div>

            {/* Student Summary */}
            <StudentSummary student={student} />

            {/* KT Analysis */}
            <ResultAnalysis kt={student.kt} />

            {/* Subjects Table */}
            <SubjectsTable subjects={student.subjects} />

            {/* Footer Note */}
            <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-dashed border-2 shadow-none">
              <CardContent className="py-6 text-center text-sm text-muted-foreground/80">
                <p>
                  Results are sourced from official university data.
                  For any discrepancies, please contact your college administration.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Initial State (no search yet) */}
        {!searched && !isLoading && (
          <section className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 delay-200">
            <Card className="bg-gradient-to-br from-card to-muted/30 border-dashed border-2 shadow-none">
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6 shadow-inner ring-4 ring-background">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Ready to Search
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  Enter your ERN number above to instantly view your complete semester
                  results including subject-wise marks and KT analysis.
                </p>

                {/* Sample ERNs for testing */}

              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 relative z-10 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex justify-center items-center gap-6 mb-4 text-sm font-medium text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">About Project</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Built with ❤️ by RGIT Students for the Community.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Loading skeleton state
 */
function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Separator />

      {/* Result Banner Skeleton */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Info Card Skeleton */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Skeleton */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
