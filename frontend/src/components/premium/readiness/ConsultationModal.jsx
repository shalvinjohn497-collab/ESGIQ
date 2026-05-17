import { useState } from 'react';
import { X } from 'lucide-react';
import { consultationApi } from '@/services/api/consultation.api';
import useAuthStore from '@/store/auth.store';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

export default function ConsultationModal({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);

  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    orgName: user?.orgName || '',
    message: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setLoading(true);
    setError('');
    try {
      await consultationApi.create({ ...form, assessmentId });
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 40, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Request Submitted</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Our ESG consultants will reach out to <strong>{form.email}</strong> within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 4 }}>Expert Consultation</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Book ESG Consultation</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Our consultants will review your assessment and contact you within 24 hours.</p>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name',    label: 'Full Name',    type: 'text' },
                { key: 'email',   label: 'Email Address', type: 'email' },
                { key: 'orgName', label: 'Organization', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Message (optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={3}
                  placeholder="What would you like help with?"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: 24, width: '100%', padding: '13px', background: loading ? '#94a3b8' : '#10b981', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Submitting…' : 'Request Consultation →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
