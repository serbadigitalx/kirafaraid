import type { APIRoute } from 'astro';
import { LEAD_STATUSES } from '../../../lib/leads';
import type { LeadActivity, LeadRecord, LeadStatus } from '../../../lib/leads';
import { getDashboardSession } from '../../../lib/server/leadAuth';
import { isSameOrigin, jsonResponse } from '../../../lib/server/http';
import { supabaseRest } from '../../../lib/server/supabaseRest';

export const prerender = false;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const cleanNullable = (value: unknown, maximum: number): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  return value.trim().slice(0, maximum) || null;
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const user = getDashboardSession(cookies);
  if (!user) return jsonResponse({ error: 'Log masuk diperlukan.' }, 401);
  if (!isSameOrigin(request)) return jsonResponse({ error: 'Permintaan tidak sah.' }, 403);

  try {
    const body = await request.json();
    if (!isUuid(body?.id)) return jsonResponse({ error: 'ID lead tidak sah.' }, 400);

    const existingQuery = new URLSearchParams({
      select: '*',
      id: `eq.${body.id}`,
      limit: '1'
    });
    const existingRows = await supabaseRest<LeadRecord[]>(`leads?${existingQuery}`);
    const existing = existingRows[0];
    if (!existing) return jsonResponse({ error: 'Lead tidak ditemui.' }, 404);

    const updates: Record<string, string | null> = { updated_by: user.username };
    const changedFields: string[] = [];

    if (body.status !== undefined) {
      if (!LEAD_STATUSES.includes(body.status as LeadStatus)) return jsonResponse({ error: 'Status tidak sah.' }, 400);
      updates.status = body.status;
      changedFields.push('status');
      if (!existing.first_contacted_at && ['contacted', 'no_response', 'consultation_booked', 'qualified', 'won', 'lost', 'closed'].includes(body.status)) {
        updates.first_contacted_at = new Date().toISOString();
      }
    }

    const assignedTo = cleanNullable(body.assignedTo, 80);
    if (assignedTo !== undefined) {
      updates.assigned_to = assignedTo;
      changedFields.push('assigned_to');
    }

    const internalNotes = cleanNullable(body.internalNotes, 1500);
    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes;
      changedFields.push('internal_notes');
    }

    if (body.nextFollowUpAt !== undefined) {
      if (body.nextFollowUpAt === null || body.nextFollowUpAt === '') {
        updates.next_follow_up_at = null;
      } else {
        const date = new Date(body.nextFollowUpAt);
        if (Number.isNaN(date.getTime())) return jsonResponse({ error: 'Tarikh susulan tidak sah.' }, 400);
        updates.next_follow_up_at = date.toISOString();
      }
      changedFields.push('next_follow_up_at');
    }

    if (changedFields.length === 0) return jsonResponse({ error: 'Tiada perubahan untuk disimpan.' }, 400);

    const updateQuery = new URLSearchParams({ id: `eq.${body.id}`, select: '*' });
    const updatedRows = await supabaseRest<LeadRecord[]>(`leads?${updateQuery}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      prefer: 'return=representation'
    });
    const lead = updatedRows[0];

    const activity: Omit<LeadActivity, 'id' | 'created_at'> = {
      lead_id: existing.id,
      actor: user.username,
      action: 'lead_updated',
      from_status: existing.status,
      to_status: (updates.status as LeadStatus | undefined) ?? existing.status,
      details: { changed_fields: changedFields }
    };
    await supabaseRest('lead_activity', {
      method: 'POST',
      body: JSON.stringify(activity),
      prefer: 'return=minimal'
    });

    return jsonResponse({ lead });
  } catch (error) {
    console.error('Lead update failed:', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse({ error: 'Perubahan tidak dapat disimpan.' }, 503);
  }
};
