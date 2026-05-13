import { useEffect, useCallback, useRef } from 'react';
import { assessmentApi } from '@/services/api/assessment.api';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import useAuthStore from '@/store/auth.store';

export function useAssessmentPersistence() {
  const assessmentIdRef = useRef(null);
  const saveTimerRef    = useRef(null);

  const {
    rows, waterRows, fuelRows, wasteRows, flags, uploadStatus,
    setRows, setWaterRows, setFuelRows, setWasteRows, setFlags,
  } = useAssessmentStore();

  const token = useAuthStore((s) => s.token);

  // ── Load latest on mount ──────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await assessmentApi.latest();
        if (cancelled) return;

        const a = res.data?.assessment;
        if (!a) return;

        assessmentIdRef.current = a._id;
        if (a.rows?.length)                          setRows(a.rows);
        if (a.waterRows?.length)                     setWaterRows(a.waterRows);
        if (a.fuelRows?.length)                      setFuelRows(a.fuelRows);
        if (a.wasteRows?.length)                     setWasteRows(a.wasteRows);
        if (a.flags && Object.keys(a.flags).length)  setFlags(a.flags);
      } catch (e) {
        if (!cancelled) console.log('No saved assessment:', e.message);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [token]);

  // ── Auto-save with 2s debounce ────────────────────────────────
  const save = useCallback(async () => {
    if (!token) return;
    const payload = { rows, waterRows, fuelRows, wasteRows, flags, uploadStatus };
    try {
      if (assessmentIdRef.current) {
        await assessmentApi.update(assessmentIdRef.current, payload);
      } else {
        const res = await assessmentApi.create(payload);
        assessmentIdRef.current = res.data?.assessment?._id;
      }
    } catch (e) {
      console.error('Save failed:', e.message);
    }
  }, [rows, waterRows, fuelRows, wasteRows, flags, uploadStatus, token]);

  useEffect(() => {
    if (!token) return;
    const hasData = rows.length || waterRows.length || fuelRows.length || wasteRows.length;
    if (!hasData) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [save, token, rows, waterRows, fuelRows, wasteRows]);

  return { assessmentId: assessmentIdRef.current };
}

export default useAssessmentPersistence;