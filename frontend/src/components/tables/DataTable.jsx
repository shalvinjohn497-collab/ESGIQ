import { C } from '@/theme/colors';

export default function DataTable({ columns, rows, style }) {
    return (
        <div style={{ overflowX: 'auto', ...style }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                    <tr>
                        {columns.map((h) => (
                            <th key={h} style={{
                                color: C.sub, fontWeight: 600, padding: '6px 10px', textAlign: 'left',
                                borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            {row.map((cell, j) => (
                                <td key={j} style={{ padding: '7px 10px', color: C.text }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
