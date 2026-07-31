import type { APIRoute } from 'astro';
import { authenticateDashboardUser, setDashboardSession } from '../../../lib/server/leadAuth';
import { isSameOrigin, jsonResponse, readJsonBody } from '../../../lib/server/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOrigin(request)) return jsonResponse({ error: 'Permintaan tidak sah.' }, 403);

  try {
    const body = await readJsonBody(request, 4_000) as Record<string, unknown>;
    const user = authenticateDashboardUser(body?.username, body?.password);
    if (!user) return jsonResponse({ error: 'Nama pengguna atau kata laluan tidak sah.' }, 401);

    setDashboardSession(cookies, user, new URL(request.url).protocol === 'https:');
    return jsonResponse({ user });
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse({ error: 'Maklumat log masuk terlalu besar.' }, 413);
    console.error('Dashboard login failed:', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse({ error: 'Log masuk belum dikonfigurasi atau tidak tersedia.' }, 503);
  }
};
