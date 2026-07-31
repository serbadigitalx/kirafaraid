import type { APIRoute } from 'astro';
import type { LeadActivity } from '../../../lib/leads';
import { getDashboardSession } from '../../../lib/server/leadAuth';
import { jsonResponse } from '../../../lib/server/http';
import { supabaseRest } from '../../../lib/server/supabaseRest';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!getDashboardSession(cookies)) return jsonResponse({ error: 'Log masuk diperlukan.' }, 401);
  const leadId = new URL(request.url).searchParams.get('leadId');
  if (!leadId || !/^[0-9a-f-]{36}$/i.test(leadId)) return jsonResponse({ error: 'ID lead tidak sah.' }, 400);

  try {
    const query = new URLSearchParams({
      select: 'id,lead_id,created_at,actor,action,from_status,to_status,details',
      lead_id: `eq.${leadId}`,
      order: 'created_at.desc',
      limit: '100'
    });
    const activity = await supabaseRest<LeadActivity[]>(`lead_activity?${query}`);
    return jsonResponse({ activity });
  } catch (error) {
    console.error('Lead activity failed:', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse({ error: 'Sejarah lead tidak dapat dimuatkan.' }, 503);
  }
};
