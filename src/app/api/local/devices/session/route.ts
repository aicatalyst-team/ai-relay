// ============================================================
// AI Relay API — Local Device Session (Device Code Flow)
// ============================================================

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // TODO: Implement device code flow
  const deviceCode = `DC_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const verificationUrl = `${new URL(request.url).origin}/admin/local-relay/verify`;

  return Response.json({
    device_code: deviceCode,
    verification_url: verificationUrl,
    expires_in: 600,
  });
}
