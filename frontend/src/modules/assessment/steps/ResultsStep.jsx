import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { CERTIFICATIONS } from '@/constants/certifications';
import { generateStrengths, generateGaps, generateRoadmap } from '@/utils/generateResultsInsights';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { useToast } from '@/hooks/useToast';
import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';
import { ROUTES } from '@/constants/routes';
import { PageShell } from '../../../components/premium/layout/PageShell';
import { ReadinessHero } from '../../../components/premium/readiness/ReadinessHero';
import ExecutiveSummary from '@/components/premium/readiness/ExecutiveSummary';
import CertificationReadinessMatrix from '@/components/premium/readiness/CertificationReadinessMatrix';
import RegulatoryReadinessTable from '@/components/premium/readiness/RegulatoryReadinessTable';
import StrengthsGapsList from '@/components/premium/readiness/StrengthsGapsList';
import { useSaveAssessmentResults } from '@/modules/assessment/hooks/useSaveAssessmentResults';
import { useDownloadPdf } from '@/modules/assessment/hooks/useDownloadPdf';
import BenchmarkModal from '@/components/premium/readiness/BenchmarkModal';
import ConsultationModal from '@/components/premium/readiness/ConsultationModal';
import OperationalStrengths from '../../../components/premium/readiness/OperationalStrengths';
import PriorityRoadmap from '../../../components/premium/readiness/PriorityRoadmap';
import ImpactOpportunities from '../../../components/premium/readiness/ImpactOpportunities';
import CertificationPathway from '../../../components/premium/readiness/CertificationPathway';
import ConfidenceAssumptions from '../../../components/premium/readiness/ConfidenceAssumptions';
import CERTIFICATION_FRAMEWORKS from '@/constants/certificationFrameworks';
export default function ResultsStep() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const results = useAssessmentResults();
    const resolvedScores = results.scores;
    const radarData = results.radarData;
    const lvLabel = results.readinessLabel;

    const { flags } = useAssessmentStore();

    // FALLBACK_CERTS must be declared before certRows
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


       const certRows = results.certificationByFramework?.length
    ? results.certificationByFramework.map(c => {
        const fw = CERTIFICATION_FRAMEWORKS.find(f => f.id === c.frameworkId);
        return {
            id: c.frameworkId,
            name: fw?.name || c.name || c.frameworkId,  // ← lookup from master
            score: c.score,
            status: c.status,
            timeline: c.timeline,
            majorGap: c.majorGap || '—',
            prerequisitesMet: c.prerequisitesMet,
            failedChecks: c.failedChecks,
        };
    })
    : FALLBACK_CERTS;
    const strengths = generateStrengths(resolvedScores, flags);
    const gaps = generateGaps(resolvedScores, flags);
    const roadmap = generateRoadmap(resolvedScores, flags);

    if (strengths.length === 0) strengths.push('Data ingestion successful');
    if (gaps.length === 0) gaps.push('No critical compliance blockers detected');

    const sortedCerts = [...certRows].sort((a, b) => (b.score || 0) - (a.score || 0));
    const bestCertification = sortedCerts[0];

    let regRiskSummary = 'Regulatory compliance checks pending.';
    if (results.regulatoryResults?.length > 0) {
        const applicable = results.regulatoryResults.filter(r => r.applicable);
        const highRisk = applicable.filter(r => r.riskLevel === 'High').length;
        if (highRisk > 0) {
            regRiskSummary = `You have ${highRisk} high-risk regulatory gaps that require immediate attention.`;
        } else {
            regRiskSummary = `Your baseline regulatory readiness is stable with no immediate high-risk gaps detected across applicable frameworks.`;
        }
    }

    const onSaveSuccess = useCallback(() => showToast('Results saved successfully.', 'success'), [showToast]);
    const onSaveError = useCallback(() => showToast('Failed to save results. Your data is still available locally.', 'error'), [showToast]);
    useSaveAssessmentResults(results, { onSuccess: onSaveSuccess, onError: onSaveError });

    const onPdfSuccess = useCallback(() => showToast('PDF downloaded successfully.', 'success'), [showToast]);
    const onPdfError = useCallback(() => showToast('PDF generation failed. Please try again.', 'error'), [showToast]);
    const { downloadPdf, isGenerating: isPdfGenerating } = useDownloadPdf({ onSuccess: onPdfSuccess, onError: onPdfError });

    const [showBenchmark, setShowBenchmark] = useState(false);
    const [showConsultation, setShowConsultation] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <PageShell
            title="Readiness Intelligence"
            subtitle="Executive sustainability readiness and certification analysis."
        >
            <div className="space-y-8">

                {/* 1 — OVERALL READINESS HERO */}
                <ReadinessHero
                    score={resolvedScores.overall}
                    metrics={{ energyMonitoringMonths: resolvedScores.filled }}
                    radarData={radarData}
                />

                {/* 2 — EXECUTIVE SUMMARY */}
                <ExecutiveSummary
                    overallScore={resolvedScores.overall}
                    readinessStage={lvLabel}
                    strengths={strengths}
                    gaps={gaps}
                    bestCertification={bestCertification}
                    regulatoryRiskSummary={regRiskSummary}
                />

                {/* 3 — CERTIFICATION READINESS MATRIX */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                        Certifications
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                        Certification Readiness Matrix
                    </h3>
                    <CertificationReadinessMatrix frameworks={certRows} />
                </div>

                {/* 4 — REGULATORY READINESS */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                        Regulatory Compliance
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                        Global Regulatory Readiness
                    </h3>
                    <RegulatoryReadinessTable results={results.regulatoryResults || []} />
                </div>

                {/* 5 — OPERATIONAL STRENGTHS */}
                <OperationalStrengths
                    strengths={results.insightEvaluation?.strengths}
                />

                {/* 6 — CRITICAL GAPS */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                        Maturity Analysis
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                        Critical Gaps & Action Plan
                    </h3>
                    <StrengthsGapsList
                        strengths={strengths}
                        gaps={gaps}
                        roadmap={roadmap}
                    />
                </div>

                {/* 7 — PRIORITY ACTION ROADMAP */}
                <PriorityRoadmap gaps={results.insightEvaluation?.gaps} />

                {/* 8 — IMPACT OPPORTUNITIES */}
                <ImpactOpportunities scores={resolvedScores} />

                {/* 9 — CONFIDENCE & ASSUMPTIONS */}
                <ConfidenceAssumptions scores={resolvedScores} />

                {/* 10 — CERTIFICATION PATHWAY */}
                <CertificationPathway
                    certificationByFramework={results.certificationByFramework}
                />

               

                {/* CTAs */}
                <div style={{
    position: 'sticky',
    bottom: 0,
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
    marginLeft: -32,
    marginRight: -32,
    marginBottom: -32,
}}>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(ROUTES.ASSESSMENT_SUMMARY)}
                    >
                        ← Back to Summary
                    </Button>

                    <div className="flex gap-3 flex-wrap">
                        <Button
                            variant="secondary"
                            onClick={downloadPdf}
                            disabled={isPdfGenerating}
                        >
                            {isPdfGenerating ? 'Generating PDF…' : 'Download PDF'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => setShowBenchmark(true)}
                        >
                            Compare Industry
                        </Button>

                        <Button
                            onClick={() => setShowConsultation(true)}
                        >
                            Book ESG Consultation
                        </Button>
                    </div>
                </div>

            </div>

            {showBenchmark && (
                <BenchmarkModal
                    scores={resolvedScores}
                    onClose={() => setShowBenchmark(false)}
                />
            )}
            {showConsultation && (
                <ConsultationModal
                    onClose={() => setShowConsultation(false)}
                />
            )}

        </PageShell>
    );
}