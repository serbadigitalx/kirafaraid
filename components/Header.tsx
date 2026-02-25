import React from 'react';
import { Scale } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Scale className="w-6 h-6 text-emerald-50" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KiraFaraid</h1>
            <p className="text-xs text-emerald-200 font-medium">Kalkulator Warisan Islam Malaysia</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-200 transition">Kalkulator</button>
          <button onClick={() => onNavigate('guide')} className="hover:text-emerald-200 transition">Panduan</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-emerald-200 transition">Hubungi</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;