import { PremiumCard } from '../shared/PremiumCard';
import { Sparkles } from 'lucide-react';
import CERTIFICATION_FRAMEWORKS from '@/constants/certificationFrameworks';

function getMaturityLabel(overall) {
  if (overall >= 80) return 'advanced sustainability maturity';
  if (overall >= 65) return 'good sustainability maturity';
  if (overall >= 50) return 'developing sustainability maturity';
  if (overall >= 35) return 'early-stage sustainability maturity';
  return 'foundational sustainability maturity';
}

function buildNarrative({ scores, insightEvaluation, certificationByFramework, orgName }) {
  const org = orgName || 'Your facility';
  const maturity = getMaturityLabel(scores.overall || 0);

  // Top 2-3 strengths
  const strengths = insightEvaluation?.strengths || [];
  const topStrengths = strengths.slice(0, 2).map((s) =>
    typeof s === 'string' ? s : (s.strength || s.text || s.label || '')
  ).filter(Boolean);

  // Top certifications ≥ 65%
  const readyCerts = (certificationByFramework || [])
    .filter((c) => (c.score || 0) >= 65)
    .slice(0, 3)
    .map((c) => {
      const fw = CERTIFICATION_FRAMEWORKS.find((f) => f.id === c.frameworkId);
      return fw?.name || c.frameworkId;
    })
    .filter(Boolean);

  // Top gaps
  const gaps = (insightEvaluation?.gaps || [])
    .filter((g) => g.severity === 'High')
    .slice(0, 2)
    .map((g) => (g.gap || g.text || '').toLowerCase())
    .filter(Boolean);

  // Build sentence
  let narrative = `${org} demonstrates ${maturity} with an overall ESG score of ${scores.overall || 0}/100.`;

  if (topStrengths.length > 0) {
    narrative += ` Key strengths include ${topStrengths.join(' and ').toLowerCase()}.`;
  }

  if (readyCerts.length > 0) {
    narrative += ` There is strong potential for ${readyCerts.join(', ')} certification${readyCerts.length > 1 ? 's' : ''} based on current readiness scores.`;
  } else {
    narrative += ' Continued data completeness improvement will unlock certification pathways.';
  }

  if (gaps.length > 0) {
    narrative += ` Priority improvements identified: ${gaps.join('; ')}.`;
  }

  return narrative;
}

export default function NarrativeSummary({ scores, insightEvaluation, certificationByFramework, orgName }) {
  if (!scores || !scores.overall) return null;

  const narrative = buildNarrative({ scores, insightEvaluation, certificationByFramework, orgName });

  const pillarStats = [
    { label: 'Energy', value: scores.energy || 0 },
    { label: 'Water', value: scores.water || 0 },
    { label: 'Waste', value: scores.waste || 0 },
    { label: 'Governance', value: scores.gov || 0 },
  ];

  return (
    <PremiumCard className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Executive Summary
          </p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Intelligence Overview</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Narrative text */}
        <div className="lg:col-span-2">
          <div className="border-l-4 border-emerald-500 pl-6">
            <p className="text-base text-slate-700 leading-relaxed">{narrative}</p>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            SAM Assessment Application provides indicative sustainability and certification readiness intelligence.
            This platform does not replace official certification audits, regulatory reviews, accredited assessments,
            or legal compliance advice. All scores and recommendations are indicative only.
          </p>
        </div>

        {/* Pillar scores */}
        <div className="space-y-3">
          {pillarStats.map(({ label, value }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="text-sm font-black text-slate-900">{value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
}