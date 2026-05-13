
import { useRef, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader, ChevronDown, FileSpreadsheet, X } from 'lucide-react';
import { useFileUpload } from '@/modules/assessment/hooks/useFileUpload';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

export const PremiumUploadCard = ({ title, icon: Icon, categoryId }) => {
  const fileInputRef = useRef(null);
  const { handleFile, uploading, uploadErrors, lastUploaded } = useFileUpload();
  const uploadStatus = useAssessmentStore((s) => s.uploadStatus);
  const [expanded, setExpanded] = useState(false);

  const status = uploadStatus?.[categoryId];
  const monthsUploaded = status?.monthsUploaded ?? 0;
  const isExcel = status?.source === 'excel';
  const isComplete = monthsUploaded >= 10;
  const isPartial = monthsUploaded >= 6 && monthsUploaded < 10;
  const pct = Math.min(100, Math.round((monthsUploaded / 12) * 100));

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file, categoryId);
    e.target.value = '';
  }

  // Template download — generates a simple CSV template
  function downloadTemplate() {
    const templates = {
      electricity: 'Month,Electricity_kWh,Renewable_kWh,Diesel_Litres,Cost_INR\nJan,0,0,0,0\nFeb,0,0,0,0\nMar,0,0,0,0\nApr,0,0,0,0\nMay,0,0,0,0\nJun,0,0,0,0\nJul,0,0,0,0\nAug,0,0,0,0\nSep,0,0,0,0\nOct,0,0,0,0\nNov,0,0,0,0\nDec,0,0,0,0',
      water: 'Month,Municipal_KL,Tanker_KL,Borewell_KL,Recycled_KL,Total_KL\nJan,0,0,0,0,0\nFeb,0,0,0,0,0\nMar,0,0,0,0,0\nApr,0,0,0,0,0\nMay,0,0,0,0,0\nJun,0,0,0,0,0\nJul,0,0,0,0,0\nAug,0,0,0,0,0\nSep,0,0,0,0,0\nOct,0,0,0,0,0\nNov,0,0,0,0,0\nDec,0,0,0,0,0',
      fuel: 'Month,Diesel_Litres,PNG_kg,Runtime_Hours\nJan,0,0,0\nFeb,0,0,0\nMar,0,0,0\nApr,0,0,0\nMay,0,0,0\nJun,0,0,0\nJul,0,0,0\nAug,0,0,0\nSep,0,0,0\nOct,0,0,0\nNov,0,0,0\nDec,0,0,0',
      waste: 'Month,Wet_kg,Dry_kg,Biomedical_kg,Hazardous_kg,Total_kg\nJan,0,0,0,0,0\nFeb,0,0,0,0,0\nMar,0,0,0,0,0\nApr,0,0,0,0,0\nMay,0,0,0,0,0\nJun,0,0,0,0,0\nJul,0,0,0,0,0\nAug,0,0,0,0,0\nSep,0,0,0,0,0\nOct,0,0,0,0,0\nNov,0,0,0,0,0\nDec,0,0,0,0,0',
    };
    const csv = templates[categoryId] || templates.electricity;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAM_${title}_Template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[24px] overflow-hidden transition-all hover:border-emerald-300 hover:shadow-md">

      {/* Card Header — always visible */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            {Icon && <Icon className="w-6 h-6 text-slate-400" />}
          </div>

          {uploading ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
              <Loader className="w-3 h-3 animate-spin" /> Parsing
            </div>
          ) : isComplete ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </div>
          ) : isPartial ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">
              <AlertCircle className="w-3 h-3" /> Partial
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">
              Pending
            </div>
          )}
        </div>

        <h4 className="text-lg font-bold text-[#0f172a] mb-1">{title}</h4>
        <p className="text-sm text-slate-500 mb-4">Monthly operational consumption data.</p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isComplete ? '#10b981' : isPartial ? '#f59e0b' : '#e2e8f0',
            }}
          />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="text-xs font-medium text-slate-400">
            <span className="text-slate-900 font-bold">{monthsUploaded}</span>/12 months
            {isExcel && <span className="ml-2 text-emerald-600 font-bold">· Excel</span>}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            {expanded ? 'Close' : 'Manage'}
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>
      </div>

      {/* Expand Panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-3">

          {/* Error display */}
          {uploadErrors?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              {uploadErrors[0]}
            </div>
          )}

          {/* Success message */}
          {isExcel && lastUploaded?.category === categoryId && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 font-medium">
              ✓ {lastUploaded.fileName} uploaded — {monthsUploaded} months detected
            </div>
          )}

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Download CSV Template
          </button>

          {/* Upload File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading
              ? <><Loader className="w-4 h-4 animate-spin" /> Parsing file...</>
              : <><Upload className="w-4 h-4" /> {isExcel ? 'Replace Upload' : 'Upload Excel / CSV'}</>
            }
          </button>

        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
};

export default PremiumUploadCard;