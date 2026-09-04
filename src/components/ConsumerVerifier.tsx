import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Award,
  AlertCircle,
  HelpCircle,
  FileWarning,
  ExternalLink,
} from 'lucide-react';

interface ConsumerVerifierProps {
  language: 'en' | 'hi';
  onAskChat: (query: string) => void;
}

export const ConsumerVerifier: React.FC<ConsumerVerifierProps> = ({
  language,
  onAskChat,
}) => {
  const [activeTab, setActiveTab] = useState<'huid' | 'cml' | 'complaints'>('huid');
  const [inputCode, setInputCode] = useState('AB1234');
  const [verificationResult, setVerificationResult] = useState<any>({
    type: 'huid',
    code: 'AB1234',
    isValidFormat: true,
    mockResult: {
      purity: '22 Karat (916 Fineness)',
      articleType: 'Gold Jewellery Article',
      hallmarkingCenter: 'AHC Code: 07-MH-AHC-104 (Mumbai Central Assaying Centre)',
      jewellerName: 'Certified Registered Retail Jeweller',
      status: 'Active & Verified',
      hallmarkingDate: '14-Oct-2024',
    },
    explanation:
      'Valid 6-character HUID alphanumeric format! On the official BIS CARE app, this code matches an authentic hallmarked gold article assayed at an authorized center with 22K916 purity.',
    checklist: [
      'Matches BIS Central Portal HUID registry.',
      'Article contains BIS Triangular Emblem.',
      'Registered Assaying and Hallmarking Centre (AHC) certified.',
      'Invoice contains matching HUID.',
    ],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'huid' ? 'huid' : 'cml',
          code: inputCode.trim(),
        }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'hi'
                ? 'उपभोक्ता संरक्षण व हॉलमार्क सत्यापन'
                : 'Consumer Verification & Hallmarking Center'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'सोने के गहनों पर 6 अंकों का HUID कोड, उत्पादों पर ISI लाइसेंस नंबर (CM/L) जांचें और शिकायत दर्ज करने की प्रक्रिया समझें।'
              : 'Verify 6-digit HUID gold hallmarking, inspect CM/L license validity, and understand consumer grievance escalation.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/70">
          <button
            onClick={() => {
              setActiveTab('huid');
              setInputCode('AB1234');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'huid'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🥇 Gold HUID Verifier
          </button>
          <button
            onClick={() => {
              setActiveTab('cml');
              setInputCode('8100234');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cml'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏷️ ISI License (CM/L)
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'complaints'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ Consumer Complaints
          </button>
        </div>
      </div>

      {/* Mode 1: HUID & CM/L Verification Tool */}
      {activeTab !== 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Form & Output */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
                {activeTab === 'huid'
                  ? 'Verify 6-Digit Gold Hallmark Unique Identification (HUID)'
                  : 'Verify ISI Mark CM/L License Number'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {activeTab === 'huid'
                  ? 'Enter the 6-character laser-etched code stamped on the gold article alongside the BIS triangle logo and caratage (e.g. AB1234).'
                  : 'Enter the 7 or 8 digit license number found under the ISI mark on packaged goods (e.g. 8100234).'}
              </p>

              {/* Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    placeholder={activeTab === 'huid' ? 'e.g. AB1234 or 9Z82K1' : 'e.g. 8100234'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm uppercase tracking-wider font-mono font-semibold bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:bg-white text-slate-900 transition-all"
                    maxLength={activeTab === 'huid' ? 6 : 10}
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-xs shrink-0"
                >
                  {isLoading ? 'Verifying...' : 'Verify Authenticity'}
                </button>
              </div>

              {/* Sample Code Prompts */}
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <span className="font-medium">Try sample code:</span>
                {activeTab === 'huid' ? (
                  <>
                    <button
                      onClick={() => setInputCode('AB1234')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono font-semibold text-slate-700 text-xs transition-colors"
                    >
                      AB1234
                    </button>
                    <button
                      onClick={() => setInputCode('9Z82K1')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono font-semibold text-slate-700 text-xs transition-colors"
                    >
                      9Z82K1
                    </button>
                    <button
                      onClick={() => setInputCode('FAKE12')}
                      className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 font-mono font-semibold text-rose-700 text-xs transition-colors"
                    >
                      TEST INVALID
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setInputCode('8100234')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono font-semibold text-slate-700 text-xs transition-colors"
                    >
                      8100234 (Stainless Steel)
                    </button>
                    <button
                      onClick={() => setInputCode('9200456')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono font-semibold text-slate-700 text-xs transition-colors"
                    >
                      9200456 (Drinking Water)
                    </button>
                  </>
                )}
              </div>

              {/* Verification Output */}
              {verificationResult && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div
                    className={`p-4 rounded-xl border ${
                      verificationResult.isValidFormat
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {verificationResult.isValidFormat ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {verificationResult.code}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              verificationResult.isValidFormat
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {verificationResult.isValidFormat
                              ? 'Valid Format & Registered'
                              : 'Format Inconsistent / Unverified'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700">
                          {verificationResult.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Mock Record Details */}
                    {verificationResult.mockResult && (
                      <div className="mt-4 pt-3 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {verificationResult.mockResult.purity && (
                          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                              Purity Grade
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {verificationResult.mockResult.purity}
                            </span>
                          </div>
                        )}
                        {verificationResult.mockResult.standard && (
                          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                              Governing Standard
                            </span>
                            <span className="font-bold text-slate-900 font-mono">
                              {verificationResult.mockResult.standard}
                            </span>
                          </div>
                        )}
                        {verificationResult.mockResult.hallmarkingCenter && (
                          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 sm:col-span-2 shadow-2xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                              Assaying Center
                            </span>
                            <span className="font-medium text-slate-800">
                              {verificationResult.mockResult.hallmarkingCenter}
                            </span>
                          </div>
                        )}
                        {verificationResult.mockResult.licenseeName && (
                          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 sm:col-span-2 shadow-2xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                              Certified Manufacturer
                            </span>
                            <span className="font-bold text-slate-900">
                              {verificationResult.mockResult.licenseeName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checklist */}
                    {verificationResult.checklist && (
                      <div className="mt-4 pt-3 border-t border-emerald-200/60">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-2">
                          Consumer Verification Checklist
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-700">
                          {verificationResult.checklist.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: The 3 Mandatory Hallmarks Visual Guide */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold text-[11px] mb-2.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Consumer Education
              </span>
              <h4 className="font-bold text-lg text-white tracking-tight leading-tight">
                The 3 Mandatory Marks on Gold Jewellery
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Under BIS regulations, every genuine hallmarked piece MUST contain all three:
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <span className="font-semibold text-xs text-amber-300 block">
                    1. BIS Triangular Standard Mark
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Official triangular logo of the Bureau of Indian Standards stamped by laser.
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <span className="font-semibold text-xs text-amber-300 block">
                    2. Purity in Karat and Fineness
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Explicitly indicates karat grade: <strong>22K916</strong> (91.6% pure), <strong>18K750</strong> (75%), <strong>14K585</strong> (58.5%).
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <span className="font-semibold text-xs text-amber-300 block">
                    3. 6-Digit Alphanumeric HUID
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Unique identifier (e.g. <strong>AB1234</strong>) laser-etched onto the gold, guaranteeing digital traceability.
                  </span>
                </div>
              </div>

              {/* BIS Care app highlight */}
              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="text-xs leading-tight">
                  <span className="font-bold block text-white">
                    Use the Official BIS CARE App
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Available on iOS and Android for instant 1-tap HUID barcode scanning.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Consumer Grievance Guide */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-rose-600" />
              <span>How to File a Complaint Against Substandard Goods or Fake ISI Marks</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consumers have statutory rights under the <strong>BIS Act 2016</strong> to demand re-testing, refunds, and punitive action against counterfeit marks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Via BIS CARE Mobile App</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download the official app, tap <strong>'Complaints'</strong>, upload photos of the product and ISI logo/CM/L number, and provide the retail store address.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Online National Consumer Helpline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lodge grievances at <strong>consumerhelpline.gov.in</strong> or call toll-free <strong>1915</strong> for immediate assistance with consumer court filings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">BIS Vigilance Directorate</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Email the Central Vigilance Officer at <strong>complaints@bis.gov.in</strong>. BIS enforcement teams conduct search-and-seizure raids on spurious manufacturers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs sm:text-sm text-rose-900">
            <h4 className="font-bold mb-1 flex items-center gap-1.5 text-rose-950">
              <AlertCircle className="w-4 h-4 text-rose-700" />
              Penalties for Misuse of ISI Mark (Section 29, BIS Act 2016)
            </h4>
            <p className="leading-relaxed">
              Any person or business manufacturing, storing, distributing, or selling products bearing a bogus or unauthorized ISI mark is liable to imprisonment up to <strong>2 years</strong>, or fine not less than <strong>₹2 Lakhs</strong> (which may extend up to 10 times the value of goods seized), or both.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
