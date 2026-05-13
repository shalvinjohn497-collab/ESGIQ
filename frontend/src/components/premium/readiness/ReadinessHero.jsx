import {
    ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, Radar,
} from 'recharts';

export const ReadinessHero = ({ score = 78, metrics = {}, radarData = [] }) => {
    // Normalize radarData — support both {A: val} and {val: val} shapes
    const normalizedRadar = radarData.map((d) => ({
        subject: d.subject,
        A: d.A ?? d.val ?? 0,
        full: 100,
    }));

    const circumference = 502;
    const offset = circumference - (circumference * score) / 100;

    return (
        <div className="bg-white border border-[#e2e8f0] rounded-[32px] p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Score Ring */}
                <div className="lg:col-span-3 flex flex-col items-center border-r border-slate-100 pr-8">
                    <div className="relative flex items-center justify-center">
                        <svg className="w-44 h-44 transform -rotate-90">
                            <circle cx="88" cy="88" r="80"
                                stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                            <circle cx="88" cy="88" r="80"
                                stroke="#10b981" strokeWidth="12" fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-5xl font-black text-[#0f172a] tracking-tighter">
                            {score}%
                        </span>
                    </div>
                    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Overall Readiness
                    </p>
                </div>

                {/* Intelligence Narrative */}
                <div className="lg:col-span-5 px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Audit Ready
                    </div>

                    <h2 className="text-3xl font-bold text-[#0f172a] tracking-tight mb-4">
                        Facility Maturity Index
                    </h2>

                    <p className="text-[#64748b] leading-relaxed">
                        High operational evidence detected in{' '}
                        <span className="text-slate-900 font-semibold">Water & Waste</span>.
                        {' '}Current energy monitoring duration (
                        <span className="text-slate-900 font-semibold">
                            {metrics?.energyMonitoringMonths || 0} months
                        </span>) satisfies{' '}
                        <span className="text-slate-900 font-semibold">NABH Silver</span> prerequisites.
                    </p>

                    {/* Score pills */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {[
                            { label: 'Energy', val: metrics?.energyScore },
                            { label: 'Water', val: metrics?.waterScore },
                            { label: 'Waste', val: metrics?.wasteScore },
                            { label: 'Governance', val: metrics?.govScore },
                        ].map(({ label, val }) => val !== undefined && (
                            <div key={label} style={{
                                padding: '4px 12px',
                                borderRadius: 20,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#475569',
                            }}>
                                {label}: <span style={{ color: '#0f172a' }}>{val}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="lg:col-span-4 h-64 bg-slate-50/50 rounded-3xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={normalizedRadar}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            />
                            <Radar
                                name="Readiness"
                                dataKey="A"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.12}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default ReadinessHero;