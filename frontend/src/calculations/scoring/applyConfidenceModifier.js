import { getConfidenceModifier } from '@/constants/confidenceModifiers';

export function applyConfidenceModifier(rawScore, months) {
    const modifier = getConfidenceModifier(months);
    if (modifier === null) return 0;
    return +(rawScore * modifier).toFixed(2);
}

export default applyConfidenceModifier;
