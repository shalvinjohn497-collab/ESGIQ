import { C } from '@/theme/colors';
import { FileDown, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function ReportsPage() {
    const { showToast } = useToast();
    const reports = [
        { name: 'ESG Readiness Report', status: 'Available', desc: 'Comprehensive sustainability assessment', icon: '📊' },
        { name: 'Emissions Inventory', status: 'Available', desc: 'Scope 1, 2, 3 emissions breakdown', icon: '🌍' },
        { name: 'Certification Gap Analysis', status: 'Available', desc: 'Requirements and gap details', icon: '📋' },
        { name: 'BRSR Annual Report', status: 'Coming Soon', desc: 'Business Responsibility and Sustainability Report', icon: '📄' },
        { name: 'GRI Disclosure Pack', status: 'Coming Soon', desc: 'Global Reporting Initiative format', icon: '🌱' },
    ];

    return (
        <div className="page animate-in">
            <h1 className="t-heading mb-1">Reports & Exports</h1>
            <p className="t-body mb-6">Generate and download ESG reports for compliance and disclosure</p>

            <div className="grid grid-2 gap-4">
                {reports.map((r) => (
                    <div key={r.name} className="card flex-between items-center">
                        <div className="flex items-center gap-4">
                            <span style={{ fontSize: 28 }}>{r.icon}</span>
                            <div>
                                <p className="t-base t-bold t-text">{r.name}</p>
                                <p className="t-caption mt-1">{r.desc}</p>
                            </div>
                        </div>
                        {r.status === 'Available'
                            ? <button className="btn btn-outline btn-sm" onClick={() => showToast('Report generation will be available after backend integration.')}><FileDown size={14} /> Download</button>
                            : <span className="badge badge-muted">{r.status}</span>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}
