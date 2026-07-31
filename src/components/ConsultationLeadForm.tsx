import React, { useEffect, useId, useState } from 'react';
import { ArrowRight, CheckCircle2, PhoneCall, ShieldCheck, X } from 'lucide-react';
import {
  CASE_CATEGORY_OPTIONS,
  CONTACT_TIME_OPTIONS,
  MALAYSIAN_STATES
} from '../lib/leads';

interface ConsultationLeadFormProps {
  requiresExpertReview: boolean;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  state: string;
  preferredContactTime: string;
  caseCategory: string;
  message: string;
  consent: boolean;
  website: string;
}

const partnerName = import.meta.env.PUBLIC_LEAD_PARTNER_NAME || 'Rakan Pakar Faraid KiraFaraid';

const ConsultationLeadForm: React.FC<ConsultationLeadFormProps> = ({ requiresExpertReview }) => {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    state: '',
    preferredContactTime: 'anytime',
    caseCategory: requiresExpertReview ? 'expert_review' : 'verify_calculation',
    message: '',
    consent: false,
    website: ''
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setFieldErrors(previous => ({ ...previous, [key]: '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    const search = new URLSearchParams(window.location.search);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sourcePage: window.location.pathname,
          referrer: document.referrer,
          utmSource: search.get('utm_source') || '',
          utmMedium: search.get('utm_medium') || '',
          utmCampaign: search.get('utm_campaign') || ''
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setFieldErrors(data.fields || {});
        setFormError(data.error || 'Borang tidak dapat dihantar.');
        return;
      }
      setReference(data.reference || 'DITERIMA');
    } catch {
      setFormError('Sambungan gagal. Sila semak internet anda dan cuba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'mt-2 block w-full rounded-xl border border-warm-300 bg-white px-3.5 py-3 text-sm text-warm-900 outline-none transition placeholder:text-warm-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20';

  return (
    <>
      <section className={`overflow-hidden rounded-2xl border p-5 shadow-sm md:p-6 ${requiresExpertReview ? 'border-rose-200 bg-white' : 'border-teal-200 bg-teal-50/50'}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-warm-900">
                {requiresExpertReview ? 'Dapatkan semakan manusia' : 'Mahukan semakan tambahan?'}
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-warm-600">
                Tinggalkan butiran hubungan. {partnerName} boleh menghubungi anda untuk memahami kes ini dengan lebih lanjut.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 active:scale-[0.98]"
          >
            Minta dihubungi <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-warm-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event => {
          if (event.currentTarget === event.target) setOpen(false);
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-warm-50 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-warm-200 bg-warm-50/95 px-5 py-4 backdrop-blur sm:px-7">
              <div>
                <h2 id={titleId} className="font-display text-2xl font-bold text-warm-900">Minta pakar hubungi saya</h2>
                <p className="mt-1 text-sm text-warm-600">Kami hanya meminta maklumat yang diperlukan untuk menghubungi anda.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup borang" className="rounded-lg p-2 text-warm-500 transition hover:bg-warm-100 hover:text-warm-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {reference ? (
              <div className="p-7 sm:p-10">
                <div className="mx-auto max-w-md text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-warm-900">Permintaan diterima</h3>
                  <p className="mt-2 text-sm leading-relaxed text-warm-600">Pakar akan menghubungi anda berdasarkan masa pilihan. Simpan nombor rujukan ini.</p>
                  <p className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 font-bold tracking-wider text-gold-700">{reference}</p>
                  <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800">Selesai</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5 p-5 sm:p-7" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-warm-800">
                    Nama
                    <input value={form.name} onChange={event => update('name', event.target.value)} autoComplete="name" className={inputClass} aria-invalid={Boolean(fieldErrors.name)} />
                    {fieldErrors.name && <span className="mt-1.5 block text-xs text-rose-700">{fieldErrors.name}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-warm-800">
                    Nombor telefon
                    <input value={form.phone} onChange={event => update('phone', event.target.value)} autoComplete="tel" inputMode="tel" placeholder="Contoh: 0123456789" className={inputClass} aria-invalid={Boolean(fieldErrors.phone)} />
                    {fieldErrors.phone && <span className="mt-1.5 block text-xs text-rose-700">{fieldErrors.phone}</span>}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-warm-800">
                    E-mel <span className="font-normal text-warm-500">(pilihan)</span>
                    <input value={form.email} onChange={event => update('email', event.target.value)} autoComplete="email" inputMode="email" className={inputClass} aria-invalid={Boolean(fieldErrors.email)} />
                    {fieldErrors.email && <span className="mt-1.5 block text-xs text-rose-700">{fieldErrors.email}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-warm-800">
                    Negeri
                    <select value={form.state} onChange={event => update('state', event.target.value)} className={inputClass} aria-invalid={Boolean(fieldErrors.state)}>
                      <option value="">Pilih negeri</option>
                      {MALAYSIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                    {fieldErrors.state && <span className="mt-1.5 block text-xs text-rose-700">{fieldErrors.state}</span>}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-warm-800">
                    Jenis bantuan
                    <select value={form.caseCategory} onChange={event => update('caseCategory', event.target.value)} className={inputClass}>
                      {CASE_CATEGORY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-warm-800">
                    Masa sesuai dihubungi
                    <select value={form.preferredContactTime} onChange={event => update('preferredContactTime', event.target.value)} className={inputClass}>
                      {CONTACT_TIME_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-semibold text-warm-800">
                  Ringkasan pertanyaan <span className="font-normal text-warm-500">(pilihan)</span>
                  <textarea value={form.message} onChange={event => update('message', event.target.value)} rows={4} maxLength={800} className={inputClass} placeholder="Terangkan secara ringkas bantuan yang anda perlukan. Jangan masukkan nombor kad pengenalan." />
                  <span className="mt-1.5 block text-right text-xs text-warm-500">{form.message.length}/800</span>
                </label>

                <label className="hidden" aria-hidden="true">
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={event => update('website', event.target.value)} />
                </label>

                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-teal-950">
                    <input type="checkbox" checked={form.consent} onChange={event => update('consent', event.target.checked)} className="mt-1 h-4 w-4 rounded border-teal-400 text-teal-700 focus:ring-teal-600" />
                    <span>
                      Saya bersetuju KiraFaraid berkongsi nama dan butiran hubungan saya dengan <strong>{partnerName}</strong> supaya beliau boleh menghubungi saya mengenai pertanyaan ini. Saya telah membaca <a href="/dasar-privasi" target="_blank" className="font-semibold underline underline-offset-2">Dasar Privasi</a>.
                    </span>
                  </label>
                  {fieldErrors.consent && <span className="mt-2 block text-xs text-rose-700">{fieldErrors.consent}</span>}
                  <div className="mt-3 flex gap-2 text-xs leading-relaxed text-teal-800">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    Jumlah harta dan senarai waris dalam kalkulator tidak dihantar bersama borang ini.
                  </div>
                </div>

                {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{formError}</p>}

                <div className="flex flex-col-reverse gap-3 border-t border-warm-200 pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-warm-300 bg-white px-5 py-3 text-sm font-semibold text-warm-700 hover:bg-warm-100">Batal</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? 'Menghantar...' : 'Hantar permintaan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationLeadForm;
