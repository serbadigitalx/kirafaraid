import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { jsonResponse } from '../../lib/server/http';
import { LeadStoreConfigurationError, supabaseRest } from '../../lib/server/supabaseRest';

export const prerender = false;

const matchesCronSecret = (header: string | null, secret: string) => {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header || '');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

// Also the keep-alive target for the daily Vercel cron: any REST request counts as
// project activity, which is what stops the free tier auto-pausing.
export const GET: APIRoute = async ({ request }) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && !matchesCronSecret(request.headers.get('authorization'), cronSecret)) {
    return jsonResponse({ error: 'Permintaan tidak sah.' }, 401);
  }

  try {
    await supabaseRest('leads?select=id&limit=1');
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error instanceof Error ? error.message : 'unknown error');
    const reason = error instanceof LeadStoreConfigurationError ? 'not_configured' : 'unreachable';
    return jsonResponse({ ok: false, reason }, 503);
  }
};
