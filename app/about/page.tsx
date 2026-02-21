'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft, Heart, Shield, Zap, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">About Us</span>
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

            <main className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="space-y-20">
                    {/* Hero Section */}
                    <section className="text-center space-y-6">
                        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Empowering Students & Faculty
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Mumbai University Result's Parser is owned by vuce & is a property of vuce. It was built to simplify result analysis and academic tracking through intelligent automation.
                        </p>
                    </section>

                    {/* Mission Section */}
                    <section className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-sm ring-1 ring-border/50 transition-all hover:shadow-md">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Extract SGPA, total marks, and detailed subject breakdowns in seconds from official university gazettes.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-sm ring-1 ring-border/50 transition-all hover:shadow-md">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Instant Detection</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Automatically identify ATKTs and performance trends across entire batches without manual data entry.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-sm ring-1 ring-border/50 transition-all hover:shadow-md">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All processing happens locally on your device. Your PDF files and extracted data never leave your browser.
                            </p>
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="space-y-12">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">The Development Team</h3>
                            <p className="text-muted-foreground">owned by vuce & is a property of vuce.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 max-w-2xl mx-auto">
                            {/* Chief Developer Card */}
                            <div className="rounded-3xl bg-primary/5 p-8 md:p-10 border border-primary/10 shadow-sm transition-all hover:bg-primary/10">
                                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                                        <User className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-bold text-foreground">Vedant Chalke</h4>
                                            <p className="text-sm font-bold uppercase tracking-widest text-primary mt-1">Chief Developer</p>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            The visionary behind these academic tools. Vedant is dedicated to building intelligent solutions for vuce, specializing in automation and full-stack development.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground italic">
                                While Vedant leads the development as the Chief Developer, several other talented individuals are involved in making this project a success.
                            </p>
                        </div>
                    </section>
                </div>
            </main >

            <footer className="mt-20 border-t bg-muted/30 py-12">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} vuce. This tool is owned by vuce & is a property of vuce.
                    </p>
                </div>
            </footer>
        </div >
    );
}
