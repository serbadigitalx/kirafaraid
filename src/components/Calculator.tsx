import React, { useState, useRef, useEffect } from 'react';
import InputForm from './InputForm';
import DistributionChart from './DistributionChart';
import ResultsView from './ResultsView';
import { Gender } from '../types';
import type { AssetDetails, CalculationResult, HeirsCount } from '../types';
import { calculateFaraid } from '../services/faraidEngine';

const Calculator: React.FC = () => {
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

export default Calculator;
