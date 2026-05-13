import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PremiumCard } from '../shared/PremiumCard';

export const ValidationSummary = ({ metrics = {} }) => {
  return (
    <PremiumCard className="p-8">
      <div className="flex items-center gap-4 mb-8">

        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Audit-Grade Validation
          </h3>

          <p className="text-sm text-slate-500">
            Platform verified operational evidence against certification requirements.
          </p>
        </div>

      </div>

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

    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </p>

    <p className="text-2xl font-bold text-slate-900 my-1">
      {value}
    </p>

    <p className="text-xs text-slate-500">
      {desc}
    </p>

  </div>
);