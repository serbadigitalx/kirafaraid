import type { APIRoute } from 'astro';
import { getDashboardSession } from '../../../lib/server/leadAuth';
import { jsonResponse } from '../../../lib/server/http';

export const prerender = false;

export const GET: APIRoute = ({ cookies }) => {
  const user = getDashboardSession(cookies);
  return user
    ? jsonResponse({ authenticated: true, user })
    : jsonResponse({ authenticated: false }, 401);
};
