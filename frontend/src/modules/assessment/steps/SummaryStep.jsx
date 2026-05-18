import { PageShell } from '../../../components/premium/layout/PageShell';
import { PremiumCard } from '../../../components/premium/shared/PremiumCard';
import { ValidationSummary } from '../../../components/premium/summary/ValidationSummary';
import UploadOverviewTable from '../../../components/premium/summary/UploadOverviewTable';
import ConfidenceAssumptions from '@/components/premium/summary/ConfidenceAssumptions';
import ReadinessPreCheck from '@/components/premium/summary/ReadinessPreCheck';
import { useNavigate } from 'react-router-dom';
import { useModuleValidation } from '@/modules/assessment/hooks/useModuleValidation';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';
import { ROUTES } from '@/constants/routes';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { assessmentApi } from '@/services/api/assessment.api';
import { useDownloadPdf } from '@/modules/assessment/hooks/useDownloadPdf';
import { useToast } from '@/hooks/useToast';
import { UPLOAD_CATEGORIES } from '@/modules/assessment/configs/energy.module.jsx';
import { STATUS, STATUS_LABELS } from '@/constants/uploadCategoryStatus';
import { assignBenchmarkStatus } from '@/calculations/scoring/assignBenchmarkStatus';
import {
    detectSpikes,
    toMonthlyElectricityValues,
    toMonthlyWaterValues,
    toMonthlyFuelValues,
    toMonthlyWasteValues,
} from '@/utils/validation/detectSpikes';

const CAT_ICONS = {
    electricity: '⚡',
    water: '💧',
    fuel: '⛽',
    waste: '♻️',
    refrigerants: '❄️',
    transport: '🚛',
    governance: '🛡️',
};

function badgeClassForDataStatus(st) {
    switch (st) {
        case STATUS.COMPLETE:
            return 'bg-emerald-50 text-emerald-700';
        case STATUS.PARTIAL:
            return 'bg-amber-50 text-amber-700';
        case STATUS.INSUFFICIENT:
            return 'bg-orange-50 text-orange-700';
        case STATUS.ERROR:
            return 'bg-red-50 text-red-700';
        case STATUS.MISSING:
            return 'bg-slate-100 text-slate-500';
        default:
            return 'bg-slate-100 text-slate-500';
    }
}

const KPI_VALUE_CLASS = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    teal: 'text-teal-600',
    red: 'text-red-600',
};

const KPI_BENCHMARK_BADGE_CLASS = {
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-900 border border-amber-100',
    teal: 'bg-teal-50 text-teal-800 border border-teal-100',
    red: 'bg-red-50 text-red-800 border border-red-100',
};

export default function SummaryStep() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const results = useAssessmentResults();
    const resolvedScores = results.scores;
    const categoryUploadStatuses = results.categoryUploadStatuses;
  const metrics = {
  energyMonitoringMonths: resolvedScores?.filled || 0,
  electricityMonths: resolvedScores?.filled || 0,
  waterMonths: resolvedScores?.filledWaterMonths || 0,
  wasteMonths: resolvedScores?.filledWasteMonths || 0,
  fuelMonths: resolvedScores?.totalFuelDiesel > 0 ? resolvedScores?.filled || 0 : 0,
  readiness: resolvedScores?.overall || 0,
};
    // Reads flags/navigation from store
    const { flags, assessmentId, rows, waterRows, fuelRows, wasteRows, uploadDuplicateResolution, uploadStatus } =
        useAssessmentStore();
    const { validations } = useModuleValidation(resolvedScores);

    const catUpload = useMemo(() => {
        const map = categoryUploadStatuses || {};
        return UPLOAD_CATEGORIES.map((cat) => {
            const rec = map[cat.id] || { months: 0, status: STATUS.MISSING };
            const total = cat.total ?? 12;
            const monthsLabel = cat.total == null ? '—' : `${rec.months}/${total}`;
            return {
                key: cat.id,
                cat: cat.label,
                icon: CAT_ICONS[cat.id] || '📁',
                months: monthsLabel,
                status: rec.status,
                statusLabel: STATUS_LABELS[rec.status] || rec.status,
                badgeClass: badgeClassForDataStatus(rec.status),
            };
        });
    }, [categoryUploadStatuses]);

    const annElec = results.annualizedElec;
    const elecAnnualBlocked = results.electricityAnnualizationBlocked;
    const annWater = results.annualizedWater ?? 0;
    const annWaste = results.annualizedWaste ?? 0;
    const waterAnnualBlocked = results.waterAnnualizationBlocked;
    const wasteAnnualBlocked = results.wasteAnnualizationBlocked;

    const kpis = useMemo(() => {
        const intensity = Number(resolvedScores.intensity) || 0;
        const area = Number(flags.area) || 10000;
        const filledWM = Number(resolvedScores.filledWaterMonths) || 0;
        const tw = Number(resolvedScores.totalWater) || 0;
        const waterBlocked = Boolean(results.waterAnnualizationBlocked);
        const waterIntensity =
            waterBlocked ? null
            : filledWM > 0 && area > 0 ? (tw / filledWM) * 12 / area : 0;
        const renPct = Number(resolvedScores.renPct) || 0;
        const recyclingPct =
            Number(results.operationalMetrics?.recyclingPct) ||
            Number(flags.recyclingPct) ||
            0;

        return [
            {
                l: 'Energy Intensity',
                v: intensity.toLocaleString(undefined, { maximumFractionDigits: 1 }),
                u: 'kWh/sqft/yr',
                b: 'Bench: 15–22',
                ...assignBenchmarkStatus(intensity, 15, 22, { lowerIsBetter: true }),
            },
            {
                l: 'Water Intensity',
                v: waterIntensity == null ? '—' : waterIntensity.toFixed(2),
                u: 'KL/sqft/yr',
                b: 'Bench: 0.20–0.35',
                ...(waterIntensity == null
                    ? { label: 'N/A', colour: 'red' }
                    : assignBenchmarkStatus(waterIntensity, 0.2, 0.35, { lowerIsBetter: true })),
            },
            {
                l: 'Renewable Energy',
                v: `${renPct.toFixed(1)}%`,
                u: 'Of total energy',
                b: 'Bench: >10%',
                ...assignBenchmarkStatus(renPct, 10, 100, { lowerIsBetter: false }),
            },
            {
                l: 'Waste Recycling',
                v: `${recyclingPct.toFixed(1)}%`,
                u: 'Recycling rate',
                b: 'Bench: >60%',
                ...assignBenchmarkStatus(recyclingPct, 60, 100, { lowerIsBetter: false }),
            },
        ];
    }, [resolvedScores, flags.area, flags.recyclingPct, results.operationalMetrics, results.waterAnnualizationBlocked]);

    const spikeWarningsByCategory = useMemo(
        () => ({
            electricity: detectSpikes(toMonthlyElectricityValues(rows)),
            water: detectSpikes(toMonthlyWaterValues(waterRows)),
            fuel: detectSpikes(toMonthlyFuelValues(fuelRows)),
            waste: detectSpikes(toMonthlyWasteValues(wasteRows)),
        }),
        [rows, waterRows, fuelRows, wasteRows]
    );

    const unitMismatchByCategory = useMemo(() => {
        const out = {};
        for (const id of ['electricity', 'water', 'fuel', 'waste']) {
            const u = uploadStatus?.[id];
            if (u?.unitMismatch) {
                out[id] = { unitMismatch: true, foundUnits: u.foundUnits || [] };
            }
        }
        return Object.keys(out).length ? out : null;
    }, [uploadStatus]);

     useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
    const [saving, setSaving] = useState(false);

    const onPdfSuccess = useCallback(() => showToast('PDF downloaded successfully.', 'success'), [showToast]);
    const onPdfError = useCallback(() => showToast('PDF generation failed. Please try again.', 'error'), [showToast]);
    const { downloadPdf, isGenerating: isPdfGenerating } = useDownloadPdf({ onSuccess: onPdfSuccess, onError: onPdfError });

    const handleContinue = async () => {
        setSaving(true);
        try {
            if (assessmentId) {
                await assessmentApi.saveScores(assessmentId, {
                    scores: resolvedScores,
                    emissions: {
                        scope1: resolvedScores.scope1,
                        scope2: resolvedScores.scope2,
                        scope3: resolvedScores.scope3,
                        totalEm: resolvedScores.totalEm,
                    },
                });
            }
        } catch (err) {
            console.error('[SummaryStep] saveScores failed:', err);
        } finally {
            setSaving(false);
            navigate(ROUTES.ASSESSMENT_RESULTS);
        }
    };

    return (
  <PageShell
    title="Validation & Intelligence"
    subtitle="Audit-grade review of uploaded ESG operational evidence."
  >
    <div className="space-y-8">

      <UploadOverviewTable categoryUploadStatuses={results.categoryUploadStatuses} />

      {/* Validation Intelligence */}
      <ValidationSummary
        metrics={{
          energyMonitoringMonths: resolvedScores.filled,
          recycledWaterAvailable: flags.hasSTP,
          segregationMaturity: flags.segregation ? '3' : '1',
        }}
        spikeWarningsByCategory={spikeWarningsByCategory}
        duplicateNoticesByCategory={uploadDuplicateResolution}
        unitMismatchByCategory={unitMismatchByCategory}
        consistencyWarnings={results.consistencyWarnings ?? []}
      />

     

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <PremiumCard key={k.l} className="p-6">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {k.l}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg shrink-0 ${
                  KPI_BENCHMARK_BADGE_CLASS[k.colour] || KPI_BENCHMARK_BADGE_CLASS.teal
                }`}
              >
                {k.label}
              </span>
            </div>

            <div
              className={`text-3xl font-black tracking-tight ${
                KPI_VALUE_CLASS[k.colour] || KPI_VALUE_CLASS.teal
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
              elecAnnualBlocked ? '—' : annElec.toLocaleString(),
              elecAnnualBlocked
                ? 'Blocked (data error)'
                : resolvedScores.filled < 12
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
            [
              'Water (KL)',
              resolvedScores.totalWater?.toLocaleString() ?? '0',
              waterAnnualBlocked ? '—' : annWater.toLocaleString(),
              waterAnnualBlocked
                ? 'Blocked (data error)'
                : resolvedScores.filledWaterMonths > 0 && resolvedScores.filledWaterMonths < 12
                ? `÷${resolvedScores.filledWaterMonths}×12`
                : 'Actual',
            ],
            [
              'Waste (kg)',
              resolvedScores.totalWaste?.toLocaleString() ?? '0',
              wasteAnnualBlocked ? '—' : annWaste.toLocaleString(),
              wasteAnnualBlocked
                ? 'Blocked (data error)'
                : resolvedScores.filledWasteMonths > 0 && resolvedScores.filledWasteMonths < 12
                ? `÷${resolvedScores.filledWasteMonths}×12`
                : 'Actual',
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

      <ConfidenceAssumptions scores={resolvedScores} />

      <ReadinessPreCheck
        scores={resolvedScores}
        categoryUploadStatuses={results.categoryUploadStatuses}
        hasBlockingConsistencyErrors={results.hasBlockingConsistencyErrors}
        consistencyWarnings={results.consistencyWarnings}
      />

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
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
   
    <button
      onClick={handleContinue}
      disabled={saving || results.hasBlockingConsistencyErrors}
      style={{
        padding: '12px 28px',
        background: saving || results.hasBlockingConsistencyErrors ? '#94a3b8' : '#059669',
        border: 'none',
        borderRadius: 16,
        fontWeight: 700,
        fontSize: 14,
        color: '#ffffff',
        cursor: saving || results.hasBlockingConsistencyErrors ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {saving ? 'Saving…' : results.hasBlockingConsistencyErrors ? 'Resolve blocking checks →' : 'Continue to Readiness →'}
    </button>
    </div>
  </div>

    </div>
  </PageShell>
);
}
