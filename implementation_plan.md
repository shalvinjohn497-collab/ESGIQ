# SAM Assessment — Phase 0: Foundation Stabilization Plan

## Background

Full codebase analyzed. The application is a functioning React + Vite SPA with a real calculation engine, Zustand state, and a polished UI. The stabilization goal is to:
1. Replace conditional-render routing with `react-router-dom`
2. Create all BRD-mandated constants files
3. Create `useAssessmentResults.js` as the single source of truth for all derived state
4. Fix the BRD emission-factor discrepancy
5. Eliminate all inline/JSX calculations that violate architecture rules

No UI redesign. No new features. No formula invention.

---

## User Review Required

> [!CAUTION]
> **BRD Emission Factor Discrepancy — Action Required**
>
> `calculateScope2.js` currently uses a hardcoded factor of **0.82 kgCO2e/kWh**.
> The BRD mandates **0.72 kgCO2e/kWh** for Grid Electricity India.
>
> This will change every computed Scope 2 value, total emissions, and any downstream
> score that depends on emission intensity. It affects the dashboard and wizard results.
>
> **Decision needed:** Confirm 0.72 is the authoritative BRD value and approve the correction.
> We will move it to `emissionFactors.js` and reference it — the formula itself is unchanged.

> [!IMPORTANT]
> **Annualization currently violates architecture rules (calculation inside JSX)**
>
> `SummaryStep.jsx` line 22 computes `annElec` inline inside the component:
> ```js
> const annElec = scores.filled < 12 && scores.filled > 0
>   ? Math.round(scores.totalElec / scores.filled * 12) : scores.totalElec;
> ```
> This moves to `applyAnnualization.js` pure function, then exposed via `useAssessmentResults.js`.
> The BRD rule (`annualized = total / months * 12`, only if `months >= 3`) will be enforced.
>
> **Confirm: if filled months < 3, the assessment is INVALID and the UI should block Step 3.**

> [!IMPORTANT]
> **Confidence Modifiers — not applied anywhere in the current codebase**
>
> BRD mandates: 12m → 1.00 | 9–11m → 0.95 | 6–8m → 0.85 | 3–5m → 0.70 | <3m → invalid
>
> `useAssessmentResults.js` will apply these to sub-scores before computing overall.
> This will lower displayed scores when the data period is less than 12 months.
> **Confirm this is expected behavior for the hackathon demo and judge validation.**

> [!WARNING]
> **Dashboard `envScore` uses a non-BRD formula**
>
> `DashboardPage.jsx` line 26:
> ```js
> const envScore = Math.round((scores.energy * 0.45 + scores.water * 0.30 + scores.waste * 0.25));
> ```
> Weights `0.45 / 0.30 / 0.25` do not match `SCORING_WEIGHTS` (Energy: 0.35, Water: 0.25, Waste: 0.20).
> Will be replaced with a BRD-compliant `envScore` computed inside `useAssessmentResults.js`.

---

## Open Questions

> [!IMPORTANT]
> **Q1 — `/register` route:** BRD target routes include `/register`. LoginPage currently
> shows a toggle between Sign In and Register with no functional difference.
> Should `/register` be a separate page, or keep the toggle on `/login`?

> [!IMPORTANT]
> **Q2 — `/assessment` redirect:** BRD includes both `/assessment` and sub-routes
> `/assessment/upload`, `/assessment/summary`, `/assessment/results`.
> Should `/assessment` redirect to `/assessment/upload`, or is a redirect sufficient?

> [!IMPORTANT]
> **Q3 — Sectors and confidence modifiers driving UI now?** We create all mandated constants
> files regardless. Confirm whether `sectors.js` should drive any existing UI element in Phase 0,
> or if it is foundation-only for backend integration.

---

## Current State — Confirmed by Direct Code Reading

### What Is Actually Working Today
| Item | Status |
|---|---|
| `assessment.store.js` | ✅ SSOT — DataUploadStep reads/writes directly from store |
| `useAssessmentScoring.js` | ✅ Correctly memoized, all scoring orchestrated here |
| `generateResultsInsights.js` | ✅ Pure functions, deterministic, no hardcoding |
| `constants/certifications.js` | ✅ Unified single source — no page-level duplication |
| `constants/scoring.js` | ✅ Weights correctly used by `calculateOverallScore` |
| Zustand `ui.store.js` `nav` | ❌ Dead weight — AppShell has its own `useState('dashboard')` |
| `auth.store.js` | ❌ Completely unused — AppShell uses `useState('login')` for screen |
| React Router | ❌ Installed, never used |
| `emissionFactors.js` | ❌ Does not exist — factors hardcoded in calc files |
| `scoringWeights.js` | ❌ Does not exist per BRD filename spec |
| `confidenceModifiers.js` | ❌ Does not exist |
| `sectors.js` | ❌ Does not exist |
| `useAssessmentResults.js` | ❌ Does not exist |
| Annualization | ❌ Partial — inline in SummaryStep JSX, not a pure function |
| Confidence modifiers | ❌ Not applied anywhere |
| `score.utils.js` | ⚠ Duplicates `determineCertificationLevel.js` — dead overlap |

---

## Proposed Changes

### Part 1 — BRD Constants System (zero regression risk, do first)

---

#### [NEW] `src/constants/emissionFactors.js`

Single source for all GHG emission factors per BRD:

```js
export const EMISSION_FACTORS = {
  GRID_ELECTRICITY_INDIA: 0.72,  // kgCO2e/kWh
  DIESEL:                 2.68,  // kgCO2e/litre
  PNG_CNG:                2.04,  // kgCO2e/kg
  R22_REFRIGERANT:        1810,  // kgCO2e/kg
  R410A_REFRIGERANT:      2088,  // kgCO2e/kg
  WASTE_TO_LANDFILL:      0.46,  // kgCO2e/kg
};
```

---

#### [NEW] `src/constants/scoringWeights.js`

BRD-mandated filename. Re-exports from `scoring.js` to avoid duplication:

```js
// Re-export from scoring.js — single source, BRD-compliant filename
export { SCORING_WEIGHTS } from '@/constants/scoring';
```

---

#### [NEW] `src/constants/confidenceModifiers.js`

```js
export const CONFIDENCE_MODIFIER_MAP = {
  12: 1.00, 11: 0.95, 10: 0.95, 9: 0.95,
  8: 0.85,  7: 0.85,  6: 0.85,
  5: 0.70,  4: 0.70,  3: 0.70,
};
export const MIN_VALID_MONTHS = 3;

export function getConfidenceModifier(months) {
  if (months >= 12) return 1.00;
  if (months >= 9)  return 0.95;
  if (months >= 6)  return 0.85;
  if (months >= 3)  return 0.70;
  return null; // invalid — < 3 months
}
```

---

#### [NEW] `src/constants/sectors.js`

```js
export const SECTOR_CODES = {
  HOSP: 'Healthcare',  BLDG: 'Commercial Building', MFGR: 'Manufacturing',
  TEXT: 'Textiles',    ELEC: 'Electronics',          FOOD: 'Food & Beverage',
  LOGI: 'Logistics',   EDUC: 'Education',             NGO:  'NGO/Non-profit',
  GEN:  'General',
};
export const DEFAULT_SECTOR = 'HOSP';
```

---

#### [MODIFY] `src/constants/routes.js`

Expand with all BRD-mandated sub-routes:

```js
export const ROUTES = {
  HOME:               '/',
  LOGIN:              '/login',
  REGISTER:           '/register',
  DASHBOARD:          '/dashboard',
  ASSESSMENT:         '/assessment',
  ASSESSMENT_UPLOAD:  '/assessment/upload',
  ASSESSMENT_SUMMARY: '/assessment/summary',
  ASSESSMENT_RESULTS: '/assessment/results',
  CERTIFICATIONS:     '/certifications',
  REPORTS:            '/reports',
  SETTINGS:           '/settings',
};
```

---

### Part 2 — Calculation Engine Fixes (low regression risk)

---

#### [MODIFY] `src/calculations/emissions/calculateScope2.js`

Externalize hardcoded `0.82` → `EMISSION_FACTORS.GRID_ELECTRICITY_INDIA` (0.72):

```js
import { EMISSION_FACTORS } from '@/constants/emissionFactors';
export function calculateScope2(totalElectricity) {
  return +(totalElectricity * EMISSION_FACTORS.GRID_ELECTRICITY_INDIA / 1000).toFixed(2);
}
```

Formula is unchanged. Only the constant moves to the canonical source.

---

#### [MODIFY] `src/calculations/emissions/calculateScope1.js`

Externalize hardcoded `2.68` → `EMISSION_FACTORS.DIESEL`:

```js
import { EMISSION_FACTORS } from '@/constants/emissionFactors';
export function calculateScope1(totalDiesel) {
  return +(totalDiesel * EMISSION_FACTORS.DIESEL / 1000).toFixed(2);
}
```

---

#### [NEW] `src/calculations/scoring/applyAnnualization.js`

Pure function — BRD annualization rule encapsulated here, nowhere else:

```js
/**
 * BRD Rule: annualized = total / months * 12
 * Only valid if months >= 3. Returns null if invalid.
 */
export function applyAnnualization(total, months) {
  if (months < 3) return null;      // invalid per BRD
  if (months >= 12) return total;   // full year — no scaling
  return Math.round(total / months * 12);
}

export function isDataValid(months) {
  return months >= 3;
}
```

---

#### [NEW] `src/calculations/scoring/applyConfidenceModifier.js`

Pure function — applies BRD confidence modifier to a score value:

```js
import { getConfidenceModifier } from '@/constants/confidenceModifiers';

export function applyConfidenceModifier(score, months) {
  const modifier = getConfidenceModifier(months);
  if (modifier === null) return null; // invalid data
  return Math.round(score * modifier);
}
```

---

### Part 3 — `useAssessmentResults.js` (new mandatory orchestration hook)

---

#### [NEW] `src/modules/assessment/hooks/useAssessmentResults.js`

This is the **single source of truth** for all derived state consumed by the UI.

**Data flow:**
```
useAssessmentStore() [raw data]
  └── useAssessmentScoring(rows, flags) [base scores]
        └── applyAnnualization() [BRD rule]
        └── applyConfidenceModifier() [BRD rule]
        └── calculateOverallScore() [recalculated on adjusted scores]
        └── determineCertificationLevel() [level, color, ring]
        └── generateInsights() [4 dashboard insights]
        └── generateStrengths/Gaps/Roadmap() [results page content]
        └── riskLevel derivation [low/medium/high/critical]
        └── readinessLabel derivation [Advanced/Structured/Developing/Foundational]
        └── envScore [BRD-compliant weighted env sub-score]
```

**Exposed contract (superset of current `scores` shape):**

```js
return {
  // ── Raw base scores (pre-confidence) ──────────────────────
  rawEnergy, rawWater, rawWaste, rawGov, rawOverall,

  // ── Confidence-adjusted scores (what UI displays) ─────────
  energy, water, waste, gov, overall,
  confidenceModifier,
  isDataValid,       // boolean — false if filled < 3

  // ── Annualized figures ────────────────────────────────────
  annualizedElec,    // null if invalid
  annualizedDiesel,

  // ── Emissions ─────────────────────────────────────────────
  scope1, scope2, scope3, totalEm,

  // ── Energy metrics ────────────────────────────────────────
  renPct, intensity, filled,
  totalElec, totalRen, totalDiesel,

  // ── Derived display values ────────────────────────────────
  riskLevel,         // 'low' | 'medium' | 'high' | 'critical'
  readinessLabel,    // 'Advanced' | 'Structured' | 'Developing' | 'Foundational'
  envScore,          // BRD-compliant (energy*0.35 + water*0.25 + waste*0.20) / 0.80

  // ── Certification ─────────────────────────────────────────
  lv, lvC, ringC,    // level, color, ring color

  // ── Generated intelligence ────────────────────────────────
  insights,          // from generateInsights(scores)
  strengths,         // from generateStrengths(scores, flags)
  gaps,              // from generateGaps(scores, flags)
  roadmap,           // from generateRoadmap(scores, flags)
};
```

**Architecture contract:**
- All pages/components call `useAssessmentResults()` — never `useAssessmentScoring()` directly
- `useAssessmentScoring()` becomes an internal implementation detail
- This hook contains **zero** JSX and **zero** side effects — pure useMemo derivations

---

### Part 4 — Routing Migration (medium risk, do last)

---

#### [MODIFY] `src/main.jsx`

Add `BrowserRouter` wrapper:

```jsx
import { BrowserRouter } from 'react-router-dom';
ReactDOM.createRoot(...).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

#### [NEW] `src/app/App.jsx`

Becomes the route definition root (replaces AppShell's conditional render):

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
// ... all page imports

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                     element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"          element={<DashboardPage />} />
        <Route path="assessment"         element={<Navigate to="/assessment/upload" replace />} />
        <Route path="assessment/upload"  element={<AssessmentWizardPage />} />
        <Route path="assessment/summary" element={<AssessmentWizardPage />} />
        <Route path="assessment/results" element={<AssessmentWizardPage />} />
        <Route path="certifications"     element={<CertificationsPage />} />
        <Route path="reports"            element={<ReportsPage />} />
        <Route path="settings"           element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
```

---

#### [NEW] `src/app/ProtectedRoute.jsx`

Guards all authenticated routes:

```jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
```

---

#### [MODIFY] `src/store/auth.store.js`

Activate the existing store with `isAuthenticated` flag:

```js
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  login:  () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false, user: null }),
  setUser: (user) => set({ user }),
}));
```

---

#### [MODIFY] `src/layouts/DashboardLayout/DashboardLayout.jsx`

- Remove all props (`nav`, `setNav`, `step`, `onLogout`)
- Add `<Outlet />` in place of `{children}`
- Use `useNavigate()` for logout action
- Pass `useLocation().pathname` down to `Sidebar`

---

#### [MODIFY] `src/layouts/DashboardLayout/Sidebar.jsx`

- Remove `active` / `setActive` props
- Use `useLocation()` to compute active state from pathname
- Use `useNavigate()` to navigate on click
- Map nav items to `ROUTES` constants (not string IDs)

---

#### [MODIFY] `src/layouts/DashboardLayout/Topbar.jsx`

- Remove `step` prop — read `step` from `useAssessmentStore()` directly

---

#### [MODIFY] `src/pages/dashboard/DashboardPage.jsx`

- Remove `scores` and `onStartWizard` props
- Call `useAssessmentResults()` internally
- Remove inline `riskLevel`, `envScore` calculations
- Use `useNavigate()` for "Start Assessment" CTA

---

#### [MODIFY] `src/pages/assessment/AssessmentWizardPage.jsx`

- Remove `scores` prop
- Derive active step from current URL pathname
- Each step receives results from `useAssessmentResults()` internally

---

#### [MODIFY] `src/modules/assessment/steps/SummaryStep.jsx`

- Remove `scores` prop — call `useAssessmentResults()` directly
- Remove inline `annElec` calculation — use `results.annualizedElec`

---

#### [MODIFY] `src/modules/assessment/steps/ResultsStep.jsx`

- Remove `scores` prop — call `useAssessmentResults()` directly
- Remove inline `lvLabel` calculation — use `results.readinessLabel`
- Remove inline `radarData` construction that calculates `100 - Math.round(scores.totalEm / 1.5)` — move to `useAssessmentResults`

---

#### [MODIFY] `src/pages/auth/LoginPage.jsx`

- Remove `onLogin` prop
- Call `useAuthStore().login()` + `useNavigate()(ROUTES.DASHBOARD)` on submit

---

#### [MODIFY] `src/store/ui.store.js`

- Remove `nav` state and `setNav` action (replaced by URL)
- Keep `presentationMode` and `togglePresentation` unchanged

---

#### [DELETE] `src/app/AppShell.jsx`

After all above changes are verified, this file is deleted. It will have no remaining responsibilities.

---

### Part 5 — Architecture Cleanup

#### `src/utils/score.utils.js`

Functions `getCertificationLevel`, `getReadinessLabel`, `getRingColor` duplicate `determineCertificationLevel.js`. After `useAssessmentResults.js` is created:
- Mark file with deprecation comment
- No new imports from `score.utils.js`
- Canonical source remains `determineCertificationLevel.js`

---

## Regression Risk Analysis

| Change | Risk Level | Mitigation |
|---|---|---|
| New constants files | None | Purely additive |
| `calculateScope2` factor 0.82 → 0.72 | Medium | Score values change — expected per BRD |
| `applyAnnualization` pure fn | None | New file, not yet called |
| `applyConfidenceModifier` pure fn | None | New file, not yet called |
| `useAssessmentResults.js` creation | Low | New hook, backward-compatible superset |
| Auth store activation | Low | Adds `isAuthenticated` flag |
| `BrowserRouter` in main.jsx | Low | Additive wrapper |
| `App.jsx` route definitions | Medium | Replaces AppShell — must verify all routes |
| `DashboardLayout` Outlet migration | Medium | Verify children render correctly |
| Sidebar prop removal | Medium | Verify nav highlighting with `useLocation` |
| `LoginPage` prop removal | Low | Simple swap |
| Score prop removal from pages | Low | Hook swap — same data shape |
| `ui.store nav` removal | Low | Dead code — no consumers |
| AppShell deletion | Low | Only after all above verified |

---

## Verification Plan

### After Steps 1–7 (constants + calculations)
- `npm run dev` — no build errors
- Dashboard scores display correctly (Scope 2 will be lower due to 0.72 factor)
- No visible UI change except emission values

### After Step 7 (useAssessmentResults created)
- Import and call in a test page
- Verify all keys in returned object match the contract above
- Verify confidence modifier applied: with 10 months of data, energy score should be `raw × 0.95`

### After Steps 8–18 (routing migration)
```
URL: /login          → LoginPage renders, no layout
URL: /dashboard      → Dashboard renders inside DashboardLayout
URL: /assessment/upload   → DataUploadStep renders
URL: /assessment/summary  → SummaryStep renders
URL: /assessment/results  → ResultsStep renders
URL: /certifications → CertificationsPage renders
Browser Back button  → navigates correctly
Refresh on /dashboard → stays on dashboard (not redirect to login if authenticated)
Logout button        → redirects to /login, clears auth state
```

### Calculation Correctness (Judge Validation)
| Scenario | Expected |
|---|---|
| 12 months electricity data | Confidence modifier = 1.00, no scaling |
| 10 months electricity data | Confidence modifier = 0.95 applied to all sub-scores |
| 4 months electricity data | Confidence modifier = 0.70, annualized = total/4×12 |
| 2 months electricity data | `isDataValid = false`, UI blocks Step 3 progress |
| Scope 2: 98,200 kWh total | 98,200 × 0.72 / 1000 = 70.70 tCO2e |

---

## Execution Order (19 Steps, ~3.5 Hours)

| # | Task | Risk | Est. |
|---|---|---|---|
| 1 | Create `emissionFactors.js` | None | 10m |
| 2 | Create `scoringWeights.js` | None | 5m |
| 3 | Create `confidenceModifiers.js` | None | 10m |
| 4 | Create `sectors.js` | None | 5m |
| 5 | Expand `routes.js` | None | 5m |
| 6 | Fix `calculateScope2.js` (0.72) | Low | 5m |
| 7 | Fix `calculateScope1.js` (externalize) | Low | 5m |
| 8 | Create `applyAnnualization.js` | None | 10m |
| 9 | Create `applyConfidenceModifier.js` | None | 10m |
| 10 | Create `useAssessmentResults.js` | Medium | 45m |
| 11 | Activate `auth.store.js` | Low | 10m |
| 12 | Wrap `main.jsx` with `BrowserRouter` | Low | 5m |
| 13 | Create `App.jsx` + `ProtectedRoute.jsx` | Medium | 30m |
| 14 | Refactor `DashboardLayout` → `<Outlet />` | Medium | 20m |
| 15 | Refactor `Sidebar` → `useNavigate` / `useLocation` | Medium | 15m |
| 16 | Refactor `LoginPage` — remove `onLogin` prop | Low | 10m |
| 17 | Refactor `DashboardPage` — remove props, use hook | Low | 15m |
| 18 | Refactor wizard pages + steps — remove props, use hook | Low | 20m |
| 19 | Refactor `Topbar`, remove `ui.store nav`, delete `AppShell.jsx` | Low | 10m |

> [!NOTE]
> Steps 1–10 are **zero or low regression risk** — additive files + isolated constant changes.
> Steps 11–19 are the routing migration — execute in one focused pass after Steps 1–10 are verified.
> **Never interleave constants work with routing work.**

---

## What We Are NOT Changing

- `index.css` design system — untouched
- `assessment.store.js` — already correct SSOT, no changes
- All Framer Motion animations — untouched
- All chart components — untouched
- `calculateEnergyScore.js` — formula preserved exactly per BRD
- `calculateReadiness.js` — Water/Waste/Gov formulas preserved
- `calculateOverallScore.js` — already uses `SCORING_WEIGHTS`, preserved
- `generateInsights.js` — already a pure function, untouched
- `generateResultsInsights.js` — pure functions, untouched
- `constants/certifications.js` — already unified, untouched
- Dead components (`MetricCard`, `GlassCard`, etc.) — left in place
