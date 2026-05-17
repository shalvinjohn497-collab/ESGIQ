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
import CertificationPathwaySequencing from '@/components/premium/readiness/CertificationPathwaySequencing';
import { useSaveAssessmentResults } from '@/modules/assessment/hooks/useSaveAssessmentResults';
import { useDownloadPdf } from '@/modules/assessment/hooks/useDownloadPdf';
import BenchmarkModal from '@/components/premium/readiness/BenchmarkModal';
import ConsultationModal from '@/components/premium/readiness/ConsultationModal';

export default function ResultsStep() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const results = useAssessmentResults();
    const { certificationResults } = results;
    const resolvedScores = results.scores;
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

    if (strengths.length === 0) strengths.push('Data ingestion successful');
    if (gaps.length === 0) gaps.push('No critical compliance blockers detected');

    const sortedCerts = [...certRows].sort((a, b) => (b.score || 0) - (a.score || 0));
    const bestCertification = sortedCerts[0];

    let regRiskSummary = 'Regulatory compliance checks pending.';
    if (results.regulatoryResults?.length > 0) {
        const applicable = results.regulatoryResults.filter(r => r.applicable);
        const highRisk = applicable.filter(r => r.riskLevel === 'High').length;
        if (highRisk > 0) regRiskSummary = `You have ${highRisk} high-risk regulatory gaps that require immediate attention.`;
        else regRiskSummary = `Your baseline regulatory readiness is stable with no immediate high-risk gaps detected across applicable frameworks.`;
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

                <ReadinessHero
                    score={resolvedScores.overall}
                    metrics={{ energyMonitoringMonths: resolvedScores.filled }}
                    radarData={radarData}
                />

                <ExecutiveSummary
                    overallScore={resolvedScores.overall}
                    readinessStage={lvLabel}
                    strengths={strengths}
                    gaps={gaps}
                    bestCertification={bestCertification}
                    regulatoryRiskSummary={regRiskSummary}
                />

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Certification Readiness Matrix</h3>
                    <CertificationReadinessMatrix frameworks={certRows} />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Global Regulatory Readiness</h3>
                    <RegulatoryReadinessTable results={results.regulatoryResults || []} />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Maturity Analysis & Action Plan</h3>
                    <StrengthsGapsList strengths={strengths} gaps={gaps} roadmap={roadmap} />
                </div>

                <CertificationPathwaySequencing frameworks={certRows} roadmap={roadmap} />

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
                            onClick={downloadPdf}
                            disabled={isPdfGenerating}
                        >
                            {isPdfGenerating ? 'Generating PDF…' : 'Download PDF'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => setShowBenchmark(true)}
                        >
                            Benchmark
                        </Button>

                        <Button
                            onClick={() => setShowConsultation(true)}
                        >
                            Book ESG Consultation
                        </Button>
                    </div>
                </div>

            </div>

            {showBenchmark && <BenchmarkModal scores={resolvedScores} onClose={() => setShowBenchmark(false)} />}
            {showConsultation && <ConsultationModal onClose={() => setShowConsultation(false)} />}

        </PageShell>
    );
}