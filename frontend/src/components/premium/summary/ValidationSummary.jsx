import React from 'react';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { PremiumCard } from '../shared/PremiumCard';

const SPIKE_CATEGORY_LABEL = {
    electricity: 'Electricity',
    water: 'Water',
    fuel: 'Fuel',
    waste: 'Waste',
};

function directionLabel(direction) {
    return direction === 'spike' ? 'Spike' : 'Drop';
}

export const ValidationSummary = ({
    metrics = {},
    spikeWarningsByCategory = null,
    duplicateNoticesByCategory = null,
}) => {
    const spikeEntries =
        spikeWarningsByCategory &&
        Object.entries(spikeWarningsByCategory).filter(([, warns]) => Array.isArray(warns) && warns.length > 0);

    const duplicateEntries =
        duplicateNoticesByCategory &&
        Object.entries(duplicateNoticesByCategory).filter(
            ([, info]) => info && typeof info.duplicatesRemoved === 'number' && info.duplicatesRemoved > 0
        );

    return (
        <PremiumCard className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900">Audit-Grade Validation</h3>

                    <p className="text-sm text-slate-500">
                        Platform verified operational evidence against certification requirements.
                    </p>
                </div>
            </div>

            {duplicateEntries && duplicateEntries.length > 0 && (
                <div className="space-y-3 mb-8">
                    {duplicateEntries.map(([categoryId, info]) => (
                        <div
                            key={`dup-${categoryId}`}
                            className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
                        >
                            <div className="flex items-start gap-2 font-semibold text-sky-900">
                                <Info className="w-4 h-4 mt-0.5 shrink-0 text-sky-600" />
                                <span>
                                    Duplicate month rows resolved — {SPIKE_CATEGORY_LABEL[categoryId] || categoryId}{' '}
                                    <span className="text-sky-700 font-normal">
                                        ({info.duplicatesRemoved} duplicate row
                                        {info.duplicatesRemoved === 1 ? '' : 's'} removed)
                                    </span>
                                </span>
                            </div>
                            <p className="text-xs text-sky-800/85 mt-1 pl-6">
                                Months with duplicates:{' '}
                                {info.months?.length ? info.months.join(', ') : '—'}
                            </p>
                            <ul className="mt-2 ml-6 list-disc space-y-1.5 text-sky-900/90">
                                {(info.keptDetails || []).map((d) => (
                                    <li key={`${categoryId}-${d.month}`}>
                                        <span className="font-medium">{d.month}</span>: {d.summary}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {spikeEntries && spikeEntries.length > 0 && (
                <div className="space-y-3 mb-8">
                    {spikeEntries.map(([categoryId, warnings]) => (
                        <div
                            key={categoryId}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                        >
                            <div className="flex items-start gap-2 font-bold text-amber-900">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                                <span>
                                    Month-on-month alert —{' '}
                                    {SPIKE_CATEGORY_LABEL[categoryId] || categoryId}
                                </span>
                            </div>
                            <ul className="mt-2 ml-6 list-disc space-y-1 text-amber-900/90">
                                {warnings.map((w, idx) => (
                                    <li key={`${w.previousMonth}-${w.month}-${idx}`}>
                                        {w.previousMonth} → {w.month}: {directionLabel(w.direction)} (
                                        {w.changePercent > 0 ? '+' : ''}
                                        {w.changePercent}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ValidationItem
                    label="Energy Continuity"
                    value={`${metrics?.energyMonitoringMonths || 0}/12 Mo`}
                    desc="Continuous tracking verified"
                />

                <ValidationItem
                    label="Resource Recovery"
                    value={metrics?.recycledWaterAvailable ? 'STP Active' : 'Pending'}
                    desc="Water reuse infrastructure"
                />

                <ValidationItem
                    label="Waste Maturity"
                    value={`Level ${metrics?.segregationMaturity || 0}`}
                    desc="Segregation audit status"
                />
            </div>
        </PremiumCard>
    );
};

const ValidationItem = ({ label, value, desc }) => (
    <div className="border-l-2 border-emerald-500 pl-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>

        <p className="text-2xl font-bold text-slate-900 my-1">{value}</p>

        <p className="text-xs text-slate-500">{desc}</p>
    </div>
);
