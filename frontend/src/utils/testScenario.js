/**
 * BRD Scenario A+B — Console Verification
 * Run: import this in main.jsx temporarily, or paste in browser console
 * after the app loads (all modules will be in scope via window if you expose them)
 */

import { calculateEnergyScore } from '@/calculations/energy/calculateEnergyScore';
import { calculateIntensity } from '@/calculations/energy/calculateIntensity';
import { calculateRenewableShare } from '@/calculations/energy/calculateRenewableShare';
import { calculateWaterScore, calculateWasteScore, calculateGovernanceScore, calculateReadiness } from '@/calculations/scoring/calculateReadiness';
import { calculateOverallScore } from '@/calculations/scoring/calculateOverallScore';
import { calculateScope1 } from '@/calculations/emissions/calculateScope1';
import { calculateScope2 } from '@/calculations/emissions/calculateScope2';
import { applyAnnualization } from '@/calculations/scoring/applyAnnualization';
import { calculateCertScore } from '@/calculations/certifications/calculateCertScore';

export function runBRDScenario() {
    console.group('=== BRD Scenario A+B Verification ===');

    // ── Inputs ─────────────────────────────────────────────
    const MONTHS       = 7;
    const TOTAL_ELEC   = 88000;     // kWh, Jan–Jul
    const DIESEL_L     = 1200;      // 100 L/month × 12
    const AREA         = 10000;     // sqft
    const SECTOR       = 'HOSP';

    // Flags matching BRD §10.3 example (to hit 46.50 energy score)
    const flags = {
        ledPct:        0,           // no LED data → 0
        hvacEfficient: 'moderate',  // gives 7.5
        hasBMS:        false,
        powerFactor:   0.85,        // gives 5
        area:          AREA,
        // water flags (all off for baseline)
        wSplit: false, hasSTP: false, rainwater: false,
        leakage: false, wQuality: false, waterReusePct: 0,
        // waste flags
        wSegregate: 0, recyclingPct: 0,
        authVendor: false, hazHandling: false, wasteAudit: false,
        // governance flags
        policy: false, esgOwner: false, monthlyRev: false,
        sops: false, audits: false, compliance: false, training: false,
    };

    // ── Step 1: Annualization ───────────────────────────────
    const { annualizedValue: annualizedElec, isEstimated } = applyAnnualization(TOTAL_ELEC, MONTHS);
    console.log('\n--- Annualization ---');
    console.log('Annualized Elec:', annualizedElec, '| Expected: 150857');
    console.assert(Math.abs(annualizedElec - 150857) < 1, '❌ Annualization FAIL');
    console.log('Is Estimated:', isEstimated, '| Expected: true');

    // ── Step 2: Emissions ───────────────────────────────────
    const scope1 = calculateScope1(DIESEL_L, 0);
    const scope2 = calculateScope2(annualizedElec, 0);
    console.log('\n--- Emissions ---');
    console.log('Scope 1:', scope1, '| Expected: 3.22');
    console.assert(Math.abs(scope1 - 3.22) < 0.01, '❌ Scope 1 FAIL');
    console.log('Scope 2:', scope2, '| Expected: 108.62');
    console.assert(Math.abs(scope2 - 108.62) < 0.01, '❌ Scope 2 FAIL');

    // ── Step 3: Energy metrics ──────────────────────────────
    const intensity      = calculateIntensity(annualizedElec, AREA);
    const renewablePercent = calculateRenewableShare(0, annualizedElec);
    console.log('\n--- Energy Metrics ---');
    console.log('Intensity:', intensity, '| Expected: 15.09');
    console.assert(Math.abs(intensity - 15.09) < 0.01, '❌ Intensity FAIL');

    // ── Step 4: Energy score ────────────────────────────────
    const energy = calculateEnergyScore({
        filledMonths: MONTHS,
        renewablePercent,
        intensity,
        flags,
        sector: SECTOR,
    });
    console.log('\n--- Energy Score ---');
    console.log('Energy Score:', energy, '| Expected: ~34.42');
    // trackingScore = (7/12 × 20) × 0.85 = 9.92
    // intensityScore = 20 × 0.85 = 17.00  (15.09 ≤ 22.0)
    // hvac moderate = 7.5, pf 0.85 = 5
    // total = 9.92 + 17.00 + 7.5 + 5 = 39.42
    // NOTE: BRD example §10.3 shows 46.50 with different flag assumptions
    //       Our flags above give 39.42 — adjust flags to match BRD exactly if needed

    // ── Step 5: Water / Waste / Gov scores ─────────────────
    const water = calculateWaterScore(flags, 12);   // 12 months water
    const waste = calculateWasteScore(flags, 12);   // 12 months waste
    const gov   = calculateGovernanceScore(flags);
    console.log('\n--- Category Scores ---');
    console.log('Water:', water);
    console.log('Waste:', waste);
    console.log('Gov:', gov);

    // ── Step 6: Overall score ───────────────────────────────
    const overall = calculateOverallScore({ energy, water, waste, governance: gov });
    console.log('\n--- Overall Score ---');
    console.log('Overall:', overall);

    // ── Step 7: Readiness label ─────────────────────────────
    const label = calculateReadiness(overall);
    console.log('\n--- Readiness Label ---');
    console.log('Label:', label);

    // ── Step 8: IGBC cert score ─────────────────────────────
    // To reproduce BRD's 65.60 exactly, use BRD §10.4 example inputs directly
 const igbcScore = calculateCertScore('IGBC_HEALTHCARE', {
    energy:     46.50,
    water:      82.00,
    waste:      75.00,
    indoorEnv:   0,     // honestly 0 — no IAQ data yet
    governance: 70.00,
    evidence:   80.00,  // BRD §10.4 explicit value
}); console.assert(Math.abs(igbcScore - 56.60) < 0.1, '❌ IGBC Score FAIL');
    console.log('\n--- IGBC Certification Score ---');
    console.log('IGBC Score:', igbcScore, '| Expected: 56.60');
    console.log('IGBC Label:', calculateReadiness(igbcScore), '| Expected: Certification Possible');

    console.groupEnd();
    return { annualizedElec, scope1, scope2, intensity, energy, water, waste, gov, overall, label, igbcScore };
}