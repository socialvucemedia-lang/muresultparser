'use client';

/**
 * Upload zone component with drag & drop support
 */

import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    file: File | null;
    fileInfo: { pageCount: number; fileName: string } | null;
    isLoading: boolean;
    error: string | null;
    onClear: () => void;
    disabled?: boolean;
}

export function UploadZone({
    onFileSelect,
    file,
    fileInfo,
    isLoading,
    error,
    onClear,
    disabled = false,
}: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        const pdfFile = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

        if (pdfFile) {
            onFileSelect(pdfFile);
        }
    }, [onFileSelect, disabled]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            inputRef.current?.click();
        }
    }, [disabled]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Show file info when loaded
    if (file && fileInfo && !error) {
        return (
            <div className="rounded-xl border bg-card p-1 shadow-sm ring-1 ring-border/50">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{fileInfo.fileName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {formatFileSize(file.size)} • {fileInfo.pageCount} pages
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        disabled={disabled}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out',
                isDragging && !disabled
                    ? 'border-primary bg-primary/5 scale-[1.01] shadow-md ring-4 ring-primary/10'
                    : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30',
                disabled && 'cursor-not-allowed opacity-60 bg-muted/20',
                error && 'border-destructive/30 bg-destructive/5'
            )}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
            />

            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analyzing PDF structure...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-destructive/10 p-3 ring-1 ring-destructive/20">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-destructive">Upload Failed</p>
                            <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 border-destructive/20 hover:border-destructive/40 text-destructive hover:bg-destructive/5">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:-translate-y-1">
                        <div className={cn(
                            "rounded-full p-4 transition-colors duration-300 mt-2",
                            isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            <Upload className="h-8 w-8" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-lg font-semibold text-foreground">
                                {isDragging ? 'Drop PDF to upload' : 'Click to add result PDF'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or drag and drop file here
                            </p>
                        </div>
                        <div className="mt-2 rounded-full border border-border bg-background/50 px-3 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                            PDF up to 50MB
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
