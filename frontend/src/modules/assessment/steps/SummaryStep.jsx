import { PageShell } from '../../../components/premium/layout/PageShell';
import { PremiumCard } from '../../../components/premium/shared/PremiumCard';
import { ValidationSummary } from '../../../components/premium/summary/ValidationSummary';
import { C } from '@/theme/colors';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import ValidationPanel from '@/modules/assessment/components/ValidationPanel';
import { useModuleValidation } from '@/modules/assessment/hooks/useModuleValidation';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';
import { ROUTES } from '@/constants/routes';
import {useEffect } from 'react';
export default function SummaryStep() {
    const navigate = useNavigate();
    const results = useAssessmentResults();
    const resolvedScores = results.scores;
    const metrics = {
  energyMonitoringMonths: resolvedScores?.filled || 0,
  electricityMonths: resolvedScores?.filled || 0,
  waterMonths: 12,
  wasteMonths: 12,
  fuelMonths: 4,
  readiness: resolvedScores?.overall || 78,
};
    // Reads flags/navigation from store
    const { flags } = useAssessmentStore();
    const { validations } = useModuleValidation(resolvedScores);

    const catUpload = [
        { cat: 'Electricity', icon: '⚡', months: `${resolvedScores.filled}/12`, status: resolvedScores.filled >= 12 ? 'Complete' : 'Partial', c: resolvedScores.filled >= 12 ? C.green : C.amber },
        { cat: 'Water', icon: '💧', months: '12/12', status: 'Complete', c: C.green },
        { cat: 'Fuel', icon: '⛽', months: '12/12', status: 'Complete', c: C.green },
        { cat: 'Waste', icon: '♻️', months: '12/12', status: 'Complete', c: C.green },
        { cat: 'Refrigerants', icon: '❄️', months: '8/12', status: 'Partial', c: C.amber },
        { cat: 'Transport', icon: '🚛', months: '6/12', status: 'Partial', c: C.amber },
        { cat: 'Governance', icon: '🛡️', months: '—', status: 'Complete', c: C.green },
    ];

    const annElec = results.annualizedElec;

    const kpis = [
        { l: 'Energy Intensity', v: `${resolvedScores.intensity}`, u: 'kWh/sqft/yr', b: 'Bench: 15–22', ok: resolvedScores.intensity < 22 },
        { l: 'Water Intensity', v: '0.24', u: 'KL/sqft/yr', b: 'Bench: 0.20–0.35', ok: true },
        { l: 'Renewable Energy', v: `${resolvedScores.renPct}%`, u: 'Of total energy', b: 'Bench: >10%', ok: resolvedScores.renPct > 10 },
        { l: 'Waste Recycling', v: '58.3%', u: 'Recycling rate', b: 'Bench: >60%', ok: false },
    ];

     useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
    return (
  <PageShell
    title="Validation & Intelligence"
    subtitle="Audit-grade review of uploaded ESG operational evidence."
  >
    <div className="space-y-8">

      {/* Validation Intelligence */}
      <ValidationSummary
        metrics={{
          energyMonitoringMonths: resolvedScores.filled,
          recycledWaterAvailable: flags.hasSTP,
          segregationMaturity: flags.segregation ? '3' : '1',
        }}
      />

      {/* Upload Overview */}
      <PremiumCard className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Upload Coverage
            </h3>
            <p className="text-slate-500 mt-1">
              Operational datasets detected and validated.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
            {resolvedScores.filled}/12 Months Verified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catUpload.map((r) => (
            <div
              key={r.cat}
              className="border border-slate-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-slate-900">
                  {r.icon} {r.cat}
                </span>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    r.status === 'Complete'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="text-sm text-slate-500">
                {r.months} tracked
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <PremiumCard key={k.l} className="p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {k.l}
            </div>

            <div
              className={`text-3xl font-black tracking-tight ${
                k.ok ? 'text-emerald-600' : 'text-amber-500'
              }`}
            >
              {k.v}
            </div>

            <div className="text-sm text-slate-500 mt-1">{k.u}</div>

            <div className="text-xs text-slate-400 mt-4">
              {k.b}
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Annualized Calculations */}
      <PremiumCard className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            Annualized Calculations
          </h3>

          <p className="text-slate-500 mt-1">
            Engine-derived operational scaling logic.
          </p>
        </div>

        <div className="space-y-4">
          {[
            [
              'Electricity (kWh)',
              resolvedScores.totalElec.toLocaleString(),
              annElec.toLocaleString(),
              resolvedScores.filled < 12
                ? `÷${resolvedScores.filled}×12`
                : 'Actual',
            ],
            [
              'Renewable (kWh)',
              resolvedScores.totalRen.toLocaleString(),
              resolvedScores.totalRen.toLocaleString(),
              'Actual',
            ],
            [
              'DG Diesel (L)',
              resolvedScores.totalDiesel.toLocaleString(),
              resolvedScores.totalDiesel.toLocaleString(),
              'Actual',
            ],
          ].map(([m, u, a, l]) => (
            <div
              key={m}
              className="flex items-center justify-between border border-slate-100 rounded-2xl p-4"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {m}
                </div>

                <div className="text-sm text-slate-500">
                  Uploaded: {u}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">
                  {a}
                </div>

                <div className="text-xs text-slate-400">
                  {l}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Emissions Summary */}
      <PremiumCard className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            Emissions Intelligence
          </h3>

          <p className="text-slate-500 mt-1">
            Scope-based emissions modeling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ['Scope 1', resolvedScores.scope1],
            ['Scope 2', resolvedScores.scope2],
            ['Scope 3', resolvedScores.scope3],
            ['Total', resolvedScores.totalEm],
          ].map(([l, v]) => (
            <div
              key={l}
              className="bg-slate-50 rounded-2xl p-6"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {l}
              </div>

              <div className="text-3xl font-black tracking-tight text-slate-900">
                {v}
              </div>

              <div className="text-sm text-slate-500 mt-1">
                tCO₂e
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Bottom Actions */}
      <div style={{
    position: 'sticky',
    bottom: 0,
    background: 'rgba(248,250,252,0.95)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #e2e8f0',
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    marginTop: 32,
  }}>
    <button
      onClick={() => navigate(ROUTES.ASSESSMENT_UPLOAD)}
      style={{
        padding: '12px 24px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        fontWeight: 600,
        fontSize: 14,
        color: '#475569',
        cursor: 'pointer',
      }}
    >
      ← Back
    </button>
    <button
      onClick={() => navigate(ROUTES.ASSESSMENT_RESULTS)}
      style={{
        padding: '12px 28px',
        background: '#059669',
        border: 'none',
        borderRadius: 16,
        fontWeight: 700,
        fontSize: 14,
        color: '#ffffff',
        cursor: 'pointer',
      }}
    >
      Continue to Readiness →
    </button>
  </div>

    </div>
  </PageShell>
);
}
