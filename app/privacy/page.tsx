import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                            <p className="text-sm text-muted-foreground mt-1">How we handle your data</p>
                        </div>
                    </div>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                        <section className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Privacy-First Approach</h2>
                            <p className="text-muted-foreground">
                                The Mumbai University Result's Parser is designed with your privacy in mind.
                                We do not collect, store, or transmit any personal information or PDF files to our servers.
                            </p>
                        </section>

                        <section className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">How Your Data is Processed</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>All PDF parsing happens through our secure API service</li>
                                <li>PDF files are temporarily processed and immediately deleted</li>
                                <li>No student data is stored permanently on our servers</li>
                                <li>Results are displayed directly in your browser</li>
                            </ul>
                        </section>

                        <section className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Data We Don't Collect</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Personal information (names, ERNs, contact details)</li>
                                <li>Academic records or marks</li>
                                <li>PDF files after processing</li>
                                <li>Search history or browsing patterns</li>
                            </ul>
                        </section>

                        <section className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
                            <p className="text-muted-foreground">
                                This application is hosted on Vercel and may use standard analytics for monitoring
                                performance and uptime. No personal data is shared with third parties.
                            </p>
                        </section>

                        <section className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Contact</h2>
                            <p className="text-muted-foreground">
                                If you have any questions about our privacy policy, please refer to our{' '}
                                <Link href="/about" className="text-primary hover:underline">About page</Link>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
