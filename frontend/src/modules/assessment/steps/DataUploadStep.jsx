import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UPLOAD_CATEGORIES } from '@/modules/assessment/configs/energy.module.jsx';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { ROUTES } from '@/constants/routes';
import { PremiumUploadCard } from '../../../components/premium/upload/PremiumUploadCard';
import { PremiumCard } from '../../../components/premium/shared/PremiumCard';
import { PageShell } from '../../../components/premium/layout/PageShell';
import { Building2, ShieldCheck, Zap } from 'lucide-react';

export default function DataUploadStep() {
    const navigate = useNavigate();
    const { rows, setRows, flags, setFlags } = useAssessmentStore();
    const [exp, setExp] = useState('electricity');

    const FACILITY_FIELDS = [
        { k: 'hasLED', l: 'LED Lighting ≥60%' },
        { k: 'hasBMS', l: 'BMS / Energy Monitoring' },
        { k: 'submetering', l: 'Sub-Metering in Place' },
        { k: 'wTrack', l: 'Water Tracking (12 mo.)' },
        { k: 'hasSTP', l: 'STP / Water Reuse System' },
        { k: 'segregation', l: 'Waste Segregation at Source' },
        { k: 'authVendor', l: 'Authorized Waste Vendor' },
        { k: 'policy', l: 'Sustainability Policy' },
        { k: 'esgOwner', l: 'ESG Owner Designated' },
        { k: 'sops', l: 'SOPs Documented' },
        { k: 'audits', l: 'Internal Audits Conducted' },
    ];

    return (
        <PageShell
            title="Operational Data Intake"
            subtitle="Upload facility operational evidence for ESG and certification analysis."
        >
            {/* Info Banner */}
            <div className="mb-8">
                <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            Audit-Grade Upload Validation
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                            Upload minimum 6 months of operational utility and waste data.
                            The platform derives evidence-based ESG intelligence directly from uploaded records.
                            Download the Excel template below to ensure correct column format.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Cards */}
            <div className="grid gap-6 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {UPLOAD_CATEGORIES.map((cat) => (
                    <PremiumUploadCard
                        key={cat.id}
                        title={cat.label}
                        icon={cat.iconComponent}
                        categoryId={cat.id}
                    />
                ))}
            </div>

            {/* Manual Electricity Table */}
            <PremiumCard className="p-8 mb-8">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">
                            Energy Dataset
                        </p>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                            Monthly Electricity Records
                        </h3>
                        <p className="text-sm text-slate-500">
                            Edit manually or upload Excel above. Scores update in real-time.
                        </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Month', 'Electricity (kWh)', 'Renewable (kWh)', 'DG Diesel (L)', 'Cost (₹)'].map((h) => (
                                    <th key={h} className="text-left text-xs font-black uppercase tracking-wider text-slate-400 py-4 pr-4">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={row.month} className="border-b border-slate-50">
                                    <td className="py-4 text-sm font-semibold text-slate-700 pr-4">
                                        {row.month}
                                    </td>
                                    {['elec', 'ren', 'diesel', 'cost'].map((field) => (
                                        <td key={field} className="py-3 pr-4">
                                            <input
                                                type="number"
                                                value={row[field]}
                                                onChange={(e) => {
                                                    const nr = [...rows];
                                                    nr[i] = { ...nr[i], [field]: Number(e.target.value) || 0 };
                                                    setRows(nr);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition-all"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>

            {/* Facility Details */}
            <PremiumCard className="p-8 mb-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">Facility Intelligence</h3>
                        <p className="text-sm text-slate-500">Infrastructure and governance indicators.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                            Built-Up Area (sqft)
                        </label>
                        <input
                            type="number"
                            value={flags.area}
                            onChange={(e) => setFlags({ ...flags, area: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                        />
                    </div>

                    {FACILITY_FIELDS.map(({ k, l }) => (
                        <div key={k} className="flex items-center justify-between border border-slate-100 rounded-2xl px-5 py-4 bg-slate-50/50">
                            <span className="text-sm font-medium text-slate-700">{l}</span>
                            <button
                                onClick={() => setFlags({ ...flags, [k]: !flags[k] })}
                                className={`relative w-11 h-6 rounded-full transition-all ${flags[k] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${flags[k] ? 'left-5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </PremiumCard>

            {/* CTA */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: 'rgba(248,250,252,0.95)',
                backdropFilter: 'blur(8px)',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 0',
                display: 'flex',
                justifyContent: 'flex-end',
                zIndex: 10,
                marginTop: 32,
            }}>
                <button
                    onClick={() => navigate(ROUTES.ASSESSMENT_SUMMARY)}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm"
                >
                    Continue to Validation →
                </button>
            </div>
        </PageShell>
    );
}