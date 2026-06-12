// ============================================================
// AI Relay API — Device Management
// ============================================================

import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

// GET /api/local/devices - List devices
export async function GET() {
  const keys = await kv.keys('device:*');
  const devices = await Promise.all(
    keys.map(async (key) => {
      const data = await kv.hgetall(key);
      return { id: key.replace('device:', ''), ...data };
    })
  );

  return Response.json({ devices });
}
