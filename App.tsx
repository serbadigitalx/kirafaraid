import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Mail, Shield, FileText, ChevronDown } from 'lucide-react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import DistributionChart from './components/DistributionChart';
import ResultsView from './components/ResultsView';
import FaraidGuide from './components/FaraidGuide';
import { PrivacyPolicy, TermsOfService, ContactUs } from './components/LegalPages';
import { AssetDetails, CalculationResult, Gender, HeirsCount } from './types';
import { calculateFaraid } from './services/faraidEngine';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  const [assets, setAssets] = useState<AssetDetails>({
    grossAssets: 0,
    funeralExpenses: 0,
    debts: 0,
    hartaSepencarian: 0,
    wasiat: 0
  });

  const [heirs, setHeirs] = useState<HeirsCount>({
    spouse: 1,
    sons: 0,
    daughters: 0,
    father: false,
    mother: false
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const safeHeirs = { ...heirs };
    if (gender === Gender.FEMALE && safeHeirs.spouse > 1) safeHeirs.spouse = 1;

    const calcResult = calculateFaraid(gender, safeHeirs, assets);
    setResult(calcResult);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
     if (gender === Gender.FEMALE) {
         setHeirs(prev => ({ ...prev, spouse: prev.spouse > 0 ? 1 : 0 }));
     }
  }, [gender]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderCalculator = () => {
    return (
      <>
        {/* Hero Section */}
        {!result && (
          <section className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 text-white py-20 md:py-28 -mx-4 md:-mx-0 overflow-hidden">
            {/* Islamic geometric pattern overlay */}
            <div className="absolute inset-0 islamic-pattern opacity-[0.04]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-800/50"></div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
              <div className="inline-block px-4 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-300 text-sm font-medium mb-6">
                Mazhab Syafi'i - Malaysia
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 leading-tight">
                Kalkulator Faraid
              </h2>
              <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Kira pembahagian harta pusaka mengikut hukum Islam dengan tepat dan mudah.
              </p>
              <button
                onClick={scrollToForm}
                className="mt-10 inline-flex flex-col items-center gap-2 text-teal-200 hover:text-gold-400 transition group"
              >
                <span className="text-sm font-medium">Mula Pengiraan</span>
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </button>
            </div>
          </section>
        )}

        {/* Compact header strip when results are showing */}
        {result && (
          <section className="relative bg-gradient-to-r from-teal-800 to-teal-700 text-white py-6 -mx-4 md:-mx-0 overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.03]"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
              <h2 className="text-2xl font-bold font-display">Keputusan Pengiraan Faraid</h2>
              <p className="text-teal-200 text-sm mt-1">Pembahagian harta mengikut hukum Islam</p>
            </div>
          </section>
        )}

        {/* Geometric Divider */}
        <div className="gold-separator my-0"></div>

        {/* Calculator Form Section */}
        <section ref={formRef} className="max-w-2xl mx-auto py-12 px-4">
          {!result && (
            <div className="text-center space-y-2 mb-10">
              <h3 className="text-2xl font-bold text-warm-900 font-display">Maklumat Pengiraan</h3>
              <p className="text-warm-600">Masukkan maklumat harta dan waris untuk memulakan pengiraan.</p>
            </div>
          )}
          {result && (
            <details className="mb-8 group">
              <summary className="cursor-pointer flex items-center justify-between p-4 bg-white rounded-xl border border-warm-200 hover:border-teal-300 transition">
                <span className="font-semibold text-warm-800">Kemaskini Maklumat & Kira Semula</span>
                <ChevronDown className="w-5 h-5 text-warm-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4">
                <InputForm
                  gender={gender}
                  setGender={setGender}
                  assets={assets}
                  setAssets={setAssets}
                  heirs={heirs}
                  setHeirs={setHeirs}
                  onCalculate={handleCalculate}
                />
              </div>
            </details>
          )}
          {!result && (
            <InputForm
              gender={gender}
              setGender={setGender}
              assets={assets}
              setAssets={setAssets}
              heirs={heirs}
              setHeirs={setHeirs}
              onCalculate={handleCalculate}
            />
          )}
        </section>

        {/* Results Section */}
        {result && (
          <>
            <div className="gold-separator"></div>
            <section ref={resultsRef} className="max-w-3xl mx-auto py-12 px-4 space-y-8">
              <ResultsView result={result} />

              <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
                <DistributionChart data={result.distribution} />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition"
                >
                  Kira Semula (Reset)
                </button>
              </div>
            </section>
          </>
        )}
      </>
    );
  };

  const navigate = (view: string) => {
    setCurrentView(view);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch(currentView) {
      case 'privacy':
        return <div className="max-w-4xl mx-auto py-8 px-4"><PrivacyPolicy onNavigate={navigate} /></div>;
      case 'tos':
        return <div className="max-w-4xl mx-auto py-8 px-4"><TermsOfService onNavigate={navigate} /></div>;
      case 'contact':
        return <div className="max-w-4xl mx-auto py-8 px-4"><ContactUs onNavigate={navigate} /></div>;
      case 'guide':
         return <div className="mt-8 max-w-4xl mx-auto px-4"><FaraidGuide onNavigate={navigate} /></div>;
      case 'home':
      default:
        return (
          <>
            {renderCalculator()}

            {/* Quick Links Section */}
            <div className="gold-separator"></div>
            <div className="py-12 max-w-2xl mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => navigate('guide')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-warm-200 hover:border-teal-300 hover:bg-teal-50/50 transition group">
                  <BookOpen className="w-5 h-5 text-warm-500 group-hover:text-teal-600 transition" />
                  <span className="text-xs font-medium text-warm-600 group-hover:text-teal-700 transition">Panduan Faraid</span>
                </button>
                <button onClick={() => navigate('contact')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-warm-200 hover:border-teal-300 hover:bg-teal-50/50 transition group">
                  <Mail className="w-5 h-5 text-warm-500 group-hover:text-teal-600 transition" />
                  <span className="text-xs font-medium text-warm-600 group-hover:text-teal-700 transition">Hubungi Kami</span>
                </button>
                <button onClick={() => navigate('privacy')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-warm-200 hover:border-teal-300 hover:bg-teal-50/50 transition group">
                  <Shield className="w-5 h-5 text-warm-500 group-hover:text-teal-600 transition" />
                  <span className="text-xs font-medium text-warm-600 group-hover:text-teal-700 transition">Dasar Privasi</span>
                </button>
                <button onClick={() => navigate('tos')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-warm-200 hover:border-teal-300 hover:bg-teal-50/50 transition group">
                  <FileText className="w-5 h-5 text-warm-500 group-hover:text-teal-600 transition" />
                  <span className="text-xs font-medium text-warm-600 group-hover:text-teal-700 transition">Terma Perkhidmatan</span>
                </button>
              </div>
            </div>

            <div id="guide" className="mt-8 max-w-4xl mx-auto px-4 pb-12">
              <FaraidGuide />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Header onNavigate={navigate} />

      <main className="flex-grow w-full">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-warm-200 mt-auto">
        <div className="gold-separator"></div>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="font-bold text-teal-800 text-xl mb-1 font-display">KiraFaraid</p>
          <p className="text-warm-500 text-xs mb-6">Kalkulator Warisan Islam Malaysia</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-warm-600 mb-8">
             <button onClick={() => setCurrentView('privacy')} className="hover:text-teal-600 transition">Dasar Privasi</button>
             <button onClick={() => setCurrentView('tos')} className="hover:text-teal-600 transition">Terma Perkhidmatan</button>
             <button onClick={() => setCurrentView('contact')} className="hover:text-teal-600 transition">Hubungi Kami</button>
          </div>
          <p className="text-warm-400 text-xs">
            &copy; {new Date().getFullYear()} KiraFaraid. Bukan nasihat perundangan rasmi. Sila rujuk Peguam Syarie untuk pengesahan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
