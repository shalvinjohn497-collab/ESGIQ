import { CERTIFICATION_PREREQUISITES } from '@/constants/certificationPrerequisites';

export function checkPrerequisites(
    certId,
    flags,
    filledMonths,
    totalElec,
    totalDiesel,
    operationalMetrics = {}
) {
    const {
    waterMonitoringMonths = 0,
    recycledWaterAvailable = false,
    biomedicalWasteTracked = false,
    segregationMaturity = 0,
    dieselLitresTotal = 0,
} = operationalMetrics;
    const prereqs = CERTIFICATION_PREREQUISITES;
    if (!prereqs[certId]) return { passed: true, missing: [] };

    const safeFlags = flags || {};

    const keyMap = {
        biomedicalWasteVendor: Boolean(safeFlags.authVendor),
        infectionControlSOPs: Boolean(safeFlags.sops),
        biomedicalWasteRecords:
    biomedicalWasteTracked ||
    Boolean(safeFlags.wtTrack),
        energyTracking6Months: filledMonths >= 6,
        waterTracking6Months:
    waterMonitoringMonths >= 6 ||
    Boolean(safeFlags.wTrack),
        energyMonitoringSystem: Boolean(safeFlags.hasBMS),
        waterMeteringBySource: Boolean(safeFlags.wSplit),
        policy: Boolean(safeFlags.policy),
        esgOwner: Boolean(safeFlags.esgOwner),
        compliance: Boolean(safeFlags.compliance),
        iaqMonitoring: Boolean(safeFlags.iaqMonitoring),
        scope1Available:
    dieselLitresTotal > 0 ||
    (totalDiesel || 0) > 0,
        scope2Available: (totalElec || 0) > 0,
    };

    const missing = prereqs[certId].prerequisites
        .filter((p) => !keyMap[p.key])
        .map((p) => p.label);

    return { passed: missing.length === 0, missing };
}

export default checkPrerequisites;
