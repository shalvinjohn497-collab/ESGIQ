export function applyPrerequisiteCap(rawScore, prerequisiteResult) {
    if (prerequisiteResult.passed) return rawScore;
    return Math.min(rawScore, 74);
}

export default applyPrerequisiteCap;
