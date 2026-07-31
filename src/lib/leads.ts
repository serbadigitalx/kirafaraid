export const LEAD_STATUSES = [
  'new',
  'assigned',
  'contacted',
  'no_response',
  'consultation_booked',
  'qualified',
  'won',
  'lost',
  'closed'
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Baharu',
  assigned: 'Ditugaskan',
  contacted: 'Dihubungi',
  no_response: 'Tiada jawapan',
  consultation_booked: 'Temujanji',
  qualified: 'Berpotensi',
  won: 'Berjaya',
  lost: 'Tidak berjaya',
  closed: 'Ditutup'
};

export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya',
  'Lain-lain'
] as const;

export const CONTACT_TIME_OPTIONS = [
  { value: 'morning', label: 'Pagi, 9:00 - 12:00' },
  { value: 'afternoon', label: 'Tengah hari, 12:00 - 3:00' },
  { value: 'evening', label: 'Petang, 3:00 - 6:00' },
  { value: 'anytime', label: 'Bila-bila masa waktu bekerja' }
] as const;

export const CASE_CATEGORY_OPTIONS = [
  { value: 'expert_review', label: 'Kiraan memerlukan semakan pakar' },
  { value: 'verify_calculation', label: 'Semak keputusan kalkulator' },
  { value: 'estate_process', label: 'Proses pentadbiran pusaka' },
  { value: 'heir_identification', label: 'Pengesahan senarai waris' },
  { value: 'other', label: 'Pertanyaan lain' }
] as const;

export interface LeadSubmission {
  name: string;
  phone: string;
  email?: string;
  state: string;
  preferredContactTime: string;
  caseCategory: string;
  message?: string;
  consent: boolean;
  website?: string;
  sourcePage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface LeadRecord {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  state: string;
  preferred_contact_time: string;
  case_category: string;
  message: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  first_contacted_at: string | null;
  next_follow_up_at: string | null;
  internal_notes: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  consent_at: string;
  consent_version: string;
}

export interface LeadActivity {
  id: number;
  lead_id: string;
  created_at: string;
  actor: string;
  action: string;
  from_status: LeadStatus | null;
  to_status: LeadStatus | null;
  details: Record<string, unknown>;
}

export interface DashboardUser {
  username: string;
  name: string;
  role: 'owner' | 'partner';
}
