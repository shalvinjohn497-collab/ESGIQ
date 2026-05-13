import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { C } from '@/theme/colors';

export default function ESGRadarChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={data}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: C.sub, fontSize: 11 }} />
                <Radar name="Score" dataKey="val" stroke={C.green} fill={C.green} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
        </ResponsiveContainer>
    );
}
