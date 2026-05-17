import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { C } from '@/theme/colors';

import { CERTIFICATIONS, CERT_DASHBOARD_PREVIEWS } from '@/constants/certifications';

import ESGProcessingOverlay from '@/components/feedback/ESGProcessingOverlay';

import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import {
    detectSpikes,
    toMonthlyElectricityValues,
    toMonthlyWaterValues,
    toMonthlyFuelValues,
    toMonthlyWasteValues,
} from '@/utils/validation/detectSpikes';

import { ROUTES } from '@/constants/routes';

import { PageShell } from '../../components/premium/layout/PageShell';
import { ReadinessHero } from '../../components/premium/readiness/ReadinessHero';
import { ValidationSummary } from '../../components/premium/summary/ValidationSummary';
import { PremiumCard } from '../../components/premium/shared/PremiumCard';
import { useCrossCategoryConsistencySync } from '@/modules/assessment/hooks/useCrossCategoryConsistencySync';
import CERTIFICATION_FRAMEWORKS from '@/constants/certificationFrameworks';
import PrerequisiteAlert from '@/components/cards/PrerequisiteAlert';
import RegulatoryReadinessTable from '@/components/premium/readiness/RegulatoryReadinessTable';

// const sectionVariants = {
//     hidden: { opacity: 0, y: 8 },
//     visible: (delay) => ({
//         opacity: 1,
//         y: 0,
//         transition: { duration: 0.38, ease: 'easeOut', delay },
//     }),
// };


export default function DashboardPage() {
    const [ready, setReady] = useState(false);
    const navigate = useNavigate();
    const results = useAssessmentResults();
    useCrossCategoryConsistencySync();
    const resolvedScores = results.scores;
    const rows = useAssessmentStore((s) => s.rows);
    const waterRows = useAssessmentStore((s) => s.waterRows);
    const fuelRows = useAssessmentStore((s) => s.fuelRows);
    const wasteRows = useAssessmentStore((s) => s.wasteRows);
    const uploadDuplicateResolution = useAssessmentStore((s) => s.uploadDuplicateResolution);
    const uploadStatus = useAssessmentStore((s) => s.uploadStatus);

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

    const metrics = {
        energyMonitoringMonths: resolvedScores?.filled || 0,
        electricityMonths: resolvedScores?.filled || 0,
        waterMonths: resolvedScores?.filledWaterMonths || 0,
        wasteMonths: resolvedScores?.filledWasteMonths || 0,
        fuelMonths: resolvedScores?.totalFuelDiesel > 0 ? resolvedScores?.filled || 0 : 0,
        readiness: resolvedScores?.overall || 0,
    };

    // const riskLevel = resolvedScores.overall >= 75 ? 'low' : resolvedScores.overall >= 55 ? 'medium' : resolvedScores.overall >= 35 ? 'high' : 'critical';
    // const riskColor = riskLevel === 'low' ? C.green : riskLevel === 'medium' ? C.amber : C.rose;
    // const envScore = Math.round((resolvedScores.energy * 0.35 + resolvedScores.water * 0.25 + resolvedScores.waste * 0.20));
    const onStartAssessment = () => navigate(ROUTES.ASSESSMENT_UPLOAD);

    // const topActions = [
    //     { action: 'Install rooftop solar system', impact: '+12', certs: 'IGBC, GRI' },
    //     { action: 'Deploy centralized energy monitoring', impact: '+8', certs: 'ISO 50001' },
    //     { action: 'Formalize EMS documentation', impact: '+5', certs: 'ISO 14001' },
    // ];

    // Derived from unified certifications constant — no local duplication
    const certPreviews = results?.certificationByFramework?.length
        ? results.certificationByFramework.slice(0, 4).map(c => {
            const fw = CERTIFICATION_FRAMEWORKS.find(f => f.id === c.frameworkId);
            return {
                name: fw?.name || c.frameworkId,
                score: c.score,
                time: c.timeline,
                prerequisitesMet: c.prerequisitesMet,
                failedChecks: c.failedChecks,
            };
        })
        : CERT_DASHBOARD_PREVIEWS;

    return (
        <>
            <AnimatePresence>
                {!ready && (
                    <ESGProcessingOverlay onComplete={() => setReady(true)} />
                )}
            </AnimatePresence>

            <PageShell
                title="ESG Intelligence Overview"
                subtitle="Operational sustainability readiness and certification intelligence."
            >
                <div className="space-y-6">

                    {/* HERO */}
                    <ReadinessHero
                        score={resolvedScores.overall}
                        metrics={{
                            energyMonitoringMonths: resolvedScores.filled,
                            energyScore: resolvedScores.energy,
                            waterScore: resolvedScores.water,
                            wasteScore: resolvedScores.waste,
                            govScore: resolvedScores.gov,
                        }}
                        radarData={[
                            { subject: 'Energy', A: resolvedScores.energy },
                            { subject: 'Water', A: resolvedScores.water },
                            { subject: 'Waste', A: resolvedScores.waste },
                            { subject: 'Governance', A: resolvedScores.gov },
                            { subject: 'Emissions', A: Math.max(0, 100 - Math.round((resolvedScores.totalEm || 0) / 1.5)) },
                        ]}
                    />

                    {/* VALIDATION + ACTIONS */}


                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                        <div style={{ flex: 2, minWidth: 0 }}>
                            <ValidationSummary
                                metrics={{
                                    energyMonitoringMonths: resolvedScores?.filled || 0,
                                    recycledWaterAvailable: results?.scores?.gov > 50,
                                    segregationMaturity: results?.scores?.waste >= 75 ? '3' : results?.scores?.waste >= 50 ? '2' : '1',
                                }}
                                spikeWarningsByCategory={spikeWarningsByCategory}
                                duplicateNoticesByCategory={uploadDuplicateResolution}
                                unitMismatchByCategory={unitMismatchByCategory}
                                consistencyWarnings={results.consistencyWarnings ?? []}
                            />
                        </div>

                        <div style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 24,
                            padding: 32,
                        }}>
                            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 8 }}>
                                Critical Actions
                            </p>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
                                Highest Impact Improvements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {results.insightEvaluation?.gaps?.slice(0, 3).map((gap, i) => (
                                    <ActionItem
                                        key={gap.id || i}
                                        title={gap.gap || gap.text || '—'}
                                        impact={gap.severity === 'High' ? 'High Priority' : gap.severity === 'Medium' ? 'Medium Priority' : 'Low Priority'}
                                        desc={gap.action || gap.recommendation || ''}
                                    />
                                )) || (
                                        <p className="text-sm text-slate-400">Complete an assessment to see priority actions.</p>
                                    )}
                            </div>
                        </div>

                    </div>
                    {/* CERTIFICATIONS */}
                    <div>

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                                    Certifications
                                </p>

                                <h3 className="text-2xl font-bold text-slate-900">
                                    Readiness Matrix
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                            {certPreviews.map((cert) => (
                                <PremiumCard
                                    key={cert.name}
                                    className="p-6 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex flex-col gap-5">

                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    {cert.name}
                                                </h4>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    Estimated readiness score
                                                </p>
                                            </div>

                                            <div className="text-2xl font-black text-emerald-600">
                                                {cert.score}%
                                            </div>
                                        </div>

                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${cert.score}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-sm">

                                            <span className="text-slate-500">
                                                Timeline
                                            </span>

                                            <span className="font-semibold text-slate-900">
                                                {cert.time}
                                            </span>

                                        </div>

                                        {!cert.prerequisitesMet && cert.failedChecks && cert.failedChecks.length > 0 && (
                                            <PrerequisiteAlert failedChecks={cert.failedChecks} />
                                        )}

                                    </div>
                                </PremiumCard>
                            ))}

                        </div>
                    </div>

                    {/* REGULATORY READINESS */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                                    Regulatory Compliance
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    Global Regulatory Readiness
                                </h3>
                            </div>
                        </div>
                        <RegulatoryReadinessTable results={results.regulatoryResults} />
                    </div>

                </div>
            </PageShell>
        </>
    );
}
const ActionItem = ({ title, impact, desc }) => (
    <div className="border-l-2 border-emerald-500 pl-4">

        <div className="flex items-center justify-between mb-1">

            <h4 className="font-semibold text-slate-900">
                {title}
            </h4>

            <span className="text-sm font-bold text-emerald-600">
                {impact}
            </span>

        </div>

        <p className="text-sm text-slate-500 leading-relaxed">
            {desc}
        </p>

    </div>
);
