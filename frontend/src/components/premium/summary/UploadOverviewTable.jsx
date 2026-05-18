import { PremiumCard } from '../shared/PremiumCard';
import { STATUS, STATUS_LABELS } from '@/constants/uploadCategoryStatus';
import { UPLOAD_CATEGORIES } from '@/modules/assessment/configs/energy.module.jsx';
import { getConfidenceModifier } from '@/constants/confidenceModifiers';

const STATUS_BADGE_CLS = {
  [STATUS.COMPLETE]: 'bg-emerald-50 text-emerald-700',
  [STATUS.PARTIAL]: 'bg-amber-50 text-amber-700',
  [STATUS.INSUFFICIENT]: 'bg-orange-50 text-orange-700',
  [STATUS.ERROR]: 'bg-red-50 text-red-700',
  [STATUS.MISSING]: 'bg-slate-100 text-slate-500',
};

const CONFIDENCE_LABEL = (modifier) => {
  if (modifier >= 1.0) return { label: 'High', cls: 'bg-emerald-50 text-emerald-700' };
  if (modifier >= 0.95) return { label: 'Good', cls: 'bg-teal-50 text-teal-700' };
  if (modifier >= 0.85) return { label: 'Moderate', cls: 'bg-amber-50 text-amber-700' };
  return { label: 'Low', cls: 'bg-red-50 text-red-700' };
};

export default function UploadOverviewTable({ categoryUploadStatuses }) {
  if (!categoryUploadStatuses) return null;

  const rows = UPLOAD_CATEGORIES.map((cat) => {
    const rec = categoryUploadStatuses[cat.id] || { months: 0, status: STATUS.MISSING };
    const total = cat.total ?? 12;
    const completeness = total > 0 ? Math.round((rec.months / total) * 100) : 0;
    const modifier = getConfidenceModifier(rec.months);
    const confidence = CONFIDENCE_LABEL(modifier);
    const statusLabel = STATUS_LABELS[rec.status] || rec.status;
    const badgeCls = STATUS_BADGE_CLS[rec.status] || STATUS_BADGE_CLS[STATUS.MISSING];
    return { cat, rec, total, completeness, confidence, statusLabel, badgeCls };
  });

  return (
    <PremiumCard className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            Data Coverage
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Upload Overview</h3>
          <p className="text-sm text-slate-500 mt-1">
            Evidence completeness across all operational categories.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Category', 'Months Uploaded', 'Completeness', 'Confidence Level', 'Status'].map((h) => (
                <th key={h} className="text-left text-xs font-black uppercase tracking-wider text-slate-400 py-4 pr-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cat, rec, total, completeness, confidence, statusLabel, badgeCls }) => (
              <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 pr-6">
                  <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                </td>
                <td className="py-4 pr-6">
                  <span className="text-sm font-bold text-slate-900">{rec.months}</span>
                  <span className="text-sm text-slate-400"> / {total}</span>
                </td>
                <td className="py-4 pr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{completeness}%</span>
                  </div>
                </td>
                <td className="py-4 pr-6">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${confidence.cls}`}>
                    {confidence.label}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badgeCls}`}>
                    {statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}