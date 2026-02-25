import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Mail, Shield, FileText } from 'lucide-react';
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

  const handleCalculate = () => {
    const safeHeirs = { ...heirs };
    if (gender === Gender.FEMALE && safeHeirs.spouse > 1) safeHeirs.spouse = 1;

    const calcResult = calculateFaraid(gender, safeHeirs, assets);
    setResult(calcResult);

    // Scroll to results only if we are already in the results view (mobile mostly), 
    // but for desktop transition it's instant.
    // Adding a small delay to allow layout shift
    setTimeout(() => {
      if (window.innerWidth < 1024) {
         resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
     if (gender === Gender.FEMALE) {
         setHeirs(prev => ({ ...prev, spouse: prev.spouse > 0 ? 1 : 0 }));
     }
  }, [gender]);

  const renderCalculator = () => {
    // Initial State: Centered Form
    if (!result) {
      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
           <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Kalkulator Faraid</h2>
              <p className="text-slate-600">Masukkan maklumat harta dan waris untuk memulakan pengiraan.</p>
           </div>
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
      );
    }

    // Results State: Side-by-Side (Desktop) or Stacked (Mobile)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 animate-in slide-in-from-bottom-4 duration-700">
        {/* Left Column: Input (Persists) */}
        <div className="lg:col-span-5 space-y-6">
          <InputForm 
            gender={gender}
            setGender={setGender}
            assets={assets}
            setAssets={setAssets}
            heirs={heirs}
            setHeirs={setHeirs}
            onCalculate={handleCalculate}
          />
          {/* Mobile only: Quick jump to top if needed, or just let them scroll */}
        </div>

        {/* Right Column: Results & AI */}
        <div className="lg:col-span-7 space-y-8" ref={resultsRef}>
          <ResultsView result={result} />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <DistributionChart data={result.distribution} />
          </div>
          
          <div className="flex justify-center pt-8">
             <button 
               onClick={() => {
                 setResult(null);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               className="text-sm text-slate-500 hover:text-emerald-600 underline"
             >
               Kira Semula (Reset Paparan)
             </button>
          </div>
        </div>
      </div>
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
        return <PrivacyPolicy onNavigate={navigate} />;
      case 'tos':
        return <TermsOfService onNavigate={navigate} />;
      case 'contact':
        return <ContactUs onNavigate={navigate} />;
      case 'guide':
         return <div className="mt-8 max-w-4xl mx-auto"><FaraidGuide onNavigate={navigate} /></div>;
      case 'home':
      default:
        return (
          <>
            {renderCalculator()}

            {/* Quick Links Section */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => navigate('guide')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group">
                  <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700 transition">Panduan Faraid</span>
                </button>
                <button onClick={() => navigate('contact')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group">
                  <Mail className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700 transition">Hubungi Kami</span>
                </button>
                <button onClick={() => navigate('privacy')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group">
                  <Shield className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700 transition">Dasar Privasi</span>
                </button>
                <button onClick={() => navigate('tos')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700 transition">Terma Perkhidmatan</span>
                </button>
              </div>
            </div>

            <div id="guide" className="mt-24 max-w-4xl mx-auto">
              <FaraidGuide />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header onNavigate={navigate} />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-bold text-emerald-900 text-xl mb-6">KiraFaraid</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600 mb-8">
             <button onClick={() => setCurrentView('privacy')} className="hover:text-emerald-600 transition">Dasar Privasi</button>
             <button onClick={() => setCurrentView('tos')} className="hover:text-emerald-600 transition">Terma Perkhidmatan</button>
             <button onClick={() => setCurrentView('contact')} className="hover:text-emerald-600 transition">Hubungi Kami</button>
          </div>
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} KiraFaraid. Bukan nasihat perundangan rasmi. Sila rujuk Peguam Syarie untuk pengesahan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;