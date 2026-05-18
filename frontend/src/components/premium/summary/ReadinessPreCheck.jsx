import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PremiumCard } from '../shared/PremiumCard';
import { STATUS } from '@/constants/uploadCategoryStatus';

const AREAS = [
  {
    key: 'energy',
    label: 'Energy',
    check: ({ scores, categoryUploadStatuses }) => {
      const st = categoryUploadStatuses?.electricity?.status;
      if (st === STATUS.ERROR) return 'fail';
      if (scores.energy >= 60 && scores.filled >= 6) return 'pass';
      if (scores.filled >= 3) return 'warn';
      return 'fail';
    },
  },
  {
    key: 'water',
    label: 'Water',
    check: ({ scores, categoryUploadStatuses }) => {
      const st = categoryUploadStatuses?.water?.status;
      if (st === STATUS.ERROR) return 'fail';
      if (scores.water >= 60 && scores.filledWaterMonths >= 6) return 'pass';
      if (scores.filledWaterMonths >= 3) return 'warn';
      return 'fail';
    },
  },
  {
    key: 'waste',
    label: 'Waste',
    check: ({ scores, categoryUploadStatuses }) => {
      const st = categoryUploadStatuses?.waste?.status;
      if (st === STATUS.ERROR) return 'fail';
      if (scores.waste >= 60 && scores.filledWasteMonths >= 6) return 'pass';
      if (scores.filledWasteMonths >= 3) return 'warn';
      return 'fail';
    },
  },
  {
    key: 'governance',
    label: 'Governance',
    check: ({ scores }) => {
      if (scores.gov >= 60) return 'pass';
      if (scores.gov >= 35) return 'warn';
      return 'fail';
    },
  },
  {
    key: 'data',
    label: 'Data Reliability',
    check: ({ hasBlockingConsistencyErrors, consistencyWarnings }) => {
      if (hasBlockingConsistencyErrors) return 'fail';
      if (consistencyWarnings?.length > 0) return 'warn';
      return 'pass';
    },
  },
];

const STATUS_CONFIG = {
  pass: {
    Icon: CheckCircle,
    iconCls: 'text-emerald-500',
    badgeCls: 'bg-emerald-50 text-emerald-700',
    label: 'Ready',
    border: 'border-emerald-200',
  },
  warn: {
    Icon: AlertTriangle,
    iconCls: 'text-amber-500',
    badgeCls: 'bg-amber-50 text-amber-700',
    label: 'Partial',
    border: 'border-amber-200',
  },
  fail: {
    Icon: XCircle,
    iconCls: 'text-red-500',
    badgeCls: 'bg-red-50 text-red-700',
    label: 'Needs Work',
    border: 'border-red-200',
  },
};

export default function ReadinessPreCheck({ scores, categoryUploadStatuses, hasBlockingConsistencyErrors, consistencyWarnings }) {
  if (!scores) return null;

  const ctx = { scores, categoryUploadStatuses, hasBlockingConsistencyErrors, consistencyWarnings };

  return (
    <PremiumCard className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          Pre-Check
        </p>
        <h3 className="text-2xl font-bold text-slate-900">Readiness Pre-Check</h3>
        <p className="text-sm text-slate-500 mt-1">
          Area-level readiness before proceeding to full analysis.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {AREAS.map(({ key, label, check }) => {
          const result = check(ctx);
          const { Icon, iconCls, badgeCls, label: stLabel, border } = STATUS_CONFIG[result];
          return (
            <div key={key} className={`border ${border} rounded-2xl p-5 flex flex-col items-center gap-3 text-center`}>
              <Icon className={`w-7 h-7 ${iconCls}`} />
              <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badgeCls}`}>
                {stLabel}
              </span>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}