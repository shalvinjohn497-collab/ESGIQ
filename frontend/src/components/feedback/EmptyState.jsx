import { C } from '@/theme/colors';

export default function EmptyState({ title = 'No data', description = '', icon }) {
    return (
        <div className="flex-center flex-col gap-3" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
            {icon && <span style={{ fontSize: 40 }}>{icon}</span>}
            <h3 className="t-sub t-bold t-text">{title}</h3>
            {description && <p className="t-body">{description}</p>}
        </div>
    );
}
