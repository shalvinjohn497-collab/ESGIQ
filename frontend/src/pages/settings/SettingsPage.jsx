import { useState } from 'react';
import { C } from '@/theme/colors';
import Toggle from '@/components/ui/Toggle';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
    const { showToast } = useToast();
    const [toggles, setToggles] = useState({ email: true, auto: true, dark: true });
    return (
        <div className="page animate-in">
            <h1 className="t-heading mb-1">Settings</h1>
            <p className="t-body mb-6">Manage your organization profile and preferences</p>

            <div className="grid grid-2 gap-4">
                <div className="card">
                    <h3 className="t-sub t-bold t-text mb-4">Organization</h3>
                    <div className="flex-col gap-3">
                        <div>
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>ORG NAME</label>
                            <input className="input" defaultValue="Sunrise Multispecialty Hospital" />
                        </div>
                        <div>
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>SECTOR</label>
                            <input className="input" defaultValue="Healthcare" />
                        </div>
                        <div>
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>FISCAL YEAR</label>
                            <input className="input" defaultValue="FY 2024-25" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="t-sub t-bold t-text mb-4">Preferences</h3>
                    <div className="flex-col gap-4">
                        {[
                            { id: 'email', label: 'Email notifications', desc: 'Assessment reminders and updates' },
                            { id: 'auto', label: 'Auto-save drafts', desc: 'Save assessment progress automatically' },
                            { id: 'dark', label: 'Dark mode', desc: 'Always enabled (enterprise default)' },
                        ].map((p) => (
                            <div key={p.label} className="flex-between">
                                <div>
                                    <p className="t-base t-text">{p.label}</p>
                                    <p className="t-caption mt-1">{p.desc}</p>
                                </div>
                                <Toggle value={toggles[p.id]} onChange={(v) => {
                                    setToggles({ ...toggles, [p.id]: v });
                                    showToast('Preferences updated locally. Will persist once backend is connected.', 'success');
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
