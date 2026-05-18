import { PremiumCard } from '../shared/PremiumCard';
import { Zap, Droplets, Recycle, TrendingUp } from 'lucide-react';

const OPPORTUNITY_LIBRARY = [
  {
    id: 'solar',
    title: 'Rooftop Solar Installation',
    category: 'Energy',
    Icon: Zap,
    iconBg: 'bg-amber-50',
    iconCls: 'text-amber-500',
    condition: (scores) => scores.energy < 75 || scores.renPct < 10,
    impact: 'High',
    impactCls: 'bg-emerald-50 text-emerald-700',
    desc: 'Installing rooftop solar can reduce grid dependency, lower Scope 2 emissions, and improve energy pillar scores by 10–18 points.',
    certRelevance: 'IGBC, GRI, ISO 50001',
  },
  {
    id: 'ems',
    title: 'Energy Monitoring System',
    category: 'Energy',
    Icon: Zap,
    iconBg: 'bg-blue-50',
    iconCls: 'text-blue-500',
    condition: (scores) => scores.energy < 65,
    impact: 'Medium',
    impactCls: 'bg-blue-50 text-blue-700',
    desc: 'Deploying a centralised EMS enables granular tracking, supports ISO 50001 prerequisites, and improves data confidence scores.',
    certRelevance: 'ISO 50001, LEED',
  },
  {
    id: 'stp',
    title: 'Sewage Treatment Plant',
    category: 'Water',
    Icon: Droplets,
    iconBg: 'bg-cyan-50',
    iconCls: 'text-cyan-500',
    condition: (scores) => scores.water < 70,
    impact: 'High',
    impactCls: 'bg-emerald-50 text-emerald-700',
    desc: 'An on-site STP enables water recycling, reduces municipal dependency, and is a prerequisite for several green building certifications.',
    certRelevance: 'IGBC, GRIHA, LEED',
  },
  {
    id: 'rainwater',
    title: 'Rainwater Harvesting',
    category: 'Water',
    Icon: Droplets,
    iconBg: 'bg-teal-50',
    iconCls: 'text-teal-500',
    condition: (scores) => scores.water < 80,
    impact: 'Medium',
    impactCls: 'bg-blue-50 text-blue-700',
    desc: 'Rainwater harvesting reduces water intensity metrics and demonstrates proactive resource stewardship for certification audits.',
    certRelevance: 'GRIHA, IGBC',
  },
  {
    id: 'segregation',
    title: 'Waste Segregation Programme',
    category: 'Waste',
    Icon: Recycle,
    iconBg: 'bg-emerald-50',
    iconCls: 'text-emerald-500',
    condition: (scores) => scores.waste < 70,
    impact: 'Medium',
    impactCls: 'bg-blue-50 text-blue-700',
    desc: 'Formalised source segregation into wet, dry, and hazardous streams directly lifts waste pillar scores and supports GRI waste disclosures.',
    certRelevance: 'GRI 306, ISO 14001',
  },
  {
    id: 'ems-doc',
    title: 'Environmental Management System',
    category: 'Governance',
    Icon: TrendingUp,
    iconBg: 'bg-violet-50',
    iconCls: 'text-violet-500',
    condition: (scores) => scores.gov < 65,
    impact: 'High',
    impactCls: 'bg-emerald-50 text-emerald-700',
    desc: 'Formalising an EMS with documented policies and targets is the single highest-leverage governance action for certification readiness.',
    certRelevance: 'ISO 14001, GRI, CDP',
  },
];

const IMPACT_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function ImpactOpportunities({ scores }) {
  if (!scores) return null;

  const opportunities = OPPORTUNITY_LIBRARY
    .filter((o) => o.condition(scores))
    .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 2) - (IMPACT_ORDER[b.impact] ?? 2))
    .slice(0, 6);

  if (opportunities.length === 0) return null;

  return (
    <PremiumCard className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Opportunities
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Impact Opportunities</h3>
        <p className="text-sm text-slate-500 mt-1">
          High-leverage interventions matched to your current performance gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {opportunities.map((o) => (
          <div
            key={o.id}
            className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-2xl ${o.iconBg} flex items-center justify-center shrink-0`}>
                <o.Icon className={`w-5 h-5 ${o.iconCls}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${o.impactCls}`}>
                {o.impact} Impact
              </span>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                {o.category}
              </p>
              <h4 className="text-base font-bold text-slate-900 leading-snug">{o.title}</h4>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed flex-1">{o.desc}</p>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-500">Cert relevance: </span>
                {o.certRelevance}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}