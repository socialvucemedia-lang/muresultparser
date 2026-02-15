/**
 * API route for PDF parsing
 * Proxies the PDF file to the FastAPI service and returns parsed results
 */

import { NextRequest, NextResponse } from 'next/server';

const PARSER_API_URL = process.env.PARSER_API_URL || process.env.NEXT_PUBLIC_PARSER_API_URL;

export async function POST(request: NextRequest) {
    try {
        // Transparently proxy the request to FastAPI
        // This preserves the original multipart boundary and headers from the browser
        const response = await fetch(`${PARSER_API_URL}/parse`, {
            method: 'POST',
            body: request.body,
            headers: {
                'content-type': request.headers.get('content-type') || '',
            },
            // @ts-ignore - Required for streaming bodies in Node.js fetch
            duplex: 'half',
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
