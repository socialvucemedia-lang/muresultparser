'use client';

/**
 * ShareResult - WhatsApp share button component
 */

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentRecord } from '@/src/types/student';

interface ShareResultProps {
    student: StudentRecord;
}

export function ShareResult({ student }: ShareResultProps) {
    const handleShare = () => {
        const isPassed = student.result === 'PASS'; // 'PASS' check based on type definition
        const emoji = isPassed ? '🎉' : '💪';

        // KT Details
        let ktStatus = 'All Clear 🌟';
        if (student.kt.hasKT) {
            const subjectCount = student.kt.totalKT;
            ktStatus = `${subjectCount} KT${subjectCount > 1 ? 's' : ''} 📚`;
        }

        // URL (Use current window URL or a hardcoded one if preferred)
        const url = window.location.href;

        // Construct message
        const message =
            `*MU Result Update* ${emoji}\n\n` +
            `*Name:* ${student.name}\n` +
            `*Seat No:* ${student.seatNumber}\n` +
            `*SGPA:* ${student.sgpa > 0 ? student.sgpa.toFixed(2) : 'N/A'}\n` +
            `*Result:* ${student.result}\n` +
            `*KT Status:* ${ktStatus}\n\n` +
            `--------------------------------\n` +
            `I just checked my result here! 👇\n` +
            `${url}`;

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        // Open in new tab
        window.open(whatsappUrl, '_blank');
    };

    return (
        <Button
            onClick={handleShare}
            className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm transition-all hover:scale-105"
        >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
        </Button>
    );
}
