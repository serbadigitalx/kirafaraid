create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 10 and 16),
  email text check (email is null or char_length(email) <= 120),
  state text not null check (char_length(state) <= 40),
  preferred_contact_time text not null check (preferred_contact_time in ('morning', 'afternoon', 'evening', 'anytime')),
  case_category text not null check (case_category in ('expert_review', 'verify_calculation', 'estate_process', 'heir_identification', 'other')),
  message text check (message is null or char_length(message) <= 800),
  status text not null default 'new' check (status in ('new', 'assigned', 'contacted', 'no_response', 'consultation_booked', 'qualified', 'won', 'lost', 'closed')),
  assigned_to text check (assigned_to is null or char_length(assigned_to) <= 80),
  first_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 1500),
  source_page text check (source_page is null or char_length(source_page) <= 200),
  referrer text check (referrer is null or char_length(referrer) <= 300),
  utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 100),
  consent_given boolean not null check (consent_given = true),
  consent_at timestamptz not null,
  consent_version text not null check (char_length(consent_version) <= 40),
  contact_hash text not null check (char_length(contact_hash) = 64),
  updated_by text,
  archived_at timestamptz
);

create table if not exists public.lead_activity (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor text not null check (char_length(actor) <= 80),
  action text not null check (char_length(action) <= 60),
  from_status text,
  to_status text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_follow_up_idx on public.leads (next_follow_up_at) where next_follow_up_at is not null;
create index if not exists leads_contact_hash_idx on public.leads (contact_hash, created_at desc);
create index if not exists lead_activity_lead_idx on public.lead_activity (lead_id, created_at desc);

create or replace function public.set_lead_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_lead_updated_at();

alter table public.leads enable row level security;
alter table public.lead_activity enable row level security;

revoke all on table public.leads from anon, authenticated;
revoke all on table public.lead_activity from anon, authenticated;
grant select, insert, update on table public.leads to service_role;
grant select, insert on table public.lead_activity to service_role;
grant usage, select on sequence public.lead_activity_id_seq to service_role;

comment on table public.leads is 'Private consultation leads submitted with explicit disclosure consent.';
comment on table public.lead_activity is 'Append-only operational audit history for lead changes.';
