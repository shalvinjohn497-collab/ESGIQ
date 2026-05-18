import { CheckCircle } from 'lucide-react';
import { PremiumCard } from '../shared/PremiumCard';

export default function OperationalStrengths({ strengths }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <PremiumCard className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Strengths
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Operational Strengths</h3>
        <p className="text-sm text-slate-500 mt-1">
          Areas where your facility demonstrates strong ESG performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths.map((s, i) => {
          const text = typeof s === 'string' ? s : (s.strength || s.text || s.label || JSON.stringify(s));
          return (
            <div key={i} className="flex items-start gap-3 border border-emerald-100 bg-emerald-50/40 rounded-2xl p-4">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-slate-700 leading-relaxed">{text}</span>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}
