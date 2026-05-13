import { C } from '@/theme/colors';

export const chartsConfig = {
    defaultHeight: 200,
    tooltip: {
        background: '#0d1a24',
        borderColor: C.border,
        borderRadius: 8,
        padding: '8px 12px',
    },
    axis: {
        tickColor: C.dim,
        tickFontSize: 10,
    },
    colors: {
        primary: C.green,
        secondary: C.blue,
        warning: C.amber,
        danger: C.rose,
    },
};

export default chartsConfig;
