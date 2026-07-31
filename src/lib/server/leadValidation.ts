import { createHmac } from 'node:crypto';
import {
  CASE_CATEGORY_OPTIONS,
  CONTACT_TIME_OPTIONS,
  MALAYSIAN_STATES
} from '../leads';
import type { LeadSubmission } from '../leads';

export const LEAD_CONSENT_VERSION = '2026-07-31-v1';

export interface ValidatedLead {
  name: string;
  phone: string;
  email: string | null;
  state: string;
  preferred_contact_time: string;
  case_category: string;
  message: string | null;
  source_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  consent_given: true;
  consent_at: string;
  consent_version: string;
  contact_hash: string;
}

const cleanText = (value: unknown, maximum: number) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maximum) : '';

const cleanMultiline = (value: unknown, maximum: number) =>
  typeof value === 'string' ? value.trim().replace(/\r\n/g, '\n').slice(0, maximum) : '';

export const normaliseMalaysianPhone = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  const withCountry = digits.startsWith('60')
    ? `+${digits}`
    : digits.startsWith('0')
      ? `+6${digits}`
      : '';

  return /^\+601\d{8,9}$/.test(withCountry) ? withCountry : null;
};

export const validateLeadSubmission = (
  value: unknown,
  hashSecret: string,
  now = new Date()
): { data?: ValidatedLead; errors: Record<string, string>; isSpam: boolean } => {
  const input = (value && typeof value === 'object' ? value : {}) as Partial<LeadSubmission>;
  const errors: Record<string, string> = {};
  const website = cleanText(input.website, 200);
  const name = cleanText(input.name, 80);
  const phone = normaliseMalaysianPhone(input.phone);
  const email = cleanText(input.email, 120).toLowerCase();
  const state = cleanText(input.state, 40);
  const preferredContactTime = cleanText(input.preferredContactTime, 30);
  const caseCategory = cleanText(input.caseCategory, 40);
  const message = cleanMultiline(input.message, 800);

  if (name.length < 2) errors.name = 'Masukkan nama sekurang-kurangnya 2 aksara.';
  if (!phone) errors.phone = 'Masukkan nombor telefon Malaysia yang sah.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Masukkan alamat e-mel yang sah.';
  if (!MALAYSIAN_STATES.includes(state as typeof MALAYSIAN_STATES[number])) errors.state = 'Pilih negeri.';
  if (!CONTACT_TIME_OPTIONS.some(option => option.value === preferredContactTime)) errors.preferredContactTime = 'Pilih masa untuk dihubungi.';
  if (!CASE_CATEGORY_OPTIONS.some(option => option.value === caseCategory)) errors.caseCategory = 'Pilih jenis bantuan.';
  if (input.consent !== true) errors.consent = 'Kebenaran diperlukan sebelum butiran boleh dihantar.';

  if (Object.keys(errors).length > 0 || !phone) return { errors, isSpam: website.length > 0 };

  const contactHash = createHmac('sha256', hashSecret).update(phone).digest('hex');
  return {
    errors,
    isSpam: website.length > 0,
    data: {
      name,
      phone,
      email: email || null,
      state,
      preferred_contact_time: preferredContactTime,
      case_category: caseCategory,
      message: message || null,
      source_page: cleanText(input.sourcePage, 200) || null,
      referrer: cleanText(input.referrer, 300) || null,
      utm_source: cleanText(input.utmSource, 100) || null,
      utm_medium: cleanText(input.utmMedium, 100) || null,
      utm_campaign: cleanText(input.utmCampaign, 100) || null,
      consent_given: true,
      consent_at: now.toISOString(),
      consent_version: LEAD_CONSENT_VERSION,
      contact_hash: contactHash
    }
  };
};
