import React from 'react';
import { Scale } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="bg-teal-800/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="p-2 bg-teal-700/60 rounded-lg border border-gold-500/30">
            <Scale className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-display">KiraFaraid</h1>
            <p className="text-xs text-teal-200 font-medium">Kalkulator Warisan Islam Malaysia</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <button onClick={() => onNavigate('home')} className="hover:text-gold-400 transition">Kalkulator</button>
          <button onClick={() => onNavigate('guide')} className="hover:text-gold-400 transition">Panduan</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-gold-400 transition">Hubungi</button>
        </nav>
      </div>
      <div className="gold-separator"></div>
    </header>
  );
};

export default Header;
