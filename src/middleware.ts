// ============================================================
// AI API Relay — Middleware
// Handles CORS for all API routes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

/** Allowed origins (restrict in production if needed) */
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['*'];

/** CORS headers to add to all responses */
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  const isAllowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);

  // Handle CORS preflight (OPTIONS request)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0] || '*',
      },
    });
  }

  // Continue with the request and add CORS headers to response
  const response = NextResponse.next();

  if (isAllowed) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

// Match all API and v1 routes
export const config = {
  matcher: [
    '/api/:path*',
    '/v1/:path*',
    '/health',
  ],
};
