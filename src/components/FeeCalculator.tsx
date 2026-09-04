import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  CheckCircle2,
  Building,
  Sparkles,
  HelpCircle,
  Download,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { BIS_SCHEMES } from '../data/bisKnowledge';

interface FeeCalculatorProps {
  language: 'en' | 'hi';
  onAskChat: (query: string) => void;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  language,
  onAskChat,
}) => {
  const [enterpriseScale, setEnterpriseScale] = useState<'micro' | 'small' | 'startup' | 'medium' | 'large'>('micro');
  const [scheme, setScheme] = useState('scheme-1');
  const [isWomenOwned, setIsWomenOwned] = useState(false);
  const [productCategory, setProductCategory] = useState('utensils');

  // Pricing constants (INR)
  const baseFees: Record<string, { app: number; audit: number; marking: number; testingEst: string }> = {
    utensils: { app: 1000, audit: 7000, marking: 21000, testingEst: '₹12,000 - ₹25,000' },
    pressure_cooker: { app: 1000, audit: 7000, marking: 28000, testingEst: '₹18,000 - ₹30,000' },
    water: { app: 1000, audit: 14000, marking: 84000, testingEst: '₹25,000 - ₹45,000' },
    helmets: { app: 1000, audit: 7000, marking: 37000, testingEst: '₹20,000 - ₹35,000' },
    electronics: { app: 1000, audit: 0, marking: 2000, testingEst: '₹35,000 - ₹75,000' },
    cement: { app: 1000, audit: 14000, marking: 110000, testingEst: '₹30,000 - ₹60,000' },
    toys: { app: 1000, audit: 7000, marking: 18000, testingEst: '₹15,000 - ₹30,000' },
  };

  const selectedBase = baseFees[productCategory] || baseFees.utensils;

  // Calculate concession
  let concession = 0;
  if (enterpriseScale === 'micro') {
    concession = 50;
  } else if (enterpriseScale === 'small' || enterpriseScale === 'startup') {
    concession = 20;
  } else if (enterpriseScale === 'medium') {
    concession = 10;
  }

  if (isWomenOwned && concession < 20) {
    concession = 20;
  }

  const payableAppFee = Math.round(selectedBase.app * (1 - concession / 100));
  const payableMarkingFee = Math.round(selectedBase.marking * (1 - concession / 100));
  const auditFee = selectedBase.audit;
  const totalGovtOutlay = payableAppFee + auditFee + payableMarkingFee;
  const savings = selectedBase.app + selectedBase.marking - (payableAppFee + payableMarkingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'hi'
                ? 'एमएसएमई व स्टार्टअप बीआईएस शुल्क गणक'
                : 'MSME & Startup BIS License Fee Calculator'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'मेक इन इंडिया एवं उद्योग संवर्धन के तहत सूक्ष्म (Micro), लघु (Small) एवं स्टार्टअप इकाइयों के लिए सरकारी रियायतों का सटीक आकलन।'
              : 'Calculate government application fee, factory audit charges, minimum marking fee, and 50% / 20% MSME concessions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-semibold text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            50% Concession for Micro Units
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
              Select Enterprise Category & Product Parameters
            </h3>

            {/* Scale Selection */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Enterprise Classification (As per Udyam / DPIIT)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'micro', label: 'Micro Enterprise', sub: 'Turnover < ₹5 Cr', tag: '50% Off' },
                  { id: 'small', label: 'Small Enterprise', sub: 'Turnover < ₹50 Cr', tag: '20% Off' },
                  { id: 'startup', label: 'DPIIT Startup', sub: 'Recognized Entity', tag: '20% Off' },
                  { id: 'medium', label: 'Medium Unit', sub: 'Turnover < ₹250 Cr', tag: '10% Off' },
                  { id: 'large', label: 'Large Enterprise', sub: 'Standard Scale', tag: 'Standard' },
                ].map(item => {
                  const isSelected = enterpriseScale === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEnterpriseScale(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400/80 shadow-2xs'
                          : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 block w-fit mb-1">
                        {item.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Category */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Product Category
              </label>
              <select
                value={productCategory}
                onChange={e => setProductCategory(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
              >
                <option value="utensils">Stainless Steel Cookware & Utensils (IS 5522)</option>
                <option value="pressure_cooker">Domestic Pressure Cookers (IS 2347)</option>
                <option value="water">Packaged Drinking Water (IS 14543)</option>
                <option value="helmets">Motorcycle Protective Helmets (IS 4151)</option>
                <option value="electronics">IT / Electronics / Batteries (CRS Scheme-II)</option>
                <option value="cement">Portland Pozzolana Cement (IS 1489)</option>
                <option value="toys">Safety of Children Toys (IS 9873)</option>
              </select>
            </div>

            {/* Women Entrepreneurship Check */}
            <div className="mb-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 cursor-pointer select-none hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isWomenOwned}
                  onChange={e => setIsWomenOwned(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Women-led or Women-owned Enterprise
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Additional special promotional policy benefits may apply for women entrepreneurs.
                  </span>
                </div>
              </label>
            </div>

            {/* Benefit banner */}
            {concession > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    Congratulations! You Qualify for {concession}% Government Concession
                  </span>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    As a verified {enterpriseScale.toUpperCase()} unit, you save{' '}
                    <strong>₹{savings.toLocaleString()}</strong> on the base application and annual minimum marking fee under official BIS circulars.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Estimated Cost Breakdown */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-400 mb-4">
              Estimated Fee Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Application Fee</span>
                <span className="font-bold text-white">
                  ₹{payableAppFee.toLocaleString()}
                  {concession > 0 && (
                    <span className="text-emerald-400 text-[10px] ml-1">({concession}% off)</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Factory Audit (Inspection)</span>
                <span className="font-bold text-white">₹{auditFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Annual Minimum Marking Fee</span>
                <span className="font-bold text-white">
                  ₹{payableMarkingFee.toLocaleString()}
                  {concession > 0 && (
                    <span className="text-emerald-400 text-[10px] ml-1">({concession}% off)</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Lab Testing Charges (Est.)</span>
                <span className="font-bold text-slate-300">{selectedBase.testingEst}</span>
              </div>

              {/* Total Government Outlay */}
              <div className="pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-amber-400 block">Total Estimated Govt Fee</span>
                  <span className="text-[10px] text-slate-400">Excluding 18% GST & lab tests</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  ₹{totalGovtOutlay.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Savings pill */}
            {savings > 0 && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold">
                Total Concession Saved: ₹{savings.toLocaleString()}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() =>
                  onAskChat(
                    `How can a ${enterpriseScale} enterprise claim ${concession}% concession on BIS certification for ${productCategory}?`
                  )
                }
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Ask AI Assistant How to Claim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
