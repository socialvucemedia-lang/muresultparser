'use client';

import Link from 'next/link';
import { GraduationCap, ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
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
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Contact Us</span>
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
                <div className="space-y-12">
                    {/* Hero Section */}
                    <section className="text-center space-y-6">
                        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Get in Touch
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            have questions, feedback, or need assistance? We're here to help!
                        </p>
                    </section>

                    {/* Contact Info Card */}
                    <div className="max-w-md mx-auto">
                        <Card className="border bg-card/50 shadow-lg backdrop-blur-sm overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-primary/80 to-primary/20" />
                            <CardContent className="p-8 space-y-8">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 animate-in zoom-in duration-500">
                                        <Mail className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Email Us</h3>
                                    <p className="text-muted-foreground text-sm">
                                        The best way to reach us is via email. We typically respond within 24 hours.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href="mailto:vedant@vuce.in"
                                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-background p-2 rounded-lg shadow-sm group-hover:shadow transition-shadow">
                                                <Send className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-muted-foreground">Main Contact</span>
                                                <span className="font-semibold text-foreground">vedant@vuce.in</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQ / Additional Info Section */}
                    <section className="text-center space-y-6 pt-8 border-t border-dashed">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-muted/50 text-muted-foreground mb-4">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            <span className="font-medium">Common Questions</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">Found a bug?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Please include screenshots and details about the issue you encountered. This helps us fix it faster!
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">Feature Request?</h4>
                                <p className="text-sm text-muted-foreground">
                                    We love hearing new ideas! Let us know what features would make your academic life easier.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <footer className="mt-20 border-t bg-muted/30 py-12">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} RGIT Academic Tools. Proudly developed by the 2026 Batch.
                    </p>
                </div>
            </footer>
        </div>
    );
}
