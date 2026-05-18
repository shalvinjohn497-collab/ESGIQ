import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { UPLOAD_CATEGORIES } from '@/modules/assessment/configs/energy.module.jsx';
import { FileText, Eye } from 'lucide-react';
import { useState } from 'react';
import { PremiumCard } from '../shared/PremiumCard';
import DataPreviewModal from './DataPreviewModal';

const STATUS_BADGE = {
  complete: { label: 'Uploaded', cls: 'bg-emerald-50 text-emerald-700' },
  partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-700' },
  insufficient: { label: 'Insufficient', cls: 'bg-orange-50 text-orange-700' },
  error: { label: 'Error', cls: 'bg-red-50 text-red-700' },
  missing: { label: 'No Data', cls: 'bg-slate-100 text-slate-500' },
};

export default function UploadedFilesList() {
  const uploadStatus = useAssessmentStore((s) => s.uploadStatus);
  const rows = useAssessmentStore((s) => s.rows);
  const waterRows = useAssessmentStore((s) => s.waterRows);
  const fuelRows = useAssessmentStore((s) => s.fuelRows);
  const wasteRows = useAssessmentStore((s) => s.wasteRows);
  const [previewCat, setPreviewCat] = useState(null);

  const dataMap = { electricity: rows, water: waterRows, fuel: fuelRows, waste: wasteRows };

  const uploads = UPLOAD_CATEGORIES.map((cat) => {
    const st = uploadStatus?.[cat.id] || {};
    return {
      id: cat.id,
      label: cat.label,
      fileName: st.fileName || null,
      uploadedAt: st.uploadedAt || null,
      monthsUploaded: st.monthsUploaded || 0,
      source: st.source || null,
      status: st.status || 'missing',
    };
  }).filter((u) => u.fileName || u.monthsUploaded > 0);

  if (uploads.length === 0) return null;

  return (
    <>
      <PremiumCard className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              Upload History
            </p>
            <h3 className="text-2xl font-bold text-slate-900">Recent Uploads</h3>
            <p className="text-sm text-slate-500 mt-1">Files processed in this session.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
            {uploads.length} / {UPLOAD_CATEGORIES.length} Categories
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['File Name', 'Category', 'Months', 'Uploaded At', 'Status', 'Preview'].map((h) => (
                  <th key={h} className="text-left text-xs font-black uppercase tracking-wider text-slate-400 py-4 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => {
                const badge = STATUS_BADGE[u.status] || STATUS_BADGE.missing;
                const dateStr = u.uploadedAt
                  ? new Date(u.uploadedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                  : '—';
                return (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                          {u.fileName || 'Manual entry'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-600">{u.label}</td>
                    <td className="py-4 pr-4 text-sm font-bold text-slate-900">{u.monthsUploaded}</td>
                    <td className="py-4 pr-4 text-sm text-slate-500">{dateStr}</td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => setPreviewCat(u.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {previewCat && (
        <DataPreviewModal
          categoryId={previewCat}
          categoryLabel={UPLOAD_CATEGORIES.find((c) => c.id === previewCat)?.label || previewCat}
          data={dataMap[previewCat] || []}
          onClose={() => setPreviewCat(null)}
        />
      )}
    </>
  );
}
