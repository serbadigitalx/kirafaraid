import React from 'react';
import { Shield, FileText, Mail, ArrowRight } from 'lucide-react';

interface LegalPageProps {
  onNavigate?: (view: string) => void;
}

const RelatedLinks: React.FC<{ links: { label: string; view: string }[]; onNavigate?: (view: string) => void }> = ({ links, onNavigate }) => {
  if (!onNavigate) return null;
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-bold text-slate-700 mb-3">Pautan Berkaitan</h3>
      <div className="flex flex-wrap gap-3">
        {links.map(({ label, view }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition font-medium"
          >
            {label}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-3 text-emerald-800 mb-4">
        <Shield className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Dasar Privasi (Privacy Policy)</h2>
      </div>
      <div className="prose prose-slate text-sm max-w-none">
        <p><strong>Tarikh Berkuatkuasa:</strong> {new Date().toLocaleDateString('ms-MY')}</p>
        <p>Di KiraFaraid, kami menghargai privasi anda. Dasar Privasi ini menerangkan bagaimana kami mengendalikan maklumat apabila anda menggunakan kalkulator faraid kami.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">1. Pengumpulan Maklumat</h3>
        <p>Kalkulator kami beroperasi secara masa nyata (real-time) di pelayar web anda. Kami <strong>tidak menyimpan</strong> data peribadi seperti jumlah harta, struktur keluarga, atau maklumat kewangan anda di pelayan (server) kami. Semua pengiraan berlaku secara tempatan pada peranti anda.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">2. Penggunaan Kuki (Cookies)</h3>
        <p>Laman web ini mungkin menggunakan kuki pihak ketiga, terutamanya daripada Google AdSense, untuk memaparkan iklan yang relevan. Google menggunakan kuki untuk memaparkan iklan berdasarkan lawatan anda ke laman web ini dan laman web lain di internet.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">3. Pautan Luar</h3>
        <p>Laman web ini mungkin mengandungi pautan ke laman web luar (contohnya laman web rasmi jabatan agama). Kami tidak bertanggungjawab ke atas kandungan atau amalan privasi laman web tersebut.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">4. Perubahan Dasar</h3>
        <p>Kami berhak untuk mengubah dasar privasi ini pada bila-bila masa. Sebarang perubahan akan dipaparkan di halaman ini.</p>

        <RelatedLinks onNavigate={onNavigate} links={[
          { label: 'Terma Perkhidmatan', view: 'tos' },
          { label: 'Hubungi Kami', view: 'contact' },
          { label: 'Kalkulator Faraid', view: 'home' },
          { label: 'Panduan Faraid', view: 'guide' },
        ]} />
      </div>
    </div>
  );
};

export const TermsOfService: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-3 text-emerald-800 mb-4">
        <FileText className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Terma Perkhidmatan (Terms of Service)</h2>
      </div>
      <div className="prose prose-slate text-sm max-w-none">
        <p>Dengan menggunakan KiraFaraid, anda bersetuju dengan terma dan syarat berikut:</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">1. Tujuan Pendidikan Sahaja</h3>
        <p>Laman web ini dibangunkan untuk tujuan pendidikan dan simulasi awal sahaja. Ia <strong>bukan</strong> pengganti kepada nasihat undang-undang rasmi atau fatwa daripada pihak berkuasa agama.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">2. Penafian Liabiliti</h3>
        <p>Walaupun kami berusaha untuk memastikan ketepatan algoritma pengiraan berdasarkan Mazhab Syafi'i, KiraFaraid tidak menjamin bahawa keputusan yang dipaparkan adalah 100% tepat untuk semua situasi yang kompleks. Kami tidak bertanggungjawab atas sebarang kerugian atau kesilapan dalam pembahagian harta yang dilakukan berdasarkan maklumat dari laman web ini.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">3. Rujukan Rasmi</h3>
        <p>Pengguna dinasihatkan untuk merujuk kepada Peguam Syarie bertauliah, Mahkamah Syariah, atau Amanah Raya Berhad untuk pengesahan rasmi Sijil Faraid.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-4">4. Harta Intelek</h3>
        <p>Semua kandungan, reka bentuk, dan kod sumber adalah hak cipta KiraFaraid kecuali dinyatakan sebaliknya.</p>

        <RelatedLinks onNavigate={onNavigate} links={[
          { label: 'Dasar Privasi', view: 'privacy' },
          { label: 'Hubungi Kami', view: 'contact' },
          { label: 'Kalkulator Faraid', view: 'home' },
          { label: 'Panduan Faraid', view: 'guide' },
        ]} />
      </div>
    </div>
  );
};

export const ContactUs: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-3 text-emerald-800 mb-4">
        <Mail className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Hubungi Kami</h2>
      </div>
      <div className="prose prose-slate text-sm max-w-none">
        <p>Kami sentiasa berusaha untuk menambah baik KiraFaraid. Jika anda mempunyai sebarang pertanyaan, cadangan, atau menemui ralat pada sistem, sila hubungi kami.</p>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
            <p className="font-semibold text-slate-800">Email:</p>
            <p className="text-emerald-600 mb-4">admin@kirafaraid.my</p>

            <p className="font-semibold text-slate-800">Alamat Surat Menyurat:</p>
            <p className="text-slate-600">
              KiraFaraid Team<br />
              Kuala Lumpur, Malaysia
            </p>
        </div>

        <p className="mt-6 text-xs text-slate-500">
            Nota: Kami adalah pasukan pembangun perisian dan bukan peguam syarie. Soalan berkaitan hukum agama yang kompleks sebaiknya diajukan terus kepada pejabat agama berhampiran anda.
        </p>

        <RelatedLinks onNavigate={onNavigate} links={[
          { label: 'Kalkulator Faraid', view: 'home' },
          { label: 'Panduan Faraid', view: 'guide' },
          { label: 'Dasar Privasi', view: 'privacy' },
          { label: 'Terma Perkhidmatan', view: 'tos' },
        ]} />
      </div>
    </div>
  );
};