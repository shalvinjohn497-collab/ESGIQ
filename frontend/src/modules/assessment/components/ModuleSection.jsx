import { C } from '@/theme/colors';
import Toggle from '@/components/ui/Toggle';

/**
 * ModuleSection — section with toggles for facility features
 */
export default function ModuleSection({ title, flags, onUpdateFlag, fields }) {
    return (
        <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 20,
            marginBottom: 24,
        }}>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>{title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {fields.map(({ k, l }) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <label style={{ color: C.sub, fontSize: 11 }}>{l}</label>
                        <Toggle value={flags[k]} onChange={(v) => onUpdateFlag(k, v)} />
                    </div>
                ))}
            </div>
        </div>
    );
}
