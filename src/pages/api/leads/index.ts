import type { APIRoute } from 'astro';
import type { LeadActivity, LeadRecord } from '../../../lib/leads';
import { getDashboardSession } from '../../../lib/server/leadAuth';
import { jsonResponse, isSameOrigin, readJsonBody } from '../../../lib/server/http';
import { validateLeadSubmission } from '../../../lib/server/leadValidation';
import { LeadStoreConfigurationError, supabaseRest } from '../../../lib/server/supabaseRest';

export const prerender = false;

const LEAD_SELECT = [
  'id', 'created_at', 'updated_at', 'name', 'phone', 'email', 'state',
  'preferred_contact_time', 'case_category', 'message', 'status', 'assigned_to',
  'first_contacted_at', 'next_follow_up_at', 'internal_notes', 'source_page',
  'utm_source', 'utm_medium', 'utm_campaign', 'consent_at', 'consent_version'
].join(',');

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOrigin(request)) return jsonResponse({ error: 'Permintaan tidak sah.' }, 403);

  try {
    const body = await readJsonBody(request, 20_000);
    const hashSecret = process.env.LEADS_HASH_SECRET || '';
    if (hashSecret.length < 32) throw new LeadStoreConfigurationError('LEADS_HASH_SECRET is missing.');

    const validation = validateLeadSubmission(body, hashSecret);
    if (validation.isSpam) return jsonResponse({ ok: true, reference: 'DITERIMA' }, 202);
    if (!validation.data) return jsonResponse({ error: 'Semak maklumat yang dimasukkan.', fields: validation.errors }, 400);

    const duplicateSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const duplicateQuery = new URLSearchParams({
      select: 'id,created_at',
      contact_hash: `eq.${validation.data.contact_hash}`,
      created_at: `gte.${duplicateSince}`,
      limit: '1'
    });
    const duplicates = await supabaseRest<Array<Pick<LeadRecord, 'id' | 'created_at'>>>(
      `leads?${duplicateQuery}`
    );
    if (duplicates.length > 0) {
      return jsonResponse({ ok: true, reference: duplicates[0].id.slice(0, 8).toUpperCase(), duplicate: true }, 202);
    }

    const inserted = await supabaseRest<Array<Pick<LeadRecord, 'id' | 'created_at'>>>(
      'leads?select=id,created_at',
      {
        method: 'POST',
        body: JSON.stringify(validation.data),
        prefer: 'return=representation'
      }
    );
    const lead = inserted[0];
    if (!lead) throw new Error('Lead insert did not return a record.');

    const activity: Omit<LeadActivity, 'id' | 'created_at'> = {
      lead_id: lead.id,
      actor: 'public_form',
      action: 'lead_submitted',
      from_status: null,
      to_status: 'new',
      details: {
        source_page: validation.data.source_page,
        consent_version: validation.data.consent_version
      }
    };
    await supabaseRest('lead_activity', {
      method: 'POST',
      body: JSON.stringify(activity),
      prefer: 'return=minimal'
    });

    return jsonResponse({ ok: true, reference: lead.id.slice(0, 8).toUpperCase() }, 201);
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse({ error: 'Maklumat yang dihantar terlalu besar.' }, 413);
    console.error('Lead submission failed:', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse({ error: 'Borang tidak dapat dihantar sekarang. Sila cuba lagi sebentar.' }, 503);
  }
};

export const GET: APIRoute = async ({ cookies }) => {
  const user = getDashboardSession(cookies);
  if (!user) return jsonResponse({ error: 'Log masuk diperlukan.' }, 401);

  try {
    const query = new URLSearchParams({
      select: LEAD_SELECT,
      archived_at: 'is.null',
      order: 'created_at.desc',
      limit: '250'
    });
    const leads = await supabaseRest<LeadRecord[]>(`leads?${query}`);
    return jsonResponse({ leads, user });
  } catch (error) {
    console.error('Lead list failed:', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse({ error: 'Senarai lead tidak dapat dimuatkan.' }, 503);
  }
};
