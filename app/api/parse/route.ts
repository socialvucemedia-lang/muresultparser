/**
 * API route for PDF parsing
 * Proxies the PDF file to the FastAPI service and returns parsed results
 */

import { NextRequest, NextResponse } from 'next/server';

const PARSER_API_URL = process.env.PARSER_API_URL || process.env.NEXT_PUBLIC_PARSER_API_URL;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        // Forward to FastAPI service
        const apiFormData = new FormData();
        apiFormData.append('file', file);

        const response = await fetch(`${PARSER_API_URL}/parse`, {
            method: 'POST',
            body: apiFormData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Parser service error' }));
            return NextResponse.json(
                { error: errorData.detail || 'Parsing failed' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        // Check if parser service is unreachable
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { error: 'Parser service is not running. Please start the Python parser service.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
