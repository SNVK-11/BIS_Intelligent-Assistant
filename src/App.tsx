import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ProductMapper } from './components/ProductMapper';
import { StandardsExplorer } from './components/StandardsExplorer';
import { LabFinder } from './components/LabFinder';
import { ConsumerVerifier } from './components/ConsumerVerifier';
import { FeeCalculator } from './components/FeeCalculator';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeStandardForLabs, setActiveStandardForLabs] = useState<string>('');
  const [activeStandardForSpecs, setActiveStandardForSpecs] = useState<string>('');
  const [prefilledChatQuery, setPrefilledChatQuery] = useState<string>('');

  const handleNavigateToLabs = (standardCode?: string) => {
    if (standardCode) {
      setActiveStandardForLabs(standardCode);
    }
    setCurrentTab('labs');
  };

  const handleNavigateToStandards = (code?: string) => {
    if (code) {
      setActiveStandardForSpecs(code);
    }
    setCurrentTab('standards');
  };

  const handleNavigateToCalculator = () => {
    setCurrentTab('calculator');
  };

  const handleAskChat = (query: string) => {
    setPrefilledChatQuery(query);
    setCurrentTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-100 selection:text-slate-900 font-sans antialiased text-slate-900">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
      />

      <main className="flex-1">
        {currentTab === 'chat' && (
          <ChatView
            language={language}
            initialQuery={prefilledChatQuery}
            onNavigateToLabs={handleNavigateToLabs}
            onNavigateToStandards={handleNavigateToStandards}
            onNavigateToCalculator={handleNavigateToCalculator}
          />
        )}

        {currentTab === 'mapper' && (
          <ProductMapper
            language={language}
            onAskChat={handleAskChat}
            onViewLabs={handleNavigateToLabs}
          />
        )}

        {currentTab === 'standards' && (
          <StandardsExplorer
            language={language}
            onAskChat={handleAskChat}
            onViewLabs={handleNavigateToLabs}
            initialSearchCode={activeStandardForSpecs}
          />
        )}

        {currentTab === 'labs' && (
          <LabFinder
            language={language}
            initialStandardFilter={activeStandardForLabs}
            onAskChat={handleAskChat}
          />
        )}

        {currentTab === 'verify' && (
          <ConsumerVerifier
            language={language}
            onAskChat={handleAskChat}
          />
        )}

        {currentTab === 'calculator' && (
          <FeeCalculator
            language={language}
            onAskChat={handleAskChat}
          />
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-5 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-200">
              BIS TECH Warriors — AI-powered Intelligent Assistant for Indian Standards
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Empowering Industries, MSMEs, Startups, Students & Consumers with Citation-Backed Standards Intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://www.services.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              services.bis.gov.in
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://www.manakonline.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              manakonline.in
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://www.crsbis.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              crsbis.in
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
