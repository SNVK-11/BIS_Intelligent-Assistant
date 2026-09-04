import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  Tag,
  Shield,
  Layers,
} from 'lucide-react';
import { StandardItem } from '../types';
import { BIS_STANDARDS_DATABASE } from '../data/bisKnowledge';

interface StandardsExplorerProps {
  language: 'en' | 'hi';
  onAskChat: (query: string) => void;
  onViewLabs: (standardCode: string) => void;
  initialSearchCode?: string;
}

export const StandardsExplorer: React.FC<StandardsExplorerProps> = ({
  language,
  onAskChat,
  onViewLabs,
  initialSearchCode = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchCode);
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [qcoOnly, setQcoOnly] = useState<boolean>(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(
    initialSearchCode || BIS_STANDARDS_DATABASE[0].code
  );

  const sectors = [
    'All',
    'Consumer Goods',
    'Food & Agriculture',
    'Electronics & IT',
    'Civil & Construction',
    'Automotive & Safety',
    'Textiles & Toys',
  ];

  const filteredStandards = useMemo(() => {
    return BIS_STANDARDS_DATABASE.filter(item => {
      const matchesSector = selectedSector === 'All' || item.sector === selectedSector;
      const matchesQCO = !qcoOnly || item.isMandatoryQCO;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.hindiTitle && item.hindiTitle.includes(searchTerm)) ||
        item.applicableProducts.some(p => p.toLowerCase().includes(q));

      return matchesSector && matchesQCO && matchesSearch;
    });
  }, [selectedSector, qcoOnly, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'भारतीय मानक (IS) रिपॉजिटरी' : 'Indian Standards (IS) Repository'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'भारतीय मानक ब्यूरो द्वारा अधिसूचित मानकों, अनुमत परीक्षणों और अनिवार्य QCO आदेशों की सूची।'
              : 'Browse indexed Indian Standards with clause specifications, Quality Control Orders (QCOs), and test criteria.'}
          </p>
        </div>

        {/* Total count badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs">
            {filteredStandards.length} Standards Indexed
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-semibold text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            2026 Updated QCOs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by IS code (e.g. IS 5522), title, or product..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:bg-white transition-all text-slate-900"
            />
          </div>

          {/* QCO Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={qcoOnly}
                onChange={e => setQcoOnly(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 border-slate-300"
              />
              <span className="text-rose-700 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Mandatory QCOs Only
              </span>
            </label>
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Sector:
          </span>
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`whitespace-nowrap px-3 py-1 rounded-full font-medium text-xs transition-all ${
                selectedSector === sec
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Standards List */}
      <div className="space-y-3.5">
        {filteredStandards.map(std => {
          const isExpanded = expandedCode === std.code;

          return (
            <div
              key={std.code}
              className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs ${
                isExpanded ? 'border-slate-300 shadow-xs ring-1 ring-slate-200' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Card Header / Summary Row */}
              <div
                onClick={() => setExpandedCode(isExpanded ? null : std.code)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 font-mono">
                      {std.code}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                      {std.scheme}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {std.sector}
                    </span>
                    {std.isMandatoryQCO ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Mandatory QCO
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Voluntary
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    {std.title}
                  </h3>
                  {std.hindiTitle && (
                    <p className="text-xs text-slate-500 font-hindi">
                      {std.hindiTitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Annual Fee</span>
                    <span className="font-semibold text-emerald-700">{std.markingFeeAnnual.split(' ')[0]}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 text-xs sm:text-sm">
                  {/* QCO Information Notice */}
                  {std.qcoDetails && (
                    <div className="mb-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        <Shield className="w-4 h-4 text-amber-700" />
                        <span>Governing Order: {std.qcoDetails.orderName}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Ministry:</strong> {std.qcoDetails.ministry} • <strong>Status:</strong> {std.qcoDetails.effectiveDate}
                      </p>
                      <p className="text-xs text-rose-700 font-medium mt-1">
                        ⚖️ {std.qcoDetails.penaltyClause}
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {std.descriptionEn}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Clauses */}
                    <div>
                      <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Standard Clauses & Parameters
                      </h4>
                      <div className="space-y-2">
                        {std.keyClauses.map((clause, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs shadow-2xs"
                          >
                            <div className="font-semibold text-slate-900 mb-0.5">
                              {clause.clauseNumber}: {clause.clauseTitle}
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px]">{clause.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Critical Laboratory Tests */}
                    <div>
                      <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        Mandatory Compliance Tests
                      </h4>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs shadow-2xs">
                        {std.criticalTests.map((test, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-2 text-slate-700">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{test}</span>
                          </div>
                        ))}
                      </div>

                      {/* Products covered */}
                      <div className="mt-4">
                        <span className="text-slate-500 text-xs font-semibold block mb-1.5">
                          Products under scope:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {std.applicableProducts.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewLabs(std.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        View Testing Labs
                      </button>

                      <button
                        onClick={() => onAskChat(`What are the testing and certification requirements for ${std.code} (${std.title})?`)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Ask AI Assistant</span>
                      </button>
                    </div>

                    <a
                      href={`https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/${encodeURIComponent(std.code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Official BIS Standards Portal</span>
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredStandards.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
            <p className="text-slate-500 font-medium">No Indian Standards matched your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSector('All');
                setQcoOnly(false);
              }}
              className="mt-2 text-xs font-semibold text-amber-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
