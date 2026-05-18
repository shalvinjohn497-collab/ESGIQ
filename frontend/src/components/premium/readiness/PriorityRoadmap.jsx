import { PremiumCard } from '../shared/PremiumCard';
import { AlertTriangle, Clock, TrendingUp, Lightbulb, Leaf } from 'lucide-react';

const LANES = [
  { key: 'immediate', label: 'Immediate', sub: '< 30 days', color: 'bg-red-50 border-red-200', headerCls: 'text-red-700 bg-red-100', dot: 'bg-red-500', Icon: AlertTriangle, iconCls: 'text-red-500' },
  { key: '0-3m', label: '0 – 3 Months', sub: 'Short-term', color: 'bg-orange-50 border-orange-200', headerCls: 'text-orange-700 bg-orange-100', dot: 'bg-orange-500', Icon: Clock, iconCls: 'text-orange-500' },
  { key: '3-6m', label: '3 – 6 Months', sub: 'Mid-term', color: 'bg-amber-50 border-amber-200', headerCls: 'text-amber-700 bg-amber-100', dot: 'bg-amber-500', Icon: TrendingUp, iconCls: 'text-amber-500' },
  { key: '6-12m', label: '6 – 12 Months', sub: 'Strategic', color: 'bg-blue-50 border-blue-200', headerCls: 'text-blue-700 bg-blue-100', dot: 'bg-blue-500', Icon: Lightbulb, iconCls: 'text-blue-500' },
  { key: '12m+', label: '12+ Months', sub: 'Long-term', color: 'bg-slate-50 border-slate-200', headerCls: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400', Icon: Leaf, iconCls: 'text-slate-400' },
];

function assignLane(gap) {
  const sev = gap.severity || '';
  const action = (gap.action || gap.recommendation || '').toLowerCase();
  if (sev === 'High') {
    // Infrastructure actions (solar, metering, STP) → 0-3m; policy/cert gaps → Immediate
    const infraKeywords = ['install', 'deploy', 'implement', 'solar', 'meter', 'stp', 'rainwater', 'sensor'];
    return infraKeywords.some((k) => action.includes(k)) ? '0-3m' : 'immediate';
  }
  if (sev === 'Medium') {
    const strategicKeywords = ['certif', 'audit', 'standard', 'policy', 'train', 'strategy', 'framework'];
    return strategicKeywords.some((k) => action.includes(k)) ? '6-12m' : '3-6m';
  }
  return '12m+';
}

export default function PriorityRoadmap({ gaps }) {
  if (!gaps || gaps.length === 0) return null;

const laneMap = {};
LANES.forEach((l) => { laneMap[l.key] = []; });

const LANE_LIMITS = { 'immediate': 3, '0-3m': 2, '3-6m': 2, '6-12m': 1, '12m+': 1 };
gaps.forEach((gap) => {
    const key = assignLane(gap);
    if (laneMap[key].length < LANE_LIMITS[key]) {
        laneMap[key].push(gap);
    }
});

  const hasAny = Object.values(laneMap).some((arr) => arr.length > 0);
  if (!hasAny) return null;

  return (
    <PremiumCard className="p-8">
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Action Plan
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Priority Action Roadmap</h3>
        <p className="text-sm text-slate-500 mt-1">
          Improvement actions mapped to an evidence-based implementation timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {LANES.map(({ key, label, sub, color, headerCls, dot, Icon, iconCls }) => {
          const items = laneMap[key];
          if (items.length === 0) return null;  //
          return (
            <div key={key} className={`border rounded-2xl overflow-hidden ${color}`}>
              <div className={`px-4 py-3 ${headerCls}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${iconCls}`} />
                  <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                </div>
                <p className="text-[10px] font-semibold opacity-70">{sub}</p>
              </div>
              <div className="p-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No actions</p>
                ) : items.map((gap, i) => (
                  <div key={gap.id || i} className="bg-white rounded-xl p-3 shadow-sm border border-white/80">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {gap.gap || gap.text || '—'}
                        </p>
                        {(gap.action || gap.recommendation) && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {gap.action || gap.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}