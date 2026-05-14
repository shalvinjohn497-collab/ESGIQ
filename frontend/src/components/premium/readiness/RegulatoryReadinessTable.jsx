import { C } from '@/theme/colors';

export default function RegulatoryReadinessTable({ results = [] }) {
    if (!results || results.length === 0) {
        return (
            <div className="flex-center p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-slate-500 font-medium">No regulatory frameworks applicable.</span>
            </div>
        );
    }

    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' }; // rose-50, rose-500, rose-200
            case 'medium': return { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' }; // amber-50, amber-500, amber-200
            case 'low': return { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' }; // emerald-50, emerald-500, emerald-200
            default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }; // slate-50, slate-500, slate-200
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Regulation</th>
                            <th className="px-6 py-4">Country</th>
                            <th className="px-6 py-4">Applicable</th>
                            <th className="px-6 py-4">Risk Level</th>
                            <th className="px-6 py-4">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {results.map((item) => {
                            const rc = getRiskColor(item.riskLevel);
                            return (
                                <tr key={item.regulationId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600">{item.country}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-semibold ${item.applicable ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {item.applicable ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.applicable ? (
                                            <span 
                                                className="px-2.5 py-1 text-xs font-bold rounded-md"
                                                style={{ backgroundColor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                                            >
                                                {item.riskLevel.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                            {item.notes}
                                        </p>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
