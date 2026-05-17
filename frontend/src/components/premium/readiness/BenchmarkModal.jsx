import { X } from 'lucide-react';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { SECTOR_CODES } from '@/constants/sectors';

const BENCHMARKS = {
  energy: { label: 'Energy Score', low: 40, high: 70, unit: '/100' },
  water:  { label: 'Water Score',  low: 40, high: 70, unit: '/100' },
  waste:  { label: 'Waste Score',  low: 40, high: 70, unit: '/100' },
  gov:    { label: 'Governance',   low: 40, high: 70, unit: '/100' },
};

function Bar({ value, low, high }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = value >= high ? '#10b981' : value >= low ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ position: 'relative', height: 8, background: '#f1f5f9', borderRadius: 8, marginTop: 6 }}>
      <div style={{ position: 'absolute', left: `${low}%`, width: `${high - low}%`, height: '100%', background: '#d1fae5', borderRadius: 8 }} />
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.5s' }} />
    </div>
  );
}

export default function BenchmarkModal({ scores, onClose }) {
  const sector = useAssessmentStore((s) => s.sector);
  const sectorLabel = SECTOR_CODES[sector] || sector || 'General';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 40, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 4 }}>Industry Benchmark</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Score Comparison</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Sector: <strong>{sectorLabel}</strong> — Green band = industry benchmark range (40–70)</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(BENCHMARKS).map(([key, cfg]) => {
            const val = scores?.[key] ?? 0;
            const status = val >= cfg.high ? 'Within benchmark' : val >= cfg.low ? 'Approaching' : 'Below benchmark';
            const statusColor = val >= cfg.high ? '#10b981' : val >= cfg.low ? '#f59e0b' : '#ef4444';
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{cfg.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{val}{cfg.unit}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: statusColor + '15', padding: '2px 8px', borderRadius: 6 }}>{status}</span>
                  </div>
                </div>
                <Bar value={val} low={cfg.low} high={cfg.high} />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, padding: '16px 20px', background: '#f8fafc', borderRadius: 16, fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#0f172a' }}>How to read this:</strong> The green band shows the typical industry range (40–70). Scores above 70 are strong. Scores below 40 need attention before certification submissions.
        </div>
      </div>
    </div>
  );
}
