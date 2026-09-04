import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  FlaskConical,
  Award,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { BIS_LABS_DATABASE } from '../data/bisKnowledge';

interface LabFinderProps {
  language: 'en' | 'hi';
  initialStandardFilter?: string;
  onAskChat?: (query: string) => void;
}

export const LabFinder: React.FC<LabFinderProps> = ({
  language,
  initialStandardFilter = '',
  onAskChat,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialStandardFilter);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const states = [
    'All',
    'Delhi',
    'Uttar Pradesh',
    'Maharashtra',
    'Tamil Nadu',
    'West Bengal',
    'Punjab',
    'Karnataka',
    'Gujarat',
  ];

  const categories = [
    'All',
    'Central Lab',
    'Regional Lab',
    'NABL Recognized Partner Lab',
  ];

  const filteredLabs = useMemo(() => {
    return BIS_LABS_DATABASE.filter(lab => {
      const matchesState = selectedState === 'All' || lab.state === selectedState;
      const matchesCategory = selectedCategory === 'All' || lab.category === selectedCategory;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        lab.name.toLowerCase().includes(q) ||
        lab.city.toLowerCase().includes(q) ||
        lab.state.toLowerCase().includes(q) ||
        lab.testingScopes.some(s => s.toLowerCase().includes(q)) ||
        lab.standardsSupported.some(s => s.toLowerCase().includes(q));

      return matchesState && matchesCategory && matchesSearch;
    });
  }, [selectedState, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-sky-600" />
            <span>{language === 'hi' ? 'बीआईएस मान्यता प्राप्त परीक्षण प्रयोगशालाएं' : 'BIS Recognized Laboratory Directory'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'केंद्रीय, क्षेत्रीय एवं NABL मान्यता प्राप्त प्रयोगशालाएं जहां भारतीय मानकों के तहत नमूना परीक्षण किया जाता है।'
              : 'Directory of BIS Central, Regional, and NABL-accredited test laboratories across India for conformity testing.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs">
            {filteredLabs.length} Testing Facilities Listed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by city, lab name, or standard (e.g. IS 5522)..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:bg-white text-slate-900 transition-all"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">State:</span>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-800 font-medium"
            >
              {states.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Type:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-800 font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Laboratories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredLabs.map(lab => (
          <div
            key={lab.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Badge Row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    lab.category === 'Central Lab'
                      ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                      : lab.category === 'Regional Lab'
                      ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {lab.category}
                </span>

                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  NABL 17025
                </span>
              </div>

              {/* Lab Name */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {lab.name}
              </h3>

              {/* Location */}
              <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{lab.address}</span>
              </p>

              {/* Testing Scopes */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Testing Scopes & Capabilities
                </span>
                <div className="flex flex-wrap gap-1">
                  {lab.testingScopes.map((scope, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Standards Supported */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Supported Indian Standards (IS)
                </span>
                <div className="flex flex-wrap gap-1">
                  {lab.standardsSupported.map((std, stIdx) => (
                    <span
                      key={stIdx}
                      className="bg-slate-50 text-slate-800 border border-slate-200 font-mono text-[11px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Contact Row */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <a
                  href={`tel:${lab.contactPhone}`}
                  className="flex items-center gap-1 hover:text-slate-900 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lab.contactPhone}</span>
                </a>
                <a
                  href={`mailto:${lab.contactEmail}`}
                  className="flex items-center gap-1 hover:text-slate-900 font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lab.contactEmail}</span>
                </a>
              </div>

              {onAskChat && (
                <button
                  onClick={() =>
                    onAskChat(
                      `What testing procedures and charges apply at ${lab.name} for Indian Standards?`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors border border-slate-200/80"
                >
                  Ask AI About Lab
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
