import React from 'react';
import { Gender } from '../types';
import type { AssetDetails, CaseFlags, HeirsCount } from '../types';
import { AlertCircle, Calculator, ChevronDown, Coins, Minus, Plus, User, Users } from 'lucide-react';

interface InputFormProps {
  gender: Gender;
  setGender: (gender: Gender) => void;
  assets: AssetDetails;
  setAssets: React.Dispatch<React.SetStateAction<AssetDetails>>;
  heirs: HeirsCount;
  setHeirs: React.Dispatch<React.SetStateAction<HeirsCount>>;
  caseFlags: CaseFlags;
  setCaseFlags: React.Dispatch<React.SetStateAction<CaseFlags>>;
  onCalculate: () => void;
}

const CurrencyInput = ({
  label,
  value,
  onChange,
  placeholder,
  subtext
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  placeholder?: string;
  subtext?: string;
}) => {
  const inputId = React.useId();
  return (
    <div className="group">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-warm-700">{label}</label>
      <div className="relative transition-all duration-200">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-sm font-bold text-gold-500">RM</span>
        </div>
        <input
          id={inputId}
          type="number"
          min="0"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full rounded-xl border border-warm-200 bg-white py-2.5 pl-10 pr-3 font-medium text-warm-900 placeholder-warm-300 transition-all hover:border-teal-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder={placeholder}
        />
      </div>
      {subtext && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-warm-500">
          <AlertCircle className="h-3 w-3 shrink-0" /> {subtext}
        </p>
      )}
    </div>
  );
};

const Counter = ({
  label,
  value,
  onChange,
  max = 20
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-warm-200 bg-warm-50 p-3 transition-colors hover:border-teal-300">
    <span className="text-sm font-medium leading-snug text-warm-700">{label}</span>
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-warm-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        aria-label={`Kurangkan ${label}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md text-warm-500 transition hover:bg-warm-100 hover:text-teal-600 active:scale-95 disabled:opacity-40"
        disabled={value <= 0}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-bold tabular-nums text-warm-800">{value}</span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md text-warm-500 transition hover:bg-warm-100 hover:text-teal-600 active:scale-95 disabled:opacity-40"
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const PresenceToggle = ({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left shadow-sm transition ${
      checked
        ? 'border-teal-300 bg-teal-50/70'
        : 'border-warm-200 bg-white hover:border-teal-300'
    }`}
  >
    <span className="flex items-center gap-3">
      <User className={`h-4 w-4 ${checked ? 'text-teal-600' : 'text-warm-400'}`} />
      <span className="text-sm font-medium text-warm-700">{label}</span>
    </span>
    <span className={`relative h-6 w-10 rounded-full transition ${checked ? 'bg-teal-600' : 'bg-warm-300'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </span>
  </button>
);

const ExpandableHeirGroup = ({
  title,
  description,
  badge,
  children,
  defaultOpen = false
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => (
  <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white" open={defaultOpen}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-warm-50/70 px-4 py-3 transition hover:bg-warm-50 [&::-webkit-details-marker]:hidden">
      <span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-warm-800">{title}</span>
          {badge && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-warm-500">{description}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-warm-400 transition-transform group-open:rotate-180" />
    </summary>
    <div className="grid grid-cols-1 gap-3 border-t border-warm-200 p-4 sm:grid-cols-2">{children}</div>
  </details>
);

const InputForm: React.FC<InputFormProps> = ({
  gender,
  setGender,
  assets,
  setAssets,
  heirs,
  setHeirs,
  caseFlags,
  setCaseFlags,
  onCalculate
}) => {
  const handleAssetChange = (key: keyof AssetDetails, value: string) => {
    const amount = Math.max(0, Number.parseFloat(value) || 0);
    setAssets(previous => ({ ...previous, [key]: amount }));
  };

  const handleHeirChange = <K extends keyof HeirsCount>(key: K, value: HeirsCount[K]) => {
    setHeirs(previous => ({ ...previous, [key]: value }));
  };

  const handleCaseFlagChange = <K extends keyof CaseFlags>(key: K, value: CaseFlags[K]) => {
    setCaseFlags(previous => {
      const next: CaseFlags = { ...previous, [key]: value };
      if (key === 'hasUnlistedHeirs' && value === true) next.confirmedNoOtherHeirs = false;
      if (key === 'confirmedNoOtherHeirs' && value === true) next.hasUnlistedHeirs = false;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-warm-200 bg-warm-50 px-6 py-4">
          <div className="rounded-lg bg-teal-100 p-2 text-teal-700"><User className="h-5 w-5" /></div>
          <h2 className="font-display text-lg font-bold text-warm-800">1. Maklumat Si Mati</h2>
        </div>
        <div className="p-6">
          <label className="mb-3 block text-sm font-semibold text-warm-700">Jantina arwah</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: Gender.MALE, label: 'Lelaki', hint: 'Pasangan: isteri' },
              { value: Gender.FEMALE, label: 'Wanita', hint: 'Pasangan: suami' }
            ].map(option => {
              const selected = gender === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    selected
                      ? 'border-teal-500 bg-teal-50/40 text-teal-800'
                      : 'border-warm-200 bg-white text-warm-500 hover:border-teal-300 hover:bg-warm-50'
                  }`}
                >
                  <div className={`rounded-full p-3 ${selected ? 'bg-teal-100 text-teal-600' : 'bg-warm-100 text-warm-400'}`}>
                    <User className="h-6 w-6" />
                  </div>
                  <span className="font-bold">{option.label}</span>
                  <span className="text-xs font-medium text-warm-500">{option.hint}</span>
                  {selected && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-warm-200 bg-warm-50 px-6 py-4">
          <div className="rounded-lg bg-teal-100 p-2 text-teal-700"><Coins className="h-5 w-5" /></div>
          <h2 className="font-display text-lg font-bold text-warm-800">2. Harta & Liabiliti</h2>
        </div>
        <div className="space-y-5 p-6">
          <CurrencyInput
            label="Jumlah Harta Kasar"
            value={assets.grossAssets}
            onChange={value => handleAssetChange('grossAssets', value)}
            placeholder="0.00"
            subtext="Termasuk tunai, hartanah, saham, KWSP dan aset lain."
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <CurrencyInput
              label="Harta Sepencarian"
              value={assets.hartaSepencarian}
              onChange={value => handleAssetChange('hartaSepencarian', value)}
              placeholder="0.00"
              subtext="Bahagian yang dikeluarkan daripada pusaka."
            />
            <CurrencyInput
              label="Hutang & Kos Jenazah"
              value={assets.debts + assets.funeralExpenses}
              onChange={value => handleAssetChange('debts', value)}
              placeholder="0.00"
              subtext="Diselesaikan sebelum pembahagian."
            />
          </div>
          <div className="border-t border-warm-200 pt-2">
            <CurrencyInput
              label="Wasiat (Bukan Waris)"
              value={assets.wasiat}
              onChange={value => handleAssetChange('wasiat', value)}
              placeholder="0.00"
              subtext="Sistem mengehadkan kepada maksimum 1/3 daripada baki."
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-warm-200 bg-warm-50 px-6 py-4">
          <div className="rounded-lg bg-teal-100 p-2 text-teal-700"><Users className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-warm-800">3. Senarai Waris</h2>
            <p className="text-xs text-warm-500">Masukkan semua waris hidup; sistem akan menerangkan pendindingan.</p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 text-teal-600 shadow-sm"><Users className="h-4 w-4" /></div>
              <div>
                <span className="block font-bold text-teal-900">{gender === Gender.MALE ? 'Isteri' : 'Suami'}</span>
                <span className="text-xs text-teal-700">Pasangan yang masih hidup</span>
              </div>
            </div>
            {gender === Gender.MALE ? (
              <select
                aria-label="Bilangan isteri"
                value={heirs.spouse}
                onChange={event => handleHeirChange('spouse', Number.parseInt(event.target.value, 10))}
                className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-800 shadow-sm outline-none focus:border-teal-500 focus:ring-teal-500"
              >
                <option value={0}>Tiada</option>
                <option value={1}>1 isteri</option>
                <option value={2}>2 isteri</option>
                <option value={3}>3 isteri</option>
                <option value={4}>4 isteri</option>
              </select>
            ) : (
              <PresenceToggle
                label="Masih hidup"
                checked={heirs.spouse === 1}
                onChange={value => handleHeirChange('spouse', value ? 1 : 0)}
              />
            )}
          </div>

          <ExpandableHeirGroup
            title="Waris utama"
            description="Ibu bapa dan anak kandung."
            badge="Utama"
            defaultOpen
          >
            <PresenceToggle label="Bapa" checked={heirs.father} onChange={value => handleHeirChange('father', value)} />
            <PresenceToggle label="Ibu" checked={heirs.mother} onChange={value => handleHeirChange('mother', value)} />
            <Counter label="Anak lelaki" value={heirs.sons} onChange={value => handleHeirChange('sons', value)} />
            <Counter label="Anak perempuan" value={heirs.daughters} onChange={value => handleHeirChange('daughters', value)} />
          </ExpandableHeirGroup>

          <ExpandableHeirGroup
            title="Datuk, nenek & cucu"
            description="Cucu dan cicit yang dimaksudkan ialah melalui susur lelaki sahaja."
            badge="V2"
          >
            <PresenceToggle label="Datuk sebelah bapa" checked={heirs.paternalGrandfather} onChange={value => handleHeirChange('paternalGrandfather', value)} />
            <PresenceToggle label="Nenek sebelah ibu" checked={heirs.maternalGrandmother} onChange={value => handleHeirChange('maternalGrandmother', value)} />
            <PresenceToggle label="Nenek sebelah bapa" checked={heirs.paternalGrandmother} onChange={value => handleHeirChange('paternalGrandmother', value)} />
            <span className="hidden sm:block" />
            <Counter label="Cucu lelaki daripada anak lelaki" value={heirs.grandsons} onChange={value => handleHeirChange('grandsons', value)} />
            <Counter label="Cucu perempuan daripada anak lelaki" value={heirs.granddaughters} onChange={value => handleHeirChange('granddaughters', value)} />
            <Counter label="Cicit lelaki daripada cucu lelaki" value={heirs.greatGrandsons} onChange={value => handleHeirChange('greatGrandsons', value)} />
            <Counter label="Cicit perempuan daripada cucu lelaki" value={heirs.greatGranddaughters} onChange={value => handleHeirChange('greatGranddaughters', value)} />
          </ExpandableHeirGroup>

          <ExpandableHeirGroup
            title="Adik-beradik si mati"
            description="Seibu-sebapa, sebapa dan seibu dikira sebagai kategori berbeza."
            badge="V2"
          >
            <Counter label="Saudara lelaki seibu-sebapa" value={heirs.fullBrothers} onChange={value => handleHeirChange('fullBrothers', value)} />
            <Counter label="Saudara perempuan seibu-sebapa" value={heirs.fullSisters} onChange={value => handleHeirChange('fullSisters', value)} />
            <Counter label="Saudara lelaki sebapa" value={heirs.paternalBrothers} onChange={value => handleHeirChange('paternalBrothers', value)} />
            <Counter label="Saudara perempuan sebapa" value={heirs.paternalSisters} onChange={value => handleHeirChange('paternalSisters', value)} />
            <Counter label="Saudara lelaki seibu" value={heirs.maternalBrothers} onChange={value => handleHeirChange('maternalBrothers', value)} />
            <Counter label="Saudara perempuan seibu" value={heirs.maternalSisters} onChange={value => handleHeirChange('maternalSisters', value)} />
          </ExpandableHeirGroup>

          <ExpandableHeirGroup
            title="Asabah lelaki lebih jauh (disokong)"
            description="Anak saudara, bapa saudara sebelah bapa dan sepupu lelaki melalui susur lelaki."
            badge="V2.1"
          >
            <Counter label="Anak lelaki saudara lelaki seibu-sebapa" value={heirs.fullNephews} onChange={value => handleHeirChange('fullNephews', value)} />
            <Counter label="Anak lelaki saudara lelaki sebapa" value={heirs.paternalNephews} onChange={value => handleHeirChange('paternalNephews', value)} />
            <Counter label="Bapa saudara seibu-sebapa sebelah bapa" value={heirs.fullPaternalUncles} onChange={value => handleHeirChange('fullPaternalUncles', value)} />
            <Counter label="Bapa saudara sebapa sebelah bapa" value={heirs.paternalUncles} onChange={value => handleHeirChange('paternalUncles', value)} />
            <Counter label="Sepupu lelaki daripada bapa saudara seibu-sebapa" value={heirs.fullCousins} onChange={value => handleHeirChange('fullCousins', value)} />
            <Counter label="Sepupu lelaki daripada bapa saudara sebapa" value={heirs.paternalCousins} onChange={value => handleHeirChange('paternalCousins', value)} />
          </ExpandableHeirGroup>

          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Jangan masukkan individu yang mempunyai halangan pusaka seperti bukan Islam atau membunuh si mati. Mereka tidak mewarisi dan tidak mendinding waris lain.
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-warm-200 bg-warm-50 px-6 py-4">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700"><AlertCircle className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-warm-800">4. Semakan Keselamatan</h2>
            <p className="text-xs text-warm-500">Kes khas dihentikan tanpa angka dan dirujuk untuk semakan pakar.</p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <ExpandableHeirGroup
            title="Keadaan khas"
            description="Tandakan mana-mana keadaan yang wujud atau belum dapat dipastikan."
          >
            <PresenceToggle label="Ada waris dalam kandungan / belum lahir" checked={caseFlags.unbornHeir} onChange={value => handleCaseFlagChange('unbornHeir', value)} />
            <PresenceToggle label="Ada waris hilang / status hidup belum pasti" checked={caseFlags.missingHeir} onChange={value => handleCaseFlagChange('missingHeir', value)} />
            <PresenceToggle label="Ada waris khunsa / jantina belum diputuskan" checked={caseFlags.intersexHeir} onChange={value => handleCaseFlagChange('intersexHeir', value)} />
            <PresenceToggle label="Ada kematian berlapis / urutan kematian tidak pasti" checked={caseFlags.layeredOrSimultaneousDeaths} onChange={value => handleCaseFlagChange('layeredOrSimultaneousDeaths', value)} />
            <PresenceToggle label="Ada isu agama, nasab, pembunuhan atau kelayakan" checked={caseFlags.unresolvedDisqualification} onChange={value => handleCaseFlagChange('unresolvedDisqualification', value)} />
            <PresenceToggle label="Ada waris lain yang tiada dalam senarai di atas" checked={caseFlags.hasUnlistedHeirs} onChange={value => handleCaseFlagChange('hasUnlistedHeirs', value)} />
          </ExpandableHeirGroup>

          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <PresenceToggle
              label="Saya telah menyemak dan mengesahkan tiada waris lain"
              checked={caseFlags.confirmedNoOtherHeirs}
              onChange={value => handleCaseFlagChange('confirmedNoOtherHeirs', value)}
            />
            <p className="mt-2 text-xs leading-relaxed text-teal-800">
              Pengesahan ini hanya diperlukan sebelum sistem memaparkan baki kepada Baitulmal. Semak juga datuk, nenek atau keturunan yang lebih jauh, keturunan anak saudara, dan kerabat sebelah bapa. Ini bukan pengesahan rasmi waris.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 py-4 text-lg font-bold text-white shadow-lg ring-4 ring-gold-100 transition-all hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-900 hover:shadow-xl"
      >
        <Calculator className="h-6 w-6" />
        Kira Pembahagian Faraid
      </button>
    </div>
  );
};

export default InputForm;
