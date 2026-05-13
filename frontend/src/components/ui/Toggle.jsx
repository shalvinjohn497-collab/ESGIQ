export default function Toggle({ value, onChange }) {
    return (
        <button
            className={`toggle ${value ? 'toggle-on' : 'toggle-off'}`}
            onClick={() => onChange(!value)}
        >
            <span className="toggle-knob" style={{ left: value ? 19 : 3 }} />
        </button>
    );
}
