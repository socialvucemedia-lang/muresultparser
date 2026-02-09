'use client';

/**
 * JSON Export button component
 */

import { useState } from 'react';
import { Download, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentRecord } from '@/src/types/student';

interface JsonExportButtonProps {
    students: StudentRecord[];
    disabled?: boolean;
}

export function JsonExportButton({ students, disabled = false }: JsonExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (students.length === 0) return;

        setIsExporting(true);
        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 300));

            // Convert array to Record<ERN, StudentRecord> format
            const resultsMap: Record<string, StudentRecord> = {};
            students.forEach(student => {
                const key = student.ern || student.seatNumber; // Fallback to seat number if ERN missing
                if (key) {
                    resultsMap[key] = student;
                }
            });

            // Create JSON blob
            const jsonString = JSON.stringify(resultsMap, null, 4);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'results.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={disabled || students.length === 0 || isExporting}
            variant="outline"
            className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
            size="sm"
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileJson className="h-4 w-4" />
                    Download JSON
                </>
            )}
        </Button>
    );
}
