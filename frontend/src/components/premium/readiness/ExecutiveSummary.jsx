import { AlertCircle, FileText } from 'lucide-react';

const DISCLAIMER = "This assessment provides an indicative readiness evaluation based on self-reported data. It does not constitute formal certification or regulatory assurance.";

export default function ExecutiveSummary({ 
    overallScore, 
    readinessStage, 
    strengths = [], 
    gaps = [], 
    bestCertification = null, 
    regulatoryRiskSummary = "" 
}) {
    const topStrengths = strengths.slice(0, 3);
    const topGaps = gaps.slice(0, 3);

    return (
        <div className="bg-slate-900 text-slate-50 rounded-2xl p-8 shadow-lg relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <FileText size={200} />
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-6">Executive Summary</h3>
                
                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
                    <p>
                        Based on the operational data provided, your current ESG maturity scores at <strong className="text-white">{overallScore}%</strong>, placing you in the <strong className="text-white">{readinessStage}</strong> stage.
                    </p>
                    
                    {bestCertification && (
                        <p>
                            Your strongest alignment is with <strong className="text-emerald-400">{bestCertification.name}</strong>, achieving a compliance estimate of <strong className="text-emerald-400">{bestCertification.score}%</strong>. The estimated timeline to achieve this is {bestCertification.timeline}.
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <h5 className="text-emerald-400 font-semibold mb-2 text-sm uppercase tracking-wider">Key Strengths</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {topStrengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-amber-400 font-semibold mb-2 text-sm uppercase tracking-wider">Primary Gaps</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {topGaps.map((g, i) => <li key={i}>{g}</li>)}
                            </ul>
                        </div>
                    </div>

                    {regulatoryRiskSummary && (
                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <h5 className="text-white font-semibold mb-1">Regulatory Context</h5>
                            <p className="text-sm">{regulatoryRiskSummary}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-start gap-3 text-slate-500 text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>{DISCLAIMER}</p>
                </div>
            </div>
        </div>
    );
}
