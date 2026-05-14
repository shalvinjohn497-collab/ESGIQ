import { ArrowRight, Zap } from 'lucide-react';

export default function CertificationPathwaySequencing({ frameworks = [], roadmap = [] }) {
    if (!frameworks || frameworks.length === 0) return null;

    // Sort by achievability (highest score first)
    const sorted = [...frameworks].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Certification Pathway</h3>
            <p className="text-slate-500 mb-8">Recommended sequence based on current operational maturity and gap analysis.</p>

            <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100" />

                <div className="space-y-6 relative z-10">
                    {sorted.map((fw, index) => {
                        const distance = 100 - fw.score;
                        const isClosest = index === 0;

                        return (
                            <div key={fw.frameworkId || fw.id} className="flex gap-6 items-start">
                                {/* Step Indicator */}
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm shrink-0 ${isClosest ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <span className="font-bold">{index + 1}</span>
                                </div>

                                {/* Content */}
                                <div className={`flex-1 border rounded-2xl p-5 ${isClosest ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-slate-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">{fw.name || fw.frameworkId}</h4>
                                            <p className="text-sm text-slate-500 mt-1">Current Readiness: <strong className="text-slate-700">{fw.score}%</strong></p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <span className="text-slate-500 block">Est. Timeline</span>
                                            <span className="font-semibold text-slate-800 block">{fw.timeline}</span>
                                        </div>
                                    </div>

                                    {/* Impact Opportunity */}
                                    {distance > 0 && distance < 40 && (
                                        <div className="mt-4 flex items-start gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100/50">
                                            <Zap size={16} className="shrink-0 mt-0.5 text-indigo-500" />
                                            <p>Addressing primary gaps could improve score by up to {Math.min(distance, 15)}%, pushing you towards {fw.tier !== 'Platinum' ? 'the next tier' : 'certification'}.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
