import React from 'react';
import { AssetDetails, Gender, HeirsCount } from '../types';
import { Users, Coins, User, Calculator, Minus, Plus, AlertCircle } from 'lucide-react';

interface InputFormProps {
  gender: Gender;
  setGender: (g: Gender) => void;
  assets: AssetDetails;
  setAssets: React.Dispatch<React.SetStateAction<AssetDetails>>;
  heirs: HeirsCount;
  setHeirs: React.Dispatch<React.SetStateAction<HeirsCount>>;
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
  onChange: (val: string) => void;
  placeholder?: string;
  subtext?: string;
}) => (
  <div className="group">
    <label className="block text-sm font-semibold text-warm-700 mb-1.5">{label}</label>
    <div className="relative transition-all duration-200">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gold-500 font-bold text-sm">RM</span>
      </div>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium hover:border-teal-300"
        placeholder={placeholder}
      />
    </div>
    {subtext && <p className="mt-1.5 text-xs text-warm-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {subtext}</p>}
  </div>
);

const Counter = ({ label, value, onIncrement, onDecrement }: { label: string, value: number, onIncrement: () => void, onDecrement: () => void }) => (
  <div className="flex items-center justify-between p-3 bg-warm-50 border border-warm-200 rounded-xl hover:border-teal-300 transition-colors">
    <span className="font-medium text-warm-700 text-sm">{label}</span>
    <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-lg border border-warm-200 shadow-sm">
      <button
        onClick={onDecrement}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-500 hover:bg-warm-100 hover:text-teal-600 transition disabled:opacity-50 active:scale-95"
        disabled={value <= 0}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-bold text-warm-800 w-6 text-center tabular-nums text-sm">{value}</span>
      <button
        onClick={onIncrement}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-500 hover:bg-warm-100 hover:text-teal-600 transition active:scale-95"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const InputForm: React.FC<InputFormProps> = ({
  gender,
  setGender,
  assets,
  setAssets,
  heirs,
  setHeirs,
  onCalculate
}) => {

  const handleAssetChange = (key: keyof AssetDetails, value: string) => {
    const num = parseFloat(value) || 0;
    setAssets(prev => ({ ...prev, [key]: num }));
  };

  const handleHeirChange = (key: keyof HeirsCount, value: number | boolean) => {
    setHeirs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: DECEASED */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="bg-warm-50 px-6 py-4 border-b border-warm-200 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-warm-800 font-display text-lg">1. Maklumat Si Mati</h2>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold text-warm-700 mb-3">Jantina Arwah</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGender(Gender.MALE)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                gender === Gender.MALE
                  ? 'border-teal-500 bg-teal-50/30 text-teal-800'
                  : 'border-warm-200 bg-white text-warm-500 hover:border-teal-300 hover:bg-warm-50'
              }`}
            >
              <div className={`p-3 rounded-full ${gender === Gender.MALE ? 'bg-teal-100 text-teal-600' : 'bg-warm-100 text-warm-400'}`}>
                <User className="w-6 h-6" />
              </div>
              <span className="font-bold">Lelaki</span>
              <span className="text-xs text-warm-500 font-medium">(Suami)</span>
              {gender === Gender.MALE && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-500" />}
            </button>

            <button
              onClick={() => setGender(Gender.FEMALE)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                gender === Gender.FEMALE
                  ? 'border-teal-500 bg-teal-50/30 text-teal-800'
                  : 'border-warm-200 bg-white text-warm-500 hover:border-teal-300 hover:bg-warm-50'
              }`}
            >
              <div className={`p-3 rounded-full ${gender === Gender.FEMALE ? 'bg-teal-100 text-teal-600' : 'bg-warm-100 text-warm-400'}`}>
                <User className="w-6 h-6" />
              </div>
              <span className="font-bold">Wanita</span>
              <span className="text-xs text-warm-500 font-medium">(Isteri)</span>
              {gender === Gender.FEMALE && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: ASSETS */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="bg-warm-50 px-6 py-4 border-b border-warm-200 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
            <Coins className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-warm-800 font-display text-lg">2. Harta & Liabiliti</h2>
        </div>

        <div className="p-6 space-y-5">
          <CurrencyInput
            label="Jumlah Harta Kasar"
            value={assets.grossAssets}
            onChange={(val) => handleAssetChange('grossAssets', val)}
            placeholder="0.00"
            subtext="Termasuk tunai, hartanah, saham, KWSP, dll."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
             <CurrencyInput
              label="Harta Sepencarian"
              value={assets.hartaSepencarian}
              onChange={(val) => handleAssetChange('hartaSepencarian', val)}
              placeholder="0.00"
              subtext="Tuntutan pasangan"
            />
            <CurrencyInput
              label="Hutang & Kos Jenazah"
              value={assets.debts + assets.funeralExpenses}
              onChange={(val) => handleAssetChange('debts', val)}
              placeholder="0.00"
              subtext="Tolak dari harta"
            />
          </div>

          <div className="pt-2 border-t border-warm-200">
             <CurrencyInput
              label="Wasiat (Bukan Waris)"
              value={assets.wasiat}
              onChange={(val) => handleAssetChange('wasiat', val)}
              placeholder="0.00"
              subtext="Maksimum 1/3 daripada baki bersih"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: HEIRS */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="bg-warm-50 px-6 py-4 border-b border-warm-200 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-warm-800 font-display text-lg">3. Senarai Waris</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Spouse */}
          <div className="flex items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-teal-600 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-teal-900 block">{gender === Gender.MALE ? 'Isteri' : 'Suami'}</span>
                <span className="text-xs text-teal-700">Pasangan hidup</span>
              </div>
            </div>

            {gender === Gender.MALE ? (
              <select
                value={heirs.spouse}
                onChange={(e) => handleHeirChange('spouse', parseInt(e.target.value))}
                className="px-3 py-2 bg-white border border-teal-200 rounded-lg text-sm font-semibold text-teal-800 focus:ring-teal-500 focus:border-teal-500 shadow-sm outline-none cursor-pointer"
              >
                <option value={0}>Tiada / Meninggal</option>
                <option value={1}>1 Isteri</option>
                <option value={2}>2 Isteri</option>
                <option value={3}>3 Isteri</option>
                <option value={4}>4 Isteri</option>
              </select>
            ) : (
               <label className="flex items-center gap-3 cursor-pointer bg-white px-3 py-2 rounded-lg border border-teal-200 shadow-sm hover:border-teal-400 transition">
                 <span className="text-sm font-semibold text-teal-800">Masih Hidup?</span>
                 <div className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${heirs.spouse === 1 ? 'bg-teal-500' : 'bg-warm-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${heirs.spouse === 1 ? 'translate-x-4' : ''}`}></div>
                 </div>
                 <input
                   type="checkbox"
                   checked={heirs.spouse === 1}
                   onChange={(e) => handleHeirChange('spouse', e.target.checked ? 1 : 0)}
                   className="hidden"
                 />
               </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
             {/* Parents */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-warm-500 uppercase tracking-wider">Ibu Bapa</label>
               <div className="flex items-center justify-between p-3 bg-white border border-warm-200 rounded-xl shadow-sm hover:border-teal-300 transition cursor-pointer" onClick={() => handleHeirChange('father', !heirs.father)}>
                   <div className="flex items-center gap-3">
                     <User className="w-4 h-4 text-warm-400" />
                     <span className="font-medium text-warm-700">Bapa</span>
                   </div>
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${heirs.father ? 'bg-teal-500 border-teal-500' : 'border-warm-300 bg-warm-50'}`}>
                      {heirs.father && <div className="w-2 h-2 bg-white rounded-sm" />}
                   </div>
               </div>
               <div className="flex items-center justify-between p-3 bg-white border border-warm-200 rounded-xl shadow-sm hover:border-teal-300 transition cursor-pointer" onClick={() => handleHeirChange('mother', !heirs.mother)}>
                   <div className="flex items-center gap-3">
                     <User className="w-4 h-4 text-warm-400" />
                     <span className="font-medium text-warm-700">Ibu</span>
                   </div>
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${heirs.mother ? 'bg-teal-500 border-teal-500' : 'border-warm-300 bg-warm-50'}`}>
                      {heirs.mother && <div className="w-2 h-2 bg-white rounded-sm" />}
                   </div>
               </div>
            </div>

            {/* Children */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-warm-500 uppercase tracking-wider">Anak-anak</label>
              <Counter
                label="Anak Lelaki"
                value={heirs.sons}
                onIncrement={() => handleHeirChange('sons', heirs.sons + 1)}
                onDecrement={() => handleHeirChange('sons', Math.max(0, heirs.sons - 1))}
              />
              <Counter
                label="Anak Perempuan"
                value={heirs.daughters}
                onIncrement={() => handleHeirChange('daughters', heirs.daughters + 1)}
                onDecrement={() => handleHeirChange('daughters', Math.max(0, heirs.daughters - 1))}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full py-4 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 ring-4 ring-gold-100"
      >
        <Calculator className="w-6 h-6" />
        Kira Pembahagian Faraid
      </button>

    </div>
  );
};

export default InputForm;
