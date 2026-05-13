export default function StatusBadge({ label, color, icon }) {
    return (
        <span className="badge" style={{ background: color + '18', color }}>
            {icon && <span>{icon}</span>}
            {label}
        </span>
    );
}
