import { MIN_VALID_MONTHS } from '@/constants/confidenceModifiers';

export function applyAnnualization(total, months) {
    if (months < MIN_VALID_MONTHS) {
        return {
            annualizedValue: 0,
            isValid: false,
            isEstimated: true,
        };
    }

    return {
        annualizedValue: +(total / months * 12).toFixed(2),
        isValid: true,
        isEstimated: months < 12,
    };
}

export default applyAnnualization;
