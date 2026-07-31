import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LogOut,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  CASE_CATEGORY_OPTIONS,
  CONTACT_TIME_OPTIONS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS
} from '../lib/leads';
import type { DashboardUser, LeadActivity, LeadRecord, LeadStatus } from '../lib/leads';

const statusClass: Record<LeadStatus, string> = {
  new: 'border-sky-200 bg-sky-50 text-sky-800',
  assigned: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  contacted: 'border-teal-200 bg-teal-50 text-teal-800',
  no_response: 'border-amber-200 bg-amber-50 text-amber-800',
  consultation_booked: 'border-violet-200 bg-violet-50 text-violet-800',
  qualified: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  won: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  lost: 'border-rose-200 bg-rose-50 text-rose-800',
  closed: 'border-warm-300 bg-warm-100 text-warm-700'
};

const formatDate = (value: string | null) => value
  ? new Date(value).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Belum ditetapkan';

const toLocalDateTime = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const labelFor = (options: readonly { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label || value;

const LeadCard = ({ lead, onSaved }: { lead: LeadRecord; onSaved: (lead: LeadRecord) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState<LeadActivity[] | null>(null);
  const [draft, setDraft] = useState({
    status: lead.status,
    assignedTo: lead.assigned_to || '',
    nextFollowUpAt: toLocalDateTime(lead.next_follow_up_at),
    internalNotes: lead.internal_notes || ''
  });

  useEffect(() => {
    setDraft({
      status: lead.status,
      assignedTo: lead.assigned_to || '',
      nextFollowUpAt: toLocalDateTime(lead.next_follow_up_at),
      internalNotes: lead.internal_notes || ''
    });
  }, [lead]);

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && activity === null) {
      try {
        const response = await fetch(`/api/leads/activity?leadId=${encodeURIComponent(lead.id)}`);
        const data = await response.json();
        if (response.ok) setActivity(data.activity || []);
      } catch {
        setActivity([]);
      }
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/leads/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          status: draft.status,
          assignedTo: draft.assignedTo,
          nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null,
          internalNotes: draft.internalNotes
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Perubahan tidak dapat disimpan.');
        return;
      }
      onSaved(data.lead);
      setActivity(null);
    } catch {
      setError('Sambungan gagal. Cuba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const whatsappNumber = lead.phone.replace(/\D/g, '');

  return (
    <article className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-warm-900">{lead.name}</h3>
              <span className={`rounded-lg border px-2 py-1 text-xs font-bold ${statusClass[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span>
              <span className="text-xs font-medium text-warm-500">#{lead.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <p className="mt-1 text-xs text-warm-500">Diterima {formatDate(lead.created_at)} dari {lead.source_page || 'halaman tidak diketahui'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={`tel:${lead.phone}`} className="inline-flex items-center rounded-lg border border-warm-300 bg-white px-3 py-2 text-xs font-bold text-warm-700 hover:bg-warm-50">{lead.phone}</a>
            <button type="button" onClick={toggle} className="inline-flex items-center gap-1 rounded-lg border border-warm-300 bg-white px-3 py-2 text-xs font-bold text-warm-700 hover:bg-warm-50">
              Urus {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm md:grid-cols-4">
          <div><span className="block text-xs text-warm-500">Negeri</span><strong className="mt-0.5 block text-warm-800">{lead.state}</strong></div>
          <div><span className="block text-xs text-warm-500">Jenis bantuan</span><strong className="mt-0.5 block text-warm-800">{labelFor(CASE_CATEGORY_OPTIONS, lead.case_category)}</strong></div>
          <div><span className="block text-xs text-warm-500">Masa hubungan</span><strong className="mt-0.5 block text-warm-800">{labelFor(CONTACT_TIME_OPTIONS, lead.preferred_contact_time)}</strong></div>
          <div><span className="block text-xs text-warm-500">Susulan</span><strong className="mt-0.5 block text-warm-800">{formatDate(lead.next_follow_up_at)}</strong></div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-warm-200 bg-warm-50/70 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-warm-800">
                  Status
                  <select value={draft.status} onChange={event => setDraft(previous => ({ ...previous, status: event.target.value as LeadStatus }))} className="mt-2 block w-full rounded-xl border border-warm-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
                    {LEAD_STATUSES.map(status => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-warm-800">
                  Ditugaskan kepada
                  <input value={draft.assignedTo} onChange={event => setDraft(previous => ({ ...previous, assignedTo: event.target.value }))} maxLength={80} className="mt-2 block w-full rounded-xl border border-warm-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
                </label>
              </div>

              <label className="block text-sm font-semibold text-warm-800">
                Susulan seterusnya
                <input type="datetime-local" value={draft.nextFollowUpAt} onChange={event => setDraft(previous => ({ ...previous, nextFollowUpAt: event.target.value }))} className="mt-2 block w-full rounded-xl border border-warm-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
              </label>

              <label className="block text-sm font-semibold text-warm-800">
                Nota dalaman
                <textarea value={draft.internalNotes} onChange={event => setDraft(previous => ({ ...previous, internalNotes: event.target.value }))} rows={4} maxLength={1500} className="mt-2 block w-full rounded-xl border border-warm-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" placeholder="Catat hasil panggilan, tindakan seterusnya atau sebab lead ditutup." />
              </label>

              {lead.message && <div className="rounded-xl border border-warm-200 bg-white p-4"><p className="text-xs font-bold text-warm-500">Pertanyaan pengguna</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-warm-700">{lead.message}</p></div>}
              {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"><Mail className="h-4 w-4" /> {lead.email}</a>}

              {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan perubahan'}
              </button>
            </div>

            <div className="rounded-xl border border-warm-200 bg-white p-4">
              <h4 className="text-sm font-bold text-warm-900">Sejarah aktiviti</h4>
              {activity === null ? (
                <p className="mt-3 text-sm text-warm-500">Memuatkan sejarah...</p>
              ) : activity.length === 0 ? (
                <p className="mt-3 text-sm text-warm-500">Belum ada aktiviti direkodkan.</p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {activity.map(item => (
                    <li key={item.id} className="border-l-2 border-teal-200 pl-3 text-xs leading-relaxed text-warm-600">
                      <strong className="block text-warm-800">{item.action === 'lead_submitted' ? 'Lead diterima' : 'Lead dikemas kini'}</strong>
                      <span>{item.actor} pada {formatDate(item.created_at)}</span>
                      {item.from_status !== item.to_status && item.to_status && <span className="block">Status: {item.from_status ? LEAD_STATUS_LABELS[item.from_status] : 'Tiada'} ke {LEAD_STATUS_LABELS[item.to_status]}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

const LeadDashboard: React.FC = () => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');

  const loadLeads = async () => {
    setLoadingLeads(true);
    setError('');
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setUser(null);
        setError(data.error || 'Senarai lead tidak dapat dimuatkan.');
        return;
      }
      setLeads(data.leads || []);
      if (data.user) setUser(data.user);
    } catch {
      setError('Sambungan ke pelayan gagal.');
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/session')
      .then(async response => {
        if (!response.ok) return null;
        return response.json();
      })
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          void loadLeads();
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Log masuk gagal.');
        return;
      }
      setUser(data.user);
      setCredentials(previous => ({ ...previous, password: '' }));
      await loadLeads();
    } catch {
      setError('Sambungan ke pelayan gagal.');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setLeads([]);
  };

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter(lead => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSearch = !query || [lead.name, lead.phone, lead.email || '', lead.state, lead.id]
        .some(value => value.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const metrics = useMemo(() => {
    const now = Date.now();
    return {
      new: leads.filter(lead => lead.status === 'new').length,
      followUp: leads.filter(lead => lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= now && !['won', 'lost', 'closed'].includes(lead.status)).length,
      booked: leads.filter(lead => lead.status === 'consultation_booked').length,
      won: leads.filter(lead => lead.status === 'won').length
    };
  }, [leads]);

  if (authLoading) {
    return <div className="mx-auto max-w-lg rounded-2xl border border-warm-200 bg-white p-8 text-center text-sm text-warm-500 shadow-sm">Memeriksa sesi...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
        <div className="border-b border-warm-200 bg-teal-800 p-6 text-white">
          <ShieldCheck className="h-7 w-7 text-gold-300" />
          <h1 className="mt-4 font-display text-2xl font-bold">Portal lead KiraFaraid</h1>
          <p className="mt-1 text-sm text-teal-100">Akses terhad kepada rakan kerjasama yang dibenarkan.</p>
        </div>
        <form onSubmit={login} className="space-y-5 p-6">
          <label className="block text-sm font-semibold text-warm-800">
            Nama pengguna
            <input value={credentials.username} onChange={event => setCredentials(previous => ({ ...previous, username: event.target.value }))} autoComplete="username" className="mt-2 block w-full rounded-xl border border-warm-300 px-3.5 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
          </label>
          <label className="block text-sm font-semibold text-warm-800">
            Kata laluan
            <input type="password" value={credentials.password} onChange={event => setCredentials(previous => ({ ...previous, password: event.target.value }))} autoComplete="current-password" className="mt-2 block w-full rounded-xl border border-warm-300 px-3.5 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <button type="submit" disabled={loggingIn} className="w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">{loggingIn ? 'Memeriksa...' : 'Log masuk'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Portal rakan kerjasama</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-warm-900">Pemantauan lead</h1>
          <p className="mt-1 text-sm text-warm-600">Log masuk sebagai {user.name}. Semua perubahan direkodkan.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadLeads} disabled={loadingLeads} className="inline-flex items-center gap-2 rounded-xl border border-warm-300 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 hover:bg-warm-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loadingLeads ? 'animate-spin' : ''}`} /> Muat semula</button>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-warm-300 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 hover:bg-warm-50"><LogOut className="h-4 w-4" /> Keluar</button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Lead baharu', value: metrics.new, icon: ClipboardList },
          { label: 'Susulan perlu dibuat', value: metrics.followUp, icon: CalendarClock },
          { label: 'Temujanji', value: metrics.booked, icon: UserCheck },
          { label: 'Berjaya', value: metrics.won, icon: ShieldCheck }
        ].map(metric => (
          <div key={metric.label} className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
            <metric.icon className="h-5 w-5 text-teal-700" />
            <p className="mt-4 text-2xl font-bold text-warm-900">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-warm-500">{metric.label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-warm-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Cari lead</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-warm-500" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari nama, telefon, negeri atau ID" className="block w-full rounded-xl border border-warm-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
        </label>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'all' | LeadStatus)} aria-label="Tapis mengikut status" className="rounded-xl border border-warm-300 bg-white px-3 py-2.5 text-sm font-semibold text-warm-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
          <option value="all">Semua status</option>
          {LEAD_STATUSES.map(status => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}
        </select>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

      {loadingLeads && leads.length === 0 ? (
        <div className="space-y-3" aria-label="Memuatkan lead">
          {[1, 2, 3].map(item => <div key={item} className="h-36 animate-pulse rounded-2xl border border-warm-200 bg-white" />)}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-warm-300 bg-white p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-warm-400" />
          <h2 className="mt-4 font-bold text-warm-800">Tiada lead ditemui</h2>
          <p className="mt-1 text-sm text-warm-500">Ubah carian atau penapis untuk melihat rekod lain.</p>
        </div>
      ) : (
        <section className="space-y-3" aria-label="Senarai lead">
          <div className="flex items-center justify-between text-xs font-medium text-warm-500">
            <span>{filteredLeads.length} daripada {leads.length} lead</span>
            <span>Maksimum 250 rekod terkini</span>
          </div>
          {filteredLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onSaved={updated => setLeads(previous => previous.map(item => item.id === updated.id ? updated : item))}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default LeadDashboard;
