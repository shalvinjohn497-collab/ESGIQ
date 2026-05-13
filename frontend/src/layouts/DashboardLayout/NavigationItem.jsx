import { C } from '@/theme/colors';

/**
 * NavigationItem — reusable nav item (used by Sidebar)
 */
export default function NavigationItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                width: 40, height: 40, borderRadius: 10,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active ? C.green : C.dim,
                background: active ? C.gDim : 'transparent',
                transition: 'all 0.15s',
            }}
        >
            {icon}
        </button>
    );
}
