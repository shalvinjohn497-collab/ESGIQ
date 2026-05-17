import { AlertCircle } from 'lucide-react';
import PrerequisiteAlert from '@/components/cards/PrerequisiteAlert';
import { CERTIFICATION_COLORS } from '@/constants/scoring';

export default function CertificationReadinessMatrix({ frameworks = [] }) {
    if (!frameworks || frameworks.length === 0) {
        return (
            <div className="flex-center p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-slate-500 font-medium">No certification frameworks evaluated.</span>
            </div>
        );
    }

    const sorted = [...frameworks].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((fw) => {
                const isReady = fw.score >= 60;
                const tierColor = CERTIFICATION_COLORS[fw.tier] || '#64748b';

                return (
                    <div key={fw.frameworkId || fw.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{fw.name || fw.frameworkId}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border"
                                        style={{ backgroundColor: `${tierColor}15`, color: tierColor, borderColor: `${tierColor}40` }}
                                    >
                                        {fw.tier || 'Not Ready'}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">{fw.timeline}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black" style={{ color: tierColor }}>{fw.score}%</span>
                            </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${fw.score}%`, backgroundColor: tierColor }} />
                        </div>

                        {fw.majorGap && (
                            <p className="text-sm text-slate-600 font-medium mb-3">
                                <span className="text-slate-400 mr-1">Key Gap:</span>
                                {fw.majorGap}
                            </p>
                        )}

                        {!fw.prerequisitesMet && fw.failedChecks?.length > 0 && (
                            <PrerequisiteAlert failedChecks={fw.failedChecks} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
