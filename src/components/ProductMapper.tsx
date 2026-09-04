import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Layers,
  Scale,
  Download,
} from 'lucide-react';
import { StandardItem } from '../types';
import { BIS_STANDARDS_DATABASE } from '../data/bisKnowledge';

interface ProductMapperProps {
  language: 'en' | 'hi';
  onAskChat: (query: string) => void;
  onViewLabs: (standardCode: string) => void;
}

export const ProductMapper: React.FC<ProductMapperProps> = ({
  language,
  onAskChat,
  onViewLabs,
}) => {
  const [searchQuery, setSearchQuery] = useState('Stainless steel utensils');
  const [selectedStandard, setSelectedStandard] = useState<StandardItem | null>(
    BIS_STANDARDS_DATABASE[0]
  );
  const [isSearching, setIsSearching] = useState(false);

  const sampleProducts = [
    'Stainless steel utensils',
    'Domestic pressure cooker',
    'Packaged drinking water bottle',
    'Motorcycle helmet',
    'Lithium-ion power bank',
    'Gold jewellery ring',
    'Portland cement PPC',
    'Children plastic toys',
    'PVC insulated house wire',
    'Portable fire extinguisher',
    'Self-ballasted LED bulb',
    'TMT steel reinforcement bars',
    'Electric vehicle battery',
  ];

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setIsSearching(true);

    setTimeout(() => {
      const lower = term.toLowerCase();
      const match = BIS_STANDARDS_DATABASE.find(
        s =>
          s.applicableProducts.some(p => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase())) ||
          s.title.toLowerCase().includes(lower) ||
          s.code.toLowerCase().includes(lower) ||
          (s.hindiTitle && s.hindiTitle.includes(term))
      );

      if (match) {
        setSelectedStandard(match);
      } else {
        // Fallback closest
        setSelectedStandard(BIS_STANDARDS_DATABASE[0]);
      }
      setIsSearching(false);
    }, 200);
  };

  const handleDownloadGuidanceSheet = (item: StandardItem) => {
    const text = `====================================================
PRODUCT COMPLIANCE ROADMAP - BIS TECH WARRIORS
Bureau of Indian Standards Compliance Advisory
====================================================

Target Product: ${searchQuery}
Recommended Indian Standard: ${item.code} - ${item.title}
Sector: ${item.sector}
Applicable Scheme: ${item.scheme}
Mandatory QCO Status: ${item.isMandatoryQCO ? 'MANDATORY QUALITY CONTROL ORDER ENFORCED' : 'Voluntary Scheme'}

${item.qcoDetails ? `QCO Order: ${item.qcoDetails.orderName}
Governing Ministry: ${item.qcoDetails.ministry}
Effective Status: ${item.qcoDetails.effectiveDate}
Legal Penalty Clause: ${item.qcoDetails.penaltyClause}\n` : ''}

KEY CLAUSES & COMPLIANCE REQUIREMENTS:
${item.keyClauses.map(c => `• ${c.clauseNumber} (${c.clauseTitle}):\n  ${c.summary}`).join('\n\n')}

CRITICAL LABORATORY TESTS REQUIRED:
${item.criticalTests.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

ESTIMATED ANNUAL MARKING FEE:
${item.markingFeeAnnual}

NEXT STEPS FOR INDUSTRY / MSME:
1. Review raw material grade specifications against ${item.code}.
2. Set up required in-house test equipment or verify factory quality plan.
3. Submit application Form-V on manakonline.in under ${item.scheme}.
4. Prepare for official BIS factory audit and sample drawing.

Generated via BIS TECH Warriors AI Platform.
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIS_Roadmap_${item.code.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero / Guidance Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white mb-6 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Standard Identification Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'hi' ? 'उत्पाद से भारतीय मानक (IS) मैपिंग' : 'Product-to-Standard AI Mapper'}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {language === 'hi'
                ? 'अपने उत्पाद का नाम या विवरण दर्ज करें और तुरंत लागू होने वाले भारतीय मानक (IS), अनिवार्य QCO आदेश और प्रयोगशाला परीक्षण की जानकारी प्राप्त करें।'
                : 'Enter any product description to instantly identify the governing Indian Standard (IS Code), certification scheme, mandatory QCO legal status, and testing protocols.'}
            </p>
          </div>

          <button
            onClick={() => onAskChat(searchQuery ? `What BIS certification is required for ${searchQuery}?` : 'What BIS certification is required for stainless steel utensils?')}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
          >
            <span>Ask AI Assistant for {searchQuery || 'Product'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-5">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="e.g., Stainless steel utensils, Helmet, Pressure cooker, Water bottle, Power bank, Gold..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-28 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-1.5 top-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition-colors shadow-2xs"
            >
              Analyze
            </button>
          </div>

          {/* Quick Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 whitespace-nowrap font-medium pr-1">Quick examples:</span>
            {sampleProducts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(p)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full transition-all border text-xs ${
                  searchQuery.toLowerCase() === p.toLowerCase()
                    ? 'bg-white text-slate-950 font-semibold border-white shadow-2xs'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/70'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {selectedStandard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Standard Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {selectedStandard.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
                    {selectedStandard.scheme}
                  </span>
                </div>

                {selectedStandard.isMandatoryQCO ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Mandatory QCO Enforced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Voluntary Certification
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedStandard.title}
                </h3>
                {selectedStandard.hindiTitle && (
                  <p className="text-sm font-medium text-slate-500 mt-0.5 font-hindi">
                    {selectedStandard.hindiTitle}
                  </p>
                )}
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedStandard.descriptionEn}
                </p>
              </div>

              {/* Mandatory QCO Box */}
              {selectedStandard.qcoDetails && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs sm:text-sm text-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Regulatory Order: {selectedStandard.qcoDetails.orderName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-slate-500">Ministry: </span>
                      <span className="font-medium text-slate-800">
                        {selectedStandard.qcoDetails.ministry}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Timeline: </span>
                      <span className="font-medium text-slate-800">
                        {selectedStandard.qcoDetails.effectiveDate}
                      </span>
                    </div>
                    <div className="sm:col-span-2 text-rose-700 font-medium">
                      ⚠️ {selectedStandard.qcoDetails.penaltyClause}
                    </div>
                  </div>
                </div>
              )}

              {/* Key Clauses Breakdown */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  Key Clauses & Specifications ({selectedStandard.code})
                </h4>
                <div className="space-y-2.5">
                  {selectedStandard.keyClauses.map((clause, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-all text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-900">
                          {clause.clauseNumber}: {clause.clauseTitle}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs">{clause.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Laboratory Tests Required */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Mandatory Laboratory Tests for Compliance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedStandard.criticalTests.map((test, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewLabs(selectedStandard.code)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Find Labs Testing {selectedStandard.code}</span>
                  </button>

                  <button
                    onClick={() => onAskChat(`Explain step by step how an industry can get BIS license for ${selectedStandard.code}`)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-slate-200/80"
                  >
                    <span>Detailed Roadmap</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleDownloadGuidanceSheet(selectedStandard)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Download Advisory (TXT)
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Quick Facts & Application Roadmap */}
          <div className="space-y-6">
            {/* Quick Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Standard Quick Facts
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Sector</span>
                  <span className="font-medium text-slate-800">{selectedStandard.sector}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Certification Scheme</span>
                  <span className="font-semibold text-sky-700">{selectedStandard.scheme}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Recognized Labs in India</span>
                  <span className="font-medium text-slate-800">
                    {selectedStandard.recognizedLabsCount} Apex / NABL Labs
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Annual Marking Fee</span>
                  <span className="font-semibold text-emerald-700 text-right">
                    {selectedStandard.markingFeeAnnual}
                  </span>
                </div>
                <div className="py-2">
                  <span className="text-slate-500 block mb-1.5">Applicable Product Scope:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedStandard.applicableProducts.map((prod, pIdx) => (
                      <span
                        key={pIdx}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-step certification process */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                4-Step Certification Process
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">Register on Manakonline</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      File Form-V with factory layout, manufacturing machinery, and test equipment list.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">Factory Audit & Sample Drawing</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      BIS Technical Officer inspects in-house quality control and draws independent sealed samples.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">BIS Recognized Lab Testing</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Drawn samples are tested against all clauses of {selectedStandard.code}.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">Grant of ISI License (CM/L)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      License issued granting right to imprint the official ISI Mark with your CM/L number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Open Official Manakonline Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
