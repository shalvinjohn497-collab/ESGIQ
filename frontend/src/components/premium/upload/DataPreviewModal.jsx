import { X } from 'lucide-react';

export default function DataPreviewModal({ categoryId, categoryLabel, data, onClose }) {
  if (!data || data.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-[24px] p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">{categoryLabel} — Preview</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-500">No records found for this category.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[24px] p-8 max-w-3xl w-full mx-4 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Data Preview</p>
            <h3 className="text-xl font-bold text-slate-900">{categoryLabel}</h3>
            <p className="text-sm text-slate-500">{data.length} records</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th key={col} className="text-left text-xs font-black uppercase tracking-wider text-slate-400 py-3 pr-4 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                  {columns.map((col) => (
                    <td key={col} className="py-3 pr-4 text-slate-700 whitespace-nowrap">
                      {row[col] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 50 && (
            <p className="text-xs text-slate-400 mt-4 text-center">Showing first 50 of {data.length} records</p>
          )}
        </div>
      </div>
    </div>
  );
}
