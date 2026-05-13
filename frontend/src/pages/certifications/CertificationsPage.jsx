import { useState } from 'react';
import { C } from '@/theme/colors';
import ProgressBar from '@/components/indicators/ProgressBar';
import RiskIndicator from '@/components/indicators/RiskIndicator';
import Button from '@/components/ui/Button';
import { Award, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { CERT_DATABASE } from '@/constants/certifications';
import { useAssessmentResults } from '@/modules/assessment/hooks/useAssessmentResults';

export default function CertificationsPage() {
    const { certificationResults } = useAssessmentResults();
    const FALLBACK_CERTS = CERT_DATABASE.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        score: c.score,
        rawScore: c.score,
        status: c.status,
        color: c.color,
        timeline: c.timeline,
        isPrimary: false,
        prerequisitesPassed: c.requirements.every((r) => r.met),
        missingPrerequisites: c.requirements.filter((r) => !r.met).map((r) => r.name),
        majorGap: c.requirements.find((r) => !r.met)?.name || null,
    }));
    const certRows = certificationResults?.all?.length ? certificationResults.all : FALLBACK_CERTS;
    const [selectedId, setSelectedId] = useState(certRows[0]?.id || 'nabh');
    const selected = certRows.find((c) => c.id === selectedId) || certRows[0];
    const eligibleCerts = certificationResults?.eligible?.length ? certificationResults.eligible : certRows.filter((c) => c.score >= 60);
    const blockedCerts = certificationResults?.blocked?.length ? certificationResults.blocked : certRows.filter((c) => c.score < 40);
    const totalReqs = selected?.missingPrerequisites?.length || 0;
    const metCount = selected?.prerequisitesPassed ? 1 : 0;
    const gapCount = selected?.missingPrerequisites?.length || 0;
    const overallReady = certRows.filter((c) => c.score >= 70).length;

    return (
        <div className="page animate-in">
            {/* ─── Header ─── */}
            <div className="flex-between mb-6">
                <div>
                    <h1 className="t-heading">Certification Readiness Engine</h1>
                    <p className="t-body mt-1">Track eligibility, gap analysis, and roadmap to ESG certifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <RiskIndicator level={overallReady >= 4 ? 'low' : overallReady >= 2 ? 'medium' : 'high'}
                        label={`${overallReady}/${certRows.length} Ready`} />
                </div>
            </div>

            {/* ─── Certification Grid ─── */}
            <div className="grid grid-4 gap-3 mb-5">
                {certRows.map((cert) => {
                    const isActive = cert.id === selectedId;
                    return (
                        <button
                            key={cert.id}
                            onClick={() => setSelectedId(cert.id)}
                            className={isActive ? 'card-highlight pointer' : 'card pointer'}
                            style={isActive ? { borderColor: cert.color + '60' } : {}}
                        >
                            <div className="flex-col gap-3" style={{ textAlign: 'left' }}>
                                <div className="flex-between items-center">
                                    <span className="t-base t-bold t-text">{cert.name}</span>
                                    <span className="t-sub t-800" style={{ color: cert.color }}>{cert.score}%</span>
                                </div>
                                <ProgressBar value={cert.score} color={cert.color} height={3} />
                                <div className="flex-between">
                                    <span className="t-micro" style={{ color: cert.color }}>{cert.status}</span>
                                    <span className="t-micro" style={{ color: 'var(--dim)' }}>
                                        {cert.isPrimary ? 'Primary' : 'Secondary'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ─── Detail Panel ─── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Left: Requirements Checklist */}
                <div className="card flex-col gap-4">
                    <div className="flex-between items-center">
                        <div>
                            <h2 className="t-sub t-bold t-text">{selected.name}</h2>
                            <p className="t-caption mt-1">{selected.fullName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="badge" style={{ background: selected.color + '18', color: selected.color }}>
                                {selected.category}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="card-inner flex-col items-center gap-1 flex-1">
                            <span className="t-heading t-800" style={{ color: selected.color }}>{selected.score}%</span>
                            <span className="t-micro" style={{ color: 'var(--dim)' }}>Readiness</span>
                        </div>
                        <div className="card-inner flex-col items-center gap-1 flex-1">
                            <span className="t-heading t-800 t-text">{metCount}/{totalReqs}</span>
                            <span className="t-micro" style={{ color: 'var(--dim)' }}>Requirements Met</span>
                        </div>
                        <div className="card-inner flex-col items-center gap-1 flex-1">
                            <span className="t-heading t-800" style={{ color: gapCount > 2 ? C.rose : C.amber }}>{gapCount}</span>
                            <span className="t-micro" style={{ color: 'var(--dim)' }}>Gaps</span>
                        </div>
                    </div>

                    <div>
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>REQUIREMENTS CHECKLIST</span>
                        <div className="flex-col gap-2 mt-3">
                            {(selected.missingPrerequisites?.length ? selected.missingPrerequisites : ['No missing prerequisites']).map((req, i) => (
                                <div key={i} className="flex items-center gap-3" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: req === 'No missing prerequisites' ? 'transparent' : 'var(--surface2)' }}>
                                    {req === 'No missing prerequisites'
                                        ? <CheckCircle size={16} style={{ color: C.green, flexShrink: 0 }} />
                                        : <XCircle size={16} style={{ color: C.rose, flexShrink: 0 }} />
                                    }
                                    <span className="t-small" style={{ color: req === 'No missing prerequisites' ? 'var(--sub)' : 'var(--text)', fontWeight: req === 'No missing prerequisites' ? 400 : 500 }}>
                                        {req}
                                    </span>
                                    {req !== 'No missing prerequisites' && (
                                        <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: 9 }}>GAP</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Roadmap & Timeline */}
                <div className="flex-col gap-4">
                    <div className="card flex-col gap-4">
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>CERTIFICATION ROADMAP</span>

                        <div className="flex items-center gap-3">
                            <Clock size={16} style={{ color: 'var(--dim)' }} />
                            <span className="t-body t-text">Estimated timeline: <strong>{selected.timeline}</strong></span>
                        </div>

                        <div className="flex-col gap-3">
                            {(selected.missingPrerequisites || []).map((req, i) => (
                                <div key={i} className="card-inner flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="flex-center shrink-0" style={{
                                            width: 22, height: 22, borderRadius: 11,
                                            background: i === 0 ? C.rDim : C.aDim,
                                            color: i === 0 ? C.rose : C.amber,
                                            fontSize: 10, fontWeight: 800,
                                        }}>{i + 1}</span>
                                        <span className="t-small t-text" style={{ fontWeight: 500 }}>{req}</span>
                                    </div>
                                    <span className="t-micro" style={{ color: 'var(--dim)', paddingLeft: 30 }}>
                                        {i === 0 ? 'Immediate priority' : i < 3 ? '1–3 months' : '3–6 months'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All Certifications Summary Table */}
                    <div className="card flex-col gap-3">
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>ALL CERTIFICATIONS OVERVIEW</span>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Certification</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Timeline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certRows.map((cert) => (
                                    <tr key={cert.id} className="pointer" onClick={() => setSelectedId(cert.id)}
                                        style={cert.id === selectedId ? { background: 'var(--surface2)' } : {}}>
                                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{cert.name}</td>
                                        <td style={{ color: cert.color, fontWeight: 700 }}>{cert.score}%</td>
                                        <td><span className="badge" style={{ background: cert.color + '18', color: cert.color, fontSize: 9 }}>{cert.status}</span></td>
                                        <td style={{ color: 'var(--dim)' }}>{cert.timeline}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card flex-col gap-3">
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>ELIGIBLE CERTIFICATIONS</span>
                        <div className="flex-col gap-2">
                            {eligibleCerts.map((cert) => (
                                <div key={cert.id} className="card-inner" style={{ border: `1px solid ${cert.color}40` }}>
                                    <span className="t-small t-bold" style={{ color: cert.color }}>{cert.name}</span>
                                    <span className="t-micro" style={{ color: 'var(--dim)', marginLeft: 8 }}>{cert.score}% • {cert.timeline}</span>
                                </div>
                            ))}
                        </div>
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>BLOCKED CERTIFICATIONS</span>
                        <div className="flex-col gap-2">
                            {blockedCerts.map((cert) => (
                                <div key={cert.id} className="card-inner">
                                    <div className="t-small t-bold" style={{ color: cert.color }}>{cert.name}</div>
                                    <div className="t-micro" style={{ color: 'var(--dim)' }}>
                                        {cert.missingPrerequisites?.length ? cert.missingPrerequisites.join(', ') : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
