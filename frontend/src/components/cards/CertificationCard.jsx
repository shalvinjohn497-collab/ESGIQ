import { C } from '@/theme/colors';

export default function CertificationCard({ cert, score, status, color, time }) {
    return (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '7px 8px', color: C.text, fontWeight: 500, fontSize: 12 }}>{cert}</td>
            <td style={{ padding: '7px 8px', color, fontWeight: 700 }}>{score}%</td>
            <td style={{ padding: '7px 8px' }}>
                <span style={{ color, fontSize: 10, fontWeight: 600 }}>{status}</span>
            </td>
            <td style={{ padding: '7px 8px', color: C.dim, fontSize: 11 }}>{time}</td>
        </tr>
    );
}
