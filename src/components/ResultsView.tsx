import React from 'react';
import type { CalculationResult, HeirShare } from '../types';
import { AlertTriangle, Ban, Info, Scale, User, Users, Wallet } from 'lucide-react';

interface ResultsViewProps {
  result: CalculationResult;
}

const currency = (amount: number) =>
  amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusLabel: Record<HeirShare['status'], string> = {
  fardu: 'Fardu',
  asabah: 'Asabah',
  fardu_asabah: 'Fardu + Asabah',
  baitulmal: 'Baitulmal',
  radd: 'Radd'
};

const DistributionTable = ({ shares, title }: { shares: HeirShare[]; title: string }) => (
  <div className="overflow-hidden rounded-xl border border-warm-200">
    <div className="border-b border-warm-200 bg-warm-50 px-5 py-3">
      <h4 className="text-sm font-bold text-warm-800">{title}</h4>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-warm-200 bg-white text-xs uppercase text-warm-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Waris</th>
            <th className="px-5 py-3 text-center font-semibold">Bahagian</th>
            <th className="px-5 py-3 text-right font-semibold">Jumlah (RM)</th>
            <th className="px-5 py-3 font-semibold">Catatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-100">
          {shares.map((share, index) => (
            <tr key={`${share.id}-${index}`} className="bg-white transition hover:bg-teal-50/30">
              <td className="px-5 py-4">
                <div className="flex min-w-[170px] items-center gap-3">
                  <div className={`rounded-lg p-2 ${share.id === 'baitulmal' ? 'bg-amber-100 text-amber-700' : 'bg-warm-100 text-warm-500'}`}>
                    {share.id === 'baitulmal' ? <Scale className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-warm-800">{share.type}</p>
                    <p className="text-xs text-warm-500">
                      {share.id === 'baitulmal' ? 'Institusi' : share.count > 1 ? `${share.count} orang` : 'Seorang'}
                      {' · '}{statusLabel[share.status]}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-block rounded-full border border-gold-200 bg-gold-100 px-3 py-1 text-xs font-bold text-gold-700">
                  {share.shareFraction}
                </span>
                <span className="mt-1 block text-[11px] text-warm-400">{(share.sharePercentage * 100).toFixed(2)}%</span>
              </td>
              <td className="px-5 py-4 text-right">
                <p className="text-base font-bold text-teal-700">{currency(share.amount)}</p>
                {share.count > 1 && (
                  <p className="mt-0.5 text-xs text-warm-400">{currency(share.amount / share.count)} / orang</p>
                )}
              </td>
              <td className="px-5 py-4">
                <p className="max-w-[240px] text-xs leading-relaxed text-warm-600">{share.note}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 to-teal-700 p-6 text-white shadow-md md:col-span-2">
          <div className="islamic-pattern absolute inset-0 opacity-[0.05]" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-teal-100">Jumlah Harta Bersih</p>
            <p className="text-3xl font-bold tracking-tight">RM {currency(result.netEstate)}</p>
            <p className="mt-2 text-xs text-teal-200 opacity-80">Selepas harta sepencarian, kos, hutang dan wasiat yang dibenarkan</p>
          </div>
          <Wallet className="absolute -bottom-3 -right-3 h-24 w-24 opacity-10" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-warm-200 bg-white p-6 shadow-sm">
          {result.requiresExpertReview ? (
            <>
              <div>
                <p className="mb-1 text-sm font-medium text-warm-500">Status Kiraan</p>
                <p className="text-xl font-bold text-rose-700">Perlu semakan</p>
                <p className="mt-1 text-xs text-warm-400">Tiada agihan dikeluarkan</p>
              </div>
              <div className="rounded-full bg-rose-50 p-4 text-rose-600"><AlertTriangle className="h-6 w-6" /></div>
            </>
          ) : (
            <>
              <div>
                <p className="mb-1 text-sm font-medium text-warm-500">Waris Layak</p>
                <p className="text-3xl font-bold text-warm-800">
                  {result.eligibleHeirCount}
                  <span className="ml-2 text-sm font-normal text-warm-400">orang</span>
                </p>
                <p className="mt-1 text-xs text-warm-400">Asal masalah: {result.asalMasalah}</p>
              </div>
              <div className="rounded-full bg-teal-50 p-4 text-teal-600"><Users className="h-6 w-6" /></div>
            </>
          )}
        </div>
      </div>

      {result.requiresExpertReview && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
            <div>
              <h3 className="font-bold text-rose-900">Kes ini memerlukan semakan pakar</h3>
              <p className="mt-1 text-sm leading-relaxed text-rose-800">
                Maklumat belum mencukupi atau kes ini berada di luar pengiraan automatik yang disokong. Sistem tidak menghasilkan jadual angka supaya anggaran tidak disalah anggap sebagai pembahagian muktamad.
              </p>
            </div>
          </div>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          {result.warnings.map((warning, index) => (
            <div key={index} className="flex gap-2 text-sm leading-relaxed text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {!result.requiresExpertReview && (
        <div className="space-y-4 rounded-2xl border border-warm-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-warm-800">Perincian Pembahagian</h3>
              <p className="text-xs text-warm-500">Pecahan dikira secara tepat sebelum ditukar kepada Ringgit.</p>
            </div>
            <span className="rounded-full border border-gold-200 bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-700">Mazhab Syafi&apos;i</span>
          </div>

          <DistributionTable shares={result.distribution} title="Pembahagian utama" />

          {result.isAul && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div><strong>Al-&apos;Aul:</strong> jumlah bahagian fardu melebihi satu dan penyebut telah dinaikkan secara tepat.</div>
            </div>
          )}

          {result.alternativeRaddDistribution && (
            <details className="group rounded-xl border border-teal-200 bg-teal-50/40">
              <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-teal-900">Lihat alternatif dengan radd</summary>
              <div className="space-y-3 border-t border-teal-200 p-4">
                <p className="text-xs leading-relaxed text-teal-800">Baki dipulangkan secara berkadar kepada waris fardu yang layak; pasangan kekal pada bahagian asal.</p>
                <DistributionTable shares={result.alternativeRaddDistribution} title="Pembahagian alternatif radd" />
              </div>
            </details>
          )}
        </div>
      )}

      {result.blockedHeirs.length > 0 && (
        <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-warm-500" />
            <div>
              <h3 className="font-bold text-warm-800">Waris terdinding</h3>
              <p className="text-xs text-warm-500">Mereka direkodkan tetapi tidak menerima bahagian dalam kes ini.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {result.blockedHeirs.map(heir => (
              <div key={heir.id} className="rounded-xl border border-warm-200 bg-warm-50 p-3">
                <p className="text-sm font-bold text-warm-800">{heir.type} <span className="font-normal text-warm-500">({heir.count})</span></p>
                <p className="mt-1 text-xs leading-relaxed text-warm-600">{heir.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
