import React from 'react';
import { BookOpen, AlertCircle, HelpCircle, CheckCircle2, Calculator, MessageCircle } from 'lucide-react';

interface FaraidGuideProps {
  onNavigate?: (view: string) => void;
}

const FaraidGuide: React.FC<FaraidGuideProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 space-y-10">
      
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
          <BookOpen className="w-6 h-6 text-emerald-700" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Memahami Faraid di Malaysia</h2>
        <p className="text-slate-600 leading-relaxed">
          Faraid adalah undang-undang pewarisan Islam. Di Malaysia, ia adalah kaedah lalai (default) untuk pembahagian harta pusaka orang Islam kecuali semua waris bersetuju dengan kaedah lain (Takharuj).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1 */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
            Perkara Wajib Sebelum Faraid
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Sebelum harta dibahagikan mengikut Faraid, perkara berikut mesti diselesaikan daripada harta kasar:
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-emerald-600">1.</span>
              <span><strong>Kos Pengurusan Jenazah:</strong> Kos yang munasabah untuk memandi, mengafan, dan mengebumikan jenazah.</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-emerald-600">2.</span>
              <span><strong>Hutang:</strong> Hutang kepada Allah (Zakat, Fidyah, Kaffarah) dan hutang sesama manusia.</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-emerald-600">3.</span>
              <span><strong>Harta Sepencarian:</strong> Harta yang dituntut oleh pasangan yang masih hidup (biasanya sebahagian daripada harta perolehan bersama) di Mahkamah Syariah.</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-emerald-600">4.</span>
              <span><strong>Wasiat:</strong> Maksimum 1/3 daripada baki harta untuk bukan waris atau tujuan amal jariah.</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
           <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-800">
            <HelpCircle className="w-5 h-5" />
            Waris Utama (Ashab al-Furud)
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Waris utama yang tidak akan terhalang daripada mewarisi harta (kecuali terdapat halangan seperti pembunuhan atau berlainan agama).
          </p>
          <div className="space-y-3">
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                <h4 className="font-semibold text-emerald-900 text-sm">Pasangan (Suami/Isteri)</h4>
                <p className="text-xs text-slate-600 mt-1">Suami mendapat 1/2 (tiada anak) atau 1/4 (ada anak). Isteri mendapat 1/4 (tiada anak) atau 1/8 (ada anak).</p>
            </div>
             <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                <h4 className="font-semibold text-emerald-900 text-sm">Ibu Bapa</h4>
                <p className="text-xs text-slate-600 mt-1">Bapa dan Ibu masing-masing mendapat 1/6 jika si mati mempunyai anak.</p>
            </div>
             <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                <h4 className="font-semibold text-emerald-900 text-sm">Anak-anak</h4>
                <p className="text-xs text-slate-600 mt-1">Anak lelaki dan perempuan mengambil baki (Asabah). Anak lelaki menerima dua kali ganda bahagian anak perempuan (Nisbah 2:1).</p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
        <h4 className="flex items-center gap-2 font-bold text-yellow-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            Penafian (Disclaimer)
        </h4>
        <p className="text-sm text-yellow-800/80 leading-relaxed">
            Kalkulator ini adalah untuk tujuan pendidikan dan memberikan anggaran berdasarkan Mazhab Syafi'i yang diamalkan di Malaysia. Kes-kes rumit yang melibatkan datuk, saudara-mara (Kalalah), atau isteri berbilang hendaklah dirujuk kepada Peguam Syarie bertauliah atau unit pusaka di institusi seperti Amanah Raya atau Baitulmal.
        </p>
      </div>

      {onNavigate && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Calculator className="w-5 h-5" />
            Cuba Kalkulator Faraid
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Hubungi Kami
          </button>
        </div>
      )}

    </div>
  );
};

export default FaraidGuide;
