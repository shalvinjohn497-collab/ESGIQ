import { C } from '@/theme/colors';

// Static healthcare industry benchmark data
const BENCHMARKS = {
    industryAvg: 61,
    topQuartile: 84,
    industryLabel: 'Healthcare Avg',
};

function computePercentile(score) {
    // Rough linear percentile estimate against the benchmark distribution
    if (score >= BENCHMARKS.topQuartile) return 'Top 10%';
    if (score >= 78) return 'Top 18%';
    if (score >= 70) return 'Top 30%';
    if (score >= BENCHMARKS.industryAvg) return 'Top 50%';
    return 'Bottom 50%';
}

export default function BenchmarkStrip({ score }) {
    const percentile = computePercentile(score);
    const isAboveAvg = score >= BENCHMARKS.industryAvg;
    const isTopQ = score >= BENCHMARKS.topQuartile;

    const items = [
        { label: 'Your Organisation', value: score, color: isTopQ ? C.green : isAboveAvg ? C.amber : C.rose, bold: true },
        { label: BENCHMARKS.industryLabel, value: BENCHMARKS.industryAvg, color: C.dim, bold: false },
        { label: 'Top Quartile', value: BENCHMARKS.topQuartile, color: C.sub, bold: false },
    ];

    return (
        <div
            className="mb-6"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                background: 'rgba(255,255,255,0.025)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
            }}
        >
            {items.map((item, i) => (
                <div
                    key={item.label}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRight: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <span className="t-micro" style={{ color: 'var(--dim)', letterSpacing: 0.8 }}>
                        {item.label.toUpperCase()}
                    </span>
                    <span
                        className="t-small"
                        style={{
                            color: item.color,
                            fontWeight: item.bold ? 700 : 500,
                            fontSize: item.bold ? 'var(--fs-base)' : 'var(--fs-small)',
                        }}
                    >
                        {item.value}
                        <span style={{ fontWeight: 400, color: 'var(--dim)', fontSize: '0.75em', marginLeft: 3 }}>/100</span>
                    </span>
                </div>
            ))}

            {/* Percentile badge */}
            <div
                style={{
                    padding: '10px 20px',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: 110,
                }}
            >
                <span className="t-micro" style={{ color: 'var(--dim)', letterSpacing: 0.8 }}>PERCENTILE</span>
                <span
                    className="t-small"
                    style={{
                        fontWeight: 700,
                        color: isTopQ ? C.green : isAboveAvg ? C.amber : C.sub,
                    }}
                >
                    {percentile}
                </span>
            </div>
        </div>
    );
}
