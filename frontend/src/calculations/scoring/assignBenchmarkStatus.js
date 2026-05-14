/**
 * BRD §11.3 benchmark band statuses (e.g. KPI dashboard).
 */

export const BENCHMARK_STATUS = Object.freeze({
    BETTER_THAN_BENCHMARK: 'BETTER_THAN_BENCHMARK',
    SLIGHTLY_BELOW: 'SLIGHTLY_BELOW',
    WITHIN_BENCHMARK: 'WITHIN_BENCHMARK',
    BELOW_BENCHMARK: 'BELOW_BENCHMARK',
});

const LABEL = Object.freeze({
    [BENCHMARK_STATUS.BETTER_THAN_BENCHMARK]: 'Better Than Benchmark',
    [BENCHMARK_STATUS.SLIGHTLY_BELOW]: 'Slightly Below',
    [BENCHMARK_STATUS.WITHIN_BENCHMARK]: 'Within Benchmark',
    [BENCHMARK_STATUS.BELOW_BENCHMARK]: 'Below Benchmark',
});

const COLOUR = Object.freeze({
    [BENCHMARK_STATUS.BETTER_THAN_BENCHMARK]: 'emerald',
    [BENCHMARK_STATUS.SLIGHTLY_BELOW]: 'amber',
    [BENCHMARK_STATUS.WITHIN_BENCHMARK]: 'teal',
    [BENCHMARK_STATUS.BELOW_BENCHMARK]: 'red',
});

/**
 * Lower-is-better (e.g. energy / water intensity):
 * - value ≤ lowerBound × 0.85 → Better Than Benchmark (green)
 * - lowerBound × 0.85 < value ≤ lowerBound → Slightly Below (amber)
 * - lowerBound < value ≤ upperBound → Within Benchmark (teal)
 * - value > upperBound → Below Benchmark (red)
 *
 * Set `lowerIsBetter: false` for higher-is-better metrics (e.g. renewable %, recycling rate)
 * using the mirrored band logic.
 *
 * @param {number} value
 * @param {number} lowerBound
 * @param {number} upperBound
 * @param {{ lowerIsBetter?: boolean }} [options]
 * @returns {{ status: string, label: string, colour: string }}
 */
export function assignBenchmarkStatus(value, lowerBound, upperBound, options = {}) {
    const v = Number(value);
    const lb = Number(lowerBound);
    const ub = Number(upperBound);
    const lowerIsBetter = options.lowerIsBetter !== false;

    const fallback = () => ({
        status: BENCHMARK_STATUS.WITHIN_BENCHMARK,
        label: LABEL[BENCHMARK_STATUS.WITHIN_BENCHMARK],
        colour: COLOUR[BENCHMARK_STATUS.WITHIN_BENCHMARK],
    });

    if (!Number.isFinite(v) || !Number.isFinite(lb) || !Number.isFinite(ub) || lb > ub) {
        return fallback();
    }

    let status;

    if (lowerIsBetter) {
        const edge = lb * 0.85;
        if (v <= edge) status = BENCHMARK_STATUS.BETTER_THAN_BENCHMARK;
        else if (v <= lb) status = BENCHMARK_STATUS.SLIGHTLY_BELOW;
        else if (v <= ub) status = BENCHMARK_STATUS.WITHIN_BENCHMARK;
        else status = BENCHMARK_STATUS.BELOW_BENCHMARK;
    } else {
        const exceptional = ub / 0.85;
        if (v >= exceptional) status = BENCHMARK_STATUS.BETTER_THAN_BENCHMARK;
        else if (v > ub) status = BENCHMARK_STATUS.SLIGHTLY_BELOW;
        else if (v >= lb) status = BENCHMARK_STATUS.WITHIN_BENCHMARK;
        else if (v > lb * 0.85) status = BENCHMARK_STATUS.SLIGHTLY_BELOW;
        else status = BENCHMARK_STATUS.BELOW_BENCHMARK;
    }

    return {
        status,
        label: LABEL[status],
        colour: COLOUR[status],
    };
}

export default assignBenchmarkStatus;
