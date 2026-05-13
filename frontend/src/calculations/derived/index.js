// ─────────────────────────────────────────────
// src/calculations/derived/index.js
// Single export point for all derived metrics.
// No logic here. Exports only.
// All consumers import from here — never directly
// from individual derive files.
// ─────────────────────────────────────────────

export { deriveEnergyMetrics } from './deriveEnergyMetrics';
export { deriveWaterMetrics }  from './deriveWaterMetrics';
export { deriveWasteMetrics }  from './deriveWasteMetrics';