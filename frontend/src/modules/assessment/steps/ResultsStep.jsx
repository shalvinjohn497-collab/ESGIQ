import { C } from '@/theme/colors';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import ScoreRing from '@/components/indicators/ScoreRing';
import StatusBadge from '@/components/indicators/StatusBadge';
import ESGRadarChart from '@/components/charts/ESGRadarChart';
import { CERTIFICATION_ICONS } from '@/constants/scoring';
import { CERTIFICATIONS, CERTIFICATION_PATHWAY } from '@/constants/certifications';
import { generateStrengths, generateGaps, generateRoadmap } from '@/utils/generateResultsInsights';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { useToast } from '@/hooks/useToast';
import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';
import { ROUTES } from '@/constants/routes';
import { PageShell } from '../../../components/premium/layout/PageShell';
import { PremiumCard } from '../../../components/premium/shared/PremiumCard';
import { ReadinessHero } from '../../../components/premium/readiness/ReadinessHero';
import {useEffect } from 'react';
export default function ResultsStep() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const results = useAssessmentResults();
    const { certificationResults } = results;
    const resolvedScores = results.scores;
    const metrics = {
  energyMonitoringMonths: resolvedScores?.filled || 0,
};
    const radarData = results.radarData;
    const lvLabel = results.readinessLabel;
    const FALLBACK_CERTS = CERTIFICATIONS.map((c) => ({
        id: c.cert,
        name: c.cert,
        score: c.score,
        status: c.status,
        color: c.c,
        timeline: c.time,
        majorGap: '—',
        isPrimary: false,
    }));
    const certRows = certificationResults?.all?.length
        ? certificationResults.all
        : FALLBACK_CERTS;

    const { flags } = useAssessmentStore();

    const strengths = generateStrengths(resolvedScores, flags);
    const gaps = generateGaps(resolvedScores, flags);
    const roadmap = generateRoadmap(resolvedScores, flags);

    // If for some reason we have fewer than expected generated elements, we provide fallbacks
    // but the generator should handle standard paths.
    if (strengths.length === 0) strengths.push('Data ingestion successful');
    if (gaps.length === 0) gaps.push('No critical compliance blockers detected');
    
      useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
   return (
  <PageShell
    title="Readiness Intelligence"
    subtitle="Executive sustainability readiness and certification analysis."
  >
    <div className="space-y-8">

      {/* HERO */}
      <ReadinessHero
        score={resolvedScores.overall}
        metrics={{
          energyMonitoringMonths: resolvedScores.filled,
        }}
        radarData={radarData}
      />

      {/* CERTIFICATIONS + INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Certification Readiness */}
        <div className="lg:col-span-2">
          <PremiumCard className="p-8 h-full">

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Certification Readiness
                </h3>

                <p className="text-slate-500 mt-1">
                  Multi-framework ESG eligibility scoring.
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                {resolvedScores.overall}% Overall
              </div>
            </div>

            <div className="space-y-4">
              {certRows.map((cert) => (
                <div
                  key={cert.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {cert.name}
                        </h4>

                        {cert.isPrimary && (
                          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {cert.majorGap || 'No major blockers detected'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className="text-2xl font-black tracking-tight"
                        style={{ color: cert.color }}
                      >
                        {cert.score}%
                      </div>

                      <div className="text-xs text-slate-400">
                        {cert.timeline}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cert.score}%`,
                        background: cert.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </PremiumCard>
        </div>

        {/* Strengths + Gaps */}
        <div className="space-y-6">

          {/* Strengths */}
          <PremiumCard className="p-6">

            <div className="mb-5">
              <h4 className="text-lg font-bold text-slate-900">
                Operational Strengths
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Positive ESG maturity indicators.
              </p>
            </div>

            <div className="space-y-3">
              {strengths.map((s) => (
                <div
                  key={s}
                  className="flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s}
                  </p>
                </div>
              ))}
            </div>

          </PremiumCard>

          {/* Gaps */}
          <PremiumCard className="p-6">

            <div className="mb-5">
              <h4 className="text-lg font-bold text-slate-900">
                Critical Gaps
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                High-priority compliance blockers.
              </p>
            </div>

            <div className="space-y-3">
              {gaps.slice(0, 4).map((g) => (
                <div
                  key={g}
                  className="flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {g}
                  </p>
                </div>
              ))}
            </div>

          </PremiumCard>

        </div>
      </div>

      {/* ROADMAP */}
      <PremiumCard className="p-8">

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900">
            Strategic ESG Roadmap
          </h3>

          <p className="text-slate-500 mt-1">
            Recommended progression toward certification maturity.
          </p>
        </div>

        <div className="space-y-0">
          {roadmap.map((r, i) => (
            <div
              key={i}
              className="relative pl-10 pb-10 border-l border-slate-200 ml-3 last:pb-0"
            >

              <div className="absolute left-[-8px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500" />

              <div className="flex flex-col">

                <div className="flex items-center gap-3 mb-2">

                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                      r.priority === 'high'
                        ? 'bg-rose-50 text-rose-700'
                        : r.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {r.phase}
                  </span>

                  <span className="text-xs text-slate-400">
                    {r.cert}
                  </span>

                </div>

                <h4 className="text-lg font-semibold text-slate-900">
                  {r.action}
                </h4>

              </div>
            </div>
          ))}
        </div>

      </PremiumCard>

      {/* ACTIONS */}
      <div className="flex items-center justify-between pt-2">

        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.ASSESSMENT_SUMMARY)}
        >
          ← Back to Summary
        </Button>

        <div className="flex gap-3 flex-wrap">

          <Button
            variant="secondary"
            onClick={() =>
              showToast('Feature unlocks on backend integration.')
            }
          >
            Export Report
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              showToast('Industry benchmarking coming soon.')
            }
          >
            Benchmark
          </Button>

          <Button
            onClick={() =>
              showToast('Consultation scheduling disabled in demo.')
            }
          >
            Book ESG Consultation
          </Button>

        </div>

      </div>

    </div>
  </PageShell>
);
}
