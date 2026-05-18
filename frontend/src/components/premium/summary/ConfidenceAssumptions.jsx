import { PremiumCard } from '../shared/PremiumCard';
import { Info } from 'lucide-react';

const CATEGORY_CONFIG = [
  { key: 'electricity', label: 'Electricity', monthsKey: 'filled' },
  { key: 'water', label: 'Water', monthsKey: 'filledWaterMonths' },
  { key: 'waste', label: 'Waste', monthsKey: 'filledWasteMonths' },
  { key: 'governance', label: 'Governance', monthsKey: null },
];

function getModifier(months) {
  if (months == null) return 1.0;
  if (months >= 12) return 1.0;
  if (months >= 9) return 0.95;
  if (months >= 6) return 0.85;
  if (months >= 3) return 0.70;
  return 0.50;
}

function modifierMeta(modifier) {
  if (modifier >= 1.0) return { label: 'Full Confidence', barCls: 'bg-emerald-500', textCls: 'text-emerald-700' };
  if (modifier >= 0.95) return { label: 'High Confidence', barCls: 'bg-teal-500', textCls: 'text-teal-700' };
  if (modifier >= 0.85) return { label: 'Moderate', barCls: 'bg-amber-500', textCls: 'text-amber-700' };
  if (modifier >= 0.70) return { label: 'Low', barCls: 'bg-orange-500', textCls: 'text-orange-700' };
  return { label: 'Very Low', barCls: 'bg-red-500', textCls: 'text-red-700' };
}

const SYSTEM_ASSUMPTIONS = [
  'Missing months are annualized by scaling uploaded months proportionally (uploaded ÷ months × 12).',
  'Confidence modifier is applied to pillar scores: 12 months = 1.00×, 9–11 = 0.95×, 6–8 = 0.85×, 3–5 = 0.70×.',
  'Scope 2 emissions use annualized electricity consumption with the India grid emission factor (0.82 kgCO₂e/kWh).',
  'Scope 1 emissions are calculated from DG diesel (2.68 kgCO₂e/L) and PNG consumption.',
  'Scope 3 emissions are estimated from waste-to-landfill and total water consumption.',
  'Energy intensity is calculated as annualized kWh divided by built-up area (sqft).',
  'Renewable % is capped at 100% to prevent over-reporting from partial-month data.',
  'Certification readiness scores are indicative only and do not replace official audit assessments.',
];

export default function ConfidenceAssumptions({ scores }) {
  if (!scores) return null;

  return (
    <PremiumCard className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Data Reliability
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Confidence & Assumptions</h3>
        <p className="text-sm text-slate-500 mt-1">
          Score confidence levels based on data completeness, and engine assumptions applied.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Confidence bars */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Category Confidence
          </p>
          <div className="space-y-4">
            {CATEGORY_CONFIG.map(({ key, label, monthsKey }) => {
              const months = monthsKey ? (scores[monthsKey] ?? null) : null;
              const modifier = getModifier(months);
              const { label: confLabel, barCls, textCls } = modifierMeta(modifier);
              const pct = Math.round(modifier * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${textCls}`}>{confLabel}</span>
                      <span className="text-xs text-slate-400">
                        {months != null ? `${months} mo` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barCls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assumptions list */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            System Assumptions
          </p>
          <div className="space-y-3">
            {SYSTEM_ASSUMPTIONS.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-slate-500" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PremiumCard>
  );
}