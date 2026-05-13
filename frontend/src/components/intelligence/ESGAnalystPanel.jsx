import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateInsights } from '@/utils/generateInsights';
import { C } from '@/theme/colors';
import { Minus, TrendingUp, AlertTriangle } from 'lucide-react';

const SEVERITY_CONFIG = {
    positive: { color: C.green, icon: TrendingUp, bg: 'rgba(52,211,153,0.07)' },
    warning: { color: C.amber, icon: AlertTriangle, bg: 'rgba(245,158,11,0.07)' },
    neutral: { color: C.dim, icon: Minus, bg: 'rgba(255,255,255,0.03)' },
};

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ESGAnalystPanel({ scores }) {
    const insights = useMemo(() => generateInsights(scores), [scores]);

    return (
        <div className="mb-8">
            <div className="flex-between mb-3">
                <span className="t-micro" style={{ letterSpacing: 1.5, color: 'var(--dim)' }}>
                    ESG ANALYST INTELLIGENCE
                </span>
                <span className="t-micro" style={{ color: 'var(--dim)', opacity: 0.6 }}>
                    DETERMINISTIC · RULE-BASED
                </span>
            </div>

            <motion.div
                className="flex-col gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {insights.map((insight) => {
                    const cfg = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.neutral;
                    const Icon = cfg.icon;
                    return (
                        <motion.div
                            key={insight.id}
                            variants={itemVariants}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 14px',
                                background: cfg.bg,
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: `3px solid ${cfg.color}40`,
                            }}
                        >
                            <Icon size={13} style={{ color: cfg.color, flexShrink: 0, opacity: 0.85 }} />
                            <span className="t-small t-text" style={{ fontWeight: 450, lineHeight: 1.5, color: 'var(--sub)' }}>
                                {insight.text}
                            </span>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
