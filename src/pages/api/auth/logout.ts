import type { APIRoute } from 'astro';
import { clearDashboardSession } from '../../../lib/server/leadAuth';
import { isSameOrigin, jsonResponse } from '../../../lib/server/http';

export const prerender = false;

export const POST: APIRoute = ({ request, cookies }) => {
  if (!isSameOrigin(request)) return jsonResponse({ error: 'Permintaan tidak sah.' }, 403);
  clearDashboardSession(cookies);
  return jsonResponse({ ok: true });
};
