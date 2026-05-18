import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import { useCrossCategoryConsistencySync } from '@/modules/assessment/hooks/useCrossCategoryConsistencySync';

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

    const onStartAssessment = () => navigate(ROUTES.ASSESSMENT_UPLOAD);

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

                    {/* VALIDATION */}
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

                    {/* RECENT ASSESSMENTS + CTA */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 24,
                        padding: 32,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 24,
                        }}>
                            <div>
                                <p style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    color: '#94a3b8',
                                    marginBottom: 6,
                                }}>
                                    Assessments
                                </p>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                                    Recent Assessments
                                </h3>
                            </div>

                            <button
                                onClick={onStartAssessment}
                                style={{
                                    background: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 14,
                                    padding: '12px 28px',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                + Start New Assessment
                            </button>
                        </div>

                        {/* Assessment history rows */}
                        {resolvedScores?.overall > 0 ? (
                            <div style={{
                                border: '1px solid #f1f5f9',
                                borderRadius: 16,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 120px 120px 140px',
                                    padding: '10px 20px',
                                    background: '#f8fafc',
                                    borderBottom: '1px solid #f1f5f9',
                                }}>
                                    {['Assessment', 'Overall Score', 'Status', 'Date'].map(h => (
                                        <span key={h} style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: '#94a3b8',
                                        }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 120px 120px 140px',
                                    padding: '16px 20px',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f8fafc',
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                        Current Assessment
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                                        {resolvedScores.overall}%
                                    </span>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '3px 10px',
                                        borderRadius: 99,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        background: resolvedScores.overall >= 75 ? '#d1fae5' : resolvedScores.overall >= 40 ? '#fef3c7' : '#fee2e2',
                                        color: resolvedScores.overall >= 75 ? '#065f46' : resolvedScores.overall >= 40 ? '#92400e' : '#991b1b',
                                        width: 'fit-content',
                                    }}>
                                        {resolvedScores.overall >= 75 ? 'Strong Readiness'
                                            : resolvedScores.overall >= 60 ? 'Cert Possible'
                                            : resolvedScores.overall >= 40 ? 'Foundational'
                                            : 'Not Ready'}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#64748b' }}>
                                        {new Date().toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 24px',
                                color: '#94a3b8',
                            }}>
                                <p style={{ fontSize: 15, marginBottom: 8 }}>
                                    No assessments yet.
                                </p>
                                <p style={{ fontSize: 13 }}>
                                    Click "Start New Assessment" to begin your sustainability readiness evaluation.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </PageShell>
        </>
    );
}