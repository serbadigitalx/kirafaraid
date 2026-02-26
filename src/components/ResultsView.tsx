import React from 'react';
import type { CalculationResult } from '../types';
import { User, Wallet, Users, AlertTriangle } from 'lucide-react';

interface ResultsViewProps {
  result: CalculationResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-800 to-teal-700 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-[0.05]"></div>
          <div className="relative z-10">
            <p className="text-teal-100 text-sm font-medium mb-1">Jumlah Harta Bersih</p>
            <p className="text-3xl font-bold tracking-tight">RM {result.netEstate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-teal-200 mt-2 opacity-80">Selepas tolak hutang & wasiat</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-warm-200 flex items-center justify-between">
           <div>
              <p className="text-warm-500 text-sm font-medium mb-1">Jumlah Waris Layak</p>
              <p className="text-3xl font-bold text-warm-800">
                {result.distribution.reduce((acc, curr) => acc + curr.count, 0)}
                <span className="text-sm font-normal text-warm-400 ml-2">orang</span>
              </p>
           </div>
           <div className="p-4 bg-teal-50 rounded-full text-teal-600">
             <Users className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-warm-200 flex items-center justify-between">
          <h3 className="font-bold text-warm-800 text-lg font-display">Perincian Pembahagian</h3>
          <span className="px-3 py-1 bg-gold-100 text-gold-600 text-xs font-bold rounded-full uppercase tracking-wide border border-gold-200">
             Mazhab Syafi'i
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-warm-500 uppercase bg-warm-50 border-b border-warm-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Waris</th>
                <th className="px-6 py-4 font-semibold text-center">Pecahan</th>
                <th className="px-6 py-4 font-semibold text-right">Jumlah (RM)</th>
                <th className="px-6 py-4 font-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {result.distribution.map((share, idx) => (
                <tr key={idx} className={`transition duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'} hover:bg-teal-50/30`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-warm-100 rounded-lg text-warm-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-warm-800">{share.type}</p>
                        <p className="text-xs text-warm-500">{share.count > 1 ? `${share.count} orang` : 'Seorang'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-600 shadow-sm border border-gold-200">
                      {share.shareFraction}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-teal-700 text-base">
                      {share.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {share.count > 1 && (
                       <p className="text-xs text-warm-400 mt-0.5">
                          ({(share.amount / share.count).toLocaleString(undefined, { maximumFractionDigits: 2 })} / orang)
                       </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-warm-600 text-xs leading-relaxed max-w-[200px]">{share.note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-warm-50 border-t border-warm-200">
               <tr>
                  <td colSpan={2} className="px-6 py-4 font-bold text-warm-700 text-right">Jumlah Keseluruhan:</td>
                  <td className="px-6 py-4 font-bold text-teal-800 text-right text-lg">
                    {result.netEstate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
               </tr>
            </tfoot>
          </table>
        </div>

        {result.isAul && (
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <span className="font-bold block mb-1">Nota Penting (Al-'Aul):</span>
              Jumlah saham melebihi 1 (pembilang melebihi penyebut). Bahagian setiap waris telah diselaraskan secara berkadar untuk memastikan harta dibahagikan sepenuhnya tanpa defisit.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
