'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-semibold tracking-tight text-foreground">Mumbai University Result's Parser</h1>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Terms & Conditions</span>
                        </div>
                    </Link>

                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Parser
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">Terms of Use</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </section>

                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <ShieldCheck className="h-6 w-6" />
                                <h3 className="text-xl font-bold text-foreground m-0">Data Privacy & Security</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                The Mumbai University Result's Parser is built with a <strong>privacy-first</strong> approach. All PDF file processing, text extraction, and data analysis happen exclusively within your web browser. No data is uploaded to any server, and no information is stored after you close or refresh the page.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <AlertCircle className="h-6 w-6" />
                                <h3 className="text-xl font-bold text-foreground m-0">Technical Accuracy</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                While we strive for 100% accuracy, PDF parsing is inherently complex due to the varying layouts of official university gazettes. Users should treat the extracted data as a reference and cross-verify any critical information with the official PDF document provided by the university.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <Scale className="h-6 w-6" />
                                <h3 className="text-xl font-bold text-foreground m-0">Usage Limitations</h3>
                            </div>
                            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                                <li>This tool is provided "as is" for academic and informational purposes only.</li>
                                <li>The developers are not responsible for any inaccuracies resulting from malformed PDF source files.</li>
                                <li>Users are responsible for ensuring they have the right to process the academic records they upload.</li>
                            </ul>
                        </section>
                    </div>

                    <section className="rounded-2xl border bg-card/50 p-6 shadow-sm ring-1 ring-border/50">
                        <p className="text-sm text-center text-muted-foreground">
                            By using this tool, you acknowledge that you have read and understood these terms. This tool is owned by vuce & is a property of vuce.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="mt-20 border-t bg-muted/30 py-12">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} vuce. This tool is owned by vuce & is a property of vuce.
                    </p>
                </div>
            </footer>
        </div>
    );
}
