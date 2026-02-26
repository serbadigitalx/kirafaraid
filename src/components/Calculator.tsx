import React, { useState, useRef, useEffect } from 'react';
import InputForm from './InputForm';
import DistributionChart from './DistributionChart';
import ResultsView from './ResultsView';
import { Gender } from '../types';
import type { AssetDetails, CalculationResult, HeirsCount } from '../types';
import { calculateFaraid } from '../services/faraidEngine';

interface CalculatorProps {
  embedded?: boolean;
}

const Calculator: React.FC<CalculatorProps> = ({ embedded = false }) => {
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
  const resultsHeaderRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const safeHeirs = { ...heirs };
    if (gender === Gender.FEMALE && safeHeirs.spouse > 1) safeHeirs.spouse = 1;

    const calcResult = calculateFaraid(gender, safeHeirs, assets);
    setResult(calcResult);

    setTimeout(() => {
      const el = resultsHeaderRef.current;
      if (el) {
        const headerOffset = 64; // sticky header height
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
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

  return (
    <>
      {/* Hero Section — only on homepage */}
      {!embedded && !result && (
        <section className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 text-white py-20 md:py-28 overflow-hidden -mt-8 md:-mt-12">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-bounce"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </section>
      )}

      {/* Compact header strip when results are showing — only on homepage */}
      {!embedded && result && (
        <section ref={resultsHeaderRef} className="relative bg-gradient-to-r from-teal-800 to-teal-700 text-white py-6 overflow-hidden -mt-8 md:-mt-12">
          <div className="absolute inset-0 islamic-pattern opacity-[0.03]"></div>
          <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
            <h2 className="text-2xl font-bold font-display">Keputusan Pengiraan Faraid</h2>
            <p className="text-teal-200 text-sm mt-1">Pembahagian harta mengikut hukum Islam</p>
          </div>
        </section>
      )}

      {/* Geometric Divider */}
      {!embedded && <div className="gold-separator"></div>}

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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-warm-500 group-open:rotate-180 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
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

export default Calculator;
