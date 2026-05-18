import { PremiumCard } from '../shared/PremiumCard';
import { ArrowRight, Lock, CheckCircle, Clock } from 'lucide-react';
import CERTIFICATION_FRAMEWORKS from '@/constants/certificationFrameworks';

function getReadinessStatus(score) {
  if (score >= 80) return { label: 'Ready', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle, iconCls: 'text-emerald-500' };
  if (score >= 65) return { label: 'Near Ready', cls: 'bg-teal-50 text-teal-700 border-teal-200', Icon: Clock, iconCls: 'text-teal-500' };
  if (score >= 45) return { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock, iconCls: 'text-amber-500' };
  return { label: 'Not Ready', cls: 'bg-red-50 text-red-700 border-red-200', Icon: Lock, iconCls: 'text-red-400' };
}

function buildSequence(certificationByFramework) {
  if (!certificationByFramework || certificationByFramework.length === 0) return [];

  return [...certificationByFramework]
    .map((c) => {
      const fw = CERTIFICATION_FRAMEWORKS.find((f) => f.id === c.frameworkId);
      return {
        id: c.frameworkId,
        name: fw?.name || c.frameworkId,
        score: c.score || 0,
        timeline: c.timeline || '—',
        prerequisitesMet: c.prerequisitesMet !== false,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export default function CertificationPathway({ certificationByFramework }) {
  const sequence = buildSequence(certificationByFramework);
  if (sequence.length === 0) return null;

  return (
    <PremiumCard className="p-8">
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Pathway
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Certification Pathway Sequence</h3>
        <p className="text-sm text-slate-500 mt-1">
          Recommended pursuit order based on current readiness scores.
        </p>
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-stretch gap-0 overflow-x-auto pb-2">
        {sequence.map((cert, i) => {
          const { label, cls, Icon, iconCls } = getReadinessStatus(cert.score);
          const isLast = i === sequence.length - 1;
          return (
            <div key={cert.id} className="flex items-center">
              <div className={`border rounded-2xl p-5 min-w-[160px] max-w-[180px] flex flex-col gap-3 ${cls}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">
                    Step {i + 1}
                  </span>
                  <Icon className={`w-4 h-4 ${iconCls}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{cert.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{cert.timeline}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">{cert.score}%</span>
                  {!cert.prerequisitesMet && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg border border-red-100">
                      Prereq
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <ArrowRight className="w-5 h-5 text-slate-300 mx-2 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col gap-3">
        {sequence.map((cert, i) => {
          const { label, cls, Icon, iconCls } = getReadinessStatus(cert.score);
          return (
            <div key={cert.id} className={`border rounded-2xl p-5 flex items-center justify-between ${cls}`}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-slate-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{cert.name}</p>
                  <p className="text-xs text-slate-500">{cert.timeline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">{cert.score}%</span>
                <Icon className={`w-4 h-4 ${iconCls}`} />
              </div>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}