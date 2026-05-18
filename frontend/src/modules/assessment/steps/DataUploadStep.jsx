import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UPLOAD_CATEGORIES } from '@/modules/assessment/configs/energy.module.jsx';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { ROUTES } from '@/constants/routes';
import { SECTOR_CODES } from '@/constants/sectors';
import {
    FACILITY_FIELDS,
    getFacilityToggleFieldsForSector,
    getFacilityToggleKeysForSector,
    shouldShowBedCount,
} from '@/constants/facilityFieldsBySector';
import { buildCategoryUploadStatuses, canProceedToSummary } from '@/calculations/scoring/calculateReadiness';
import { PremiumUploadCard } from '../../../components/premium/upload/PremiumUploadCard';
import { PremiumCard } from '../../../components/premium/shared/PremiumCard';
import { PageShell } from '../../../components/premium/layout/PageShell';
import { Building2, ShieldCheck, Zap } from 'lucide-react';
import UploadedFilesList from '../../../components/premium/upload/UploadedFilesList';

export default function DataUploadStep() {
    const navigate = useNavigate();
    const {
        rows,
        setRows,
        flags,
        setFlags,
        waterRows,
        fuelRows,
        wasteRows,
        uploadStatus,
        sector,
        setSector,
    } = useAssessmentStore();

    const ALL_TOGGLE_KEYS = useMemo(() => FACILITY_FIELDS.map((f) => f.k), []);

    useEffect(() => {
        setFlags((prev) => {
            const visible = new Set(getFacilityToggleKeysForSector(sector));
            const next = { ...prev };
            let changed = false;
            for (const k of ALL_TOGGLE_KEYS) {
                if (!visible.has(k) && next[k]) {
                    next[k] = false;
                    changed = true;
                }
            }
            if (!shouldShowBedCount(sector)) {
                const bc = next.bedCount;
                if (bc !== undefined && bc !== '' && bc != null) {
                    next.bedCount = '';
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [sector, setFlags, ALL_TOGGLE_KEYS]);

    const visibleFacilityFields = useMemo(() => getFacilityToggleFieldsForSector(sector), [sector]);
    const categoryStatuses = useMemo(
        () => buildCategoryUploadStatuses({ rows, waterRows, fuelRows, wasteRows, uploadStatus }),
        [rows, waterRows, fuelRows, wasteRows, uploadStatus]
    );
    const summaryGate = useMemo(
        () => canProceedToSummary(categoryStatuses, UPLOAD_CATEGORIES),
        [categoryStatuses]
    );

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
                    <div className="md:col-span-2 xl:col-span-3">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                            Organization sector
                        </label>
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                        >
                            {Object.entries(SECTOR_CODES).map(([code, label]) => (
                                <option key={code} value={code}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2 max-w-2xl">
                            Sector drives which facility indicators and profile fields are shown (e.g. licensed bed count
                            for healthcare).
                        </p>
                    </div>

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
                    <div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Number of Employees
    </label>
    <input
        type="number"
        value={flags.employees || ''}
        onChange={(e) => setFlags({ ...flags, employees: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Average Daily Occupancy (persons/day)
    </label>
    <input
        type="number"
        value={flags.occupancy || ''}
        onChange={(e) => setFlags({ ...flags, occupancy: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
{shouldShowBedCount(sector) && (
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Licensed bed count
    </label>
    <input
        type="number"
        min={0}
        value={flags.bedCount ?? ''}
        onChange={(e) =>
            setFlags({
                ...flags,
                bedCount: e.target.value === '' ? '' : Number(e.target.value),
            })
        }
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
)}
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        LED Coverage %
    </label>
    <input
        type="number"
        min={0}
        max={100}
        value={flags.ledPct || ''}
        onChange={(e) => setFlags({ ...flags, ledPct: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        HVAC / Equipment Type
    </label>
    <select
        value={flags.hvacEfficient || ''}
        onChange={(e) => setFlags({ ...flags, hvacEfficient: e.target.value })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    >
        <option value="">Select type</option>
        <option value="modern">Modern / Efficient</option>
        <option value="moderate">Moderate</option>
        <option value="old">Old / Inefficient</option>
    </select>
</div>
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Power Factor (from EB bill)
    </label>
    <input
        type="number"
        step="0.01"
        min={0}
        max={1}
        value={flags.powerFactor || ''}
        onChange={(e) => setFlags({ ...flags, powerFactor: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Waste Segregation %
    </label>
    <input
        type="number"
        min={0}
        max={100}
        value={flags.wSegregate || ''}
        onChange={(e) => setFlags({ ...flags, wSegregate: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>
<div>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Recycling / Recovery Rate %
    </label>
    <input
        type="number"
        min={0}
        max={100}
        value={flags.recyclingPct || ''}
        onChange={(e) => setFlags({ ...flags, recyclingPct: Number(e.target.value) })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    />
</div>

<div>
  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
    Daily Operating Hours
  </label>
  <input
    type="number"
    min={1}
    max={24}
    value={flags.operatingHours || ''}
    onChange={(e) => setFlags({ ...flags, operatingHours: Number(e.target.value) })}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
    placeholder="e.g. 10"
  />
  <p className="text-xs text-slate-400 mt-2">
    Average operational hours per day. Used for energy intensity normalisation.
  </p>
</div>

<div className="md:col-span-2 xl:col-span-3">
  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
    Reason for Data Non-Availability (optional)
  </label>
  <textarea
    rows={3}
    value={flags.dataUnavailabilityReason || ''}
    onChange={(e) => setFlags({ ...flags, dataUnavailabilityReason: e.target.value })}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 resize-none"
    placeholder="e.g. Electricity bills for Jan–Mar unavailable due to billing dispute. Water records not maintained prior to April."
  />
  <p className="text-xs text-slate-400 mt-2">
    Document any gaps in uploaded data. This is recorded for audit transparency purposes.
  </p>
</div>

                    {visibleFacilityFields.map(({ k, l }) => (
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

            <UploadedFilesList />

            {/* CTA */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: 'rgba(248,250,252,0.95)',
                backdropFilter: 'blur(8px)',
                borderTop: '1px solid #e2e8f0',
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 8,
                zIndex: 10,
                marginTop: 32,
            }}>
                {!summaryGate.ok && (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 max-w-xl text-right">
                        Complete required uploads: each of Electricity, Water, Fuel, and Waste needs at least 3 months of
                        data (no parse errors). Categories with insufficient coverage, errors, or no data block this step.
                    </p>
                )}
                <button
                    onClick={() => summaryGate.ok && navigate(ROUTES.ASSESSMENT_SUMMARY)}
                    disabled={!summaryGate.ok}
                    className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                        summaryGate.ok
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    Continue to Validation →
                </button>
            </div>
        </PageShell>
    );
}