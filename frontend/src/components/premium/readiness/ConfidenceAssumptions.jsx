const getConfidence = (months) => {
    if (months >= 12) return { modifier: '1.00', level: 'High', color: '#10b981' };
    if (months >= 9) return { modifier: '0.95', level: 'High', color: '#10b981' };
    if (months >= 6) return { modifier: '0.85', level: 'Medium', color: '#f59e0b' };
    if (months >= 3) return { modifier: '0.70', level: 'Low', color: '#f97316' };
    return { modifier: '0.00', level: 'Insufficient', color: '#ef4444' };
};

export default function ConfidenceAssumptions({ scores }) {
    const categories = [
        { label: 'Electricity', months: scores?.filled || 0 },
        { label: 'Water', months: scores?.filledWaterMonths || 0 },
        { label: 'Waste', months: scores?.filledWasteMonths || 0 },
        { label: 'Governance', months: 12 },
    ];

    const assumptions = [
        'Annualization method: Monthly average × 12',
        'Grid emission factor: 0.72 kgCO₂e/kWh (CEA India)',
        'Diesel emission factor: 2.68 kgCO₂e/litre (DEFRA)',
        'All partial-period values labelled Estimated',
    ];

    return (
        <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            padding: 32,
        }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', 
                letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 8 }}>
                Data Quality
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
                Confidence & Assumptions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {categories.map(({ label, months }) => {
                    const { modifier, level, color } = getConfidence(months);
                    return (
                        <div key={label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', 
                                marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                    {label}
                                </span>
                                <span style={{ fontSize: 13, color: '#64748b' }}>
                                    {months}/12 months · Modifier {modifier} · 
                                    <span style={{ color, fontWeight: 600 }}> {level}</span>
                                </span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99 }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(months / 12) * 100}%`,
                                    background: color,
                                    borderRadius: 99,
                                    transition: 'width 0.4s ease',
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', 
                    letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>
                    Assumptions Used
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {assumptions.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ color: '#10b981', fontWeight: 700, marginTop: 1 }}>·</span>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{a}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}