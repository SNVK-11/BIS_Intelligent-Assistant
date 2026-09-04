import React from 'react';
import { Shield, Sparkles, Languages, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
}) => {
  const navTabs = [
    { id: 'chat', labelEn: 'AI Chat Assistant', labelHi: 'एआई संवाद सहायक', icon: '💬' },
    { id: 'mapper', labelEn: 'Product-to-Standard', labelHi: 'उत्पाद मानक मैपिंग', icon: '🎯' },
    { id: 'standards', labelEn: 'Indian Standards (IS)', labelHi: 'भारतीय मानक (IS)', icon: '📚' },
    { id: 'labs', labelEn: 'Testing Labs Finder', labelHi: 'परीक्षण प्रयोगशालाएं', icon: '🧪' },
    { id: 'verify', labelEn: 'HUID & License Check', labelHi: 'HUID व लाइसेंस सत्यापन', icon: '🛡️' },
    { id: 'calculator', labelEn: 'MSME Fee Calculator', labelHi: 'एमएसएमई शुल्क गणक', icon: '💰' },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-850 sticky top-0 z-40 shadow-xs">
      {/* Top Notification Bar / Official Indian Standards strip */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-200 to-emerald-500 h-[2px] w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-xs border border-amber-300/30 text-slate-950 font-black tracking-wider shrink-0">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  BIS TECH <span className="text-amber-400">Warriors</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  National Standards AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {language === 'hi'
                  ? 'भारतीय मानक ब्यूरो (BIS) एवं उद्योग-उपभोक्ता सेवाओं के लिए एआई सहायक'
                  : 'Intelligent AI Assistant for Indian Standards & BIS Services'}
              </p>
            </div>
          </div>

          {/* Controls: Language Switcher & Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>RAG Citation Engine</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                id="lang-btn-en"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Languages className="w-3 h-3" />
                English
              </button>
              <button
                id="lang-btn-hi"
                onClick={() => setLanguage('hi')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-hindi'
                    : 'text-slate-400 hover:text-slate-200 font-hindi'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-medium">
          {navTabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                  isActive
                    ? 'bg-white text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
