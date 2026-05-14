import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StrengthsGapsList({ strengths = [], gaps = [], roadmap = [] }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-900 mb-4">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        Operational Strengths
                    </h4>
                    <ul className="space-y-3">
                        {strengths.length > 0 ? strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <span className="text-sm text-emerald-800 leading-relaxed">{s}</span>
                            </li>
                        )) : (
                            <li className="text-sm text-emerald-600/70 italic">No significant strengths identified yet.</li>
                        )}
                    </ul>
                </div>

                {/* Gaps */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-rose-900 mb-4">
                        <AlertTriangle size={20} className="text-rose-500" />
                        Critical Gaps
                    </h4>
                    <ul className="space-y-3">
                        {gaps.length > 0 ? gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="px-2 py-0.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-rose-100 text-rose-700 shrink-0">
                                    High
                                </span>
                                <span className="text-sm text-rose-800 leading-relaxed">{g}</span>
                            </li>
                        )) : (
                            <li className="text-sm text-rose-600/70 italic">No critical gaps identified.</li>
                        )}
                    </ul>
                </div>

            </div>

            {/* Priority Action Roadmap */}
            {roadmap.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-900 mb-5">Priority Action Roadmap</h4>
                    <div className="space-y-4">
                        {roadmap.slice(0, 5).map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-800">{r.action}</h5>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Phase: <span className="font-medium text-slate-700 uppercase">{r.phase}</span> 
                                            {r.cert && <span className="ml-2 px-1.5 py-0.5 bg-slate-200 rounded text-[10px]">{r.cert}</span>}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
