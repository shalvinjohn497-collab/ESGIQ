import { useEffect, useCallback, useRef, useState } from 'react';
import { assessmentApi } from '@/services/api/assessment.api';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import useAuthStore from '@/store/auth.store';

export function useAssessmentPersistence() {
  const assessmentIdRef = useRef(null);
  const saveTimerRef    = useRef(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const { flags, hydrateFromApi } = useAssessmentStore();
  const token = useAuthStore((s) => s.token);

  // ── Load latest on mount ──────────────────────────────────────
  useEffect(() => {
    if (!token) {
        setIsHydrating(false);
        return;
    }

    let cancelled = false;

    async function load() {
      try {
        setIsHydrating(true);
        const res = await assessmentApi.latest();
        if (cancelled) return;

        const a = res.data?.assessment;
        if (!a) {
            setIsHydrating(false);
            return;
        }

        assessmentIdRef.current = a._id;
        hydrateFromApi(a);
      } catch (e) {
        if (!cancelled) console.log('No saved assessment:', e.message);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [token, hydrateFromApi]);

  // ── Auto-save with 2s debounce (governance ONLY) ──────────────
  const save = useCallback(async () => {
    if (!token) return;
    const payload = { flags };
    try {
      if (assessmentIdRef.current) {
        await assessmentApi.saveGovernance(assessmentIdRef.current, payload);
      } else {
        const res = await assessmentApi.create(payload);
        assessmentIdRef.current = res.data?.assessment?._id;
      }
    } catch (e) {
      console.error('Governance save failed:', e.message);
    }
  }, [flags, token]);

  useEffect(() => {
    if (!token) return;
    const hasFlags = Object.keys(flags).length > 0;
    if (!hasFlags) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [save, token, flags]);

  return { assessmentId: assessmentIdRef.current, isHydrating };
}

export default useAssessmentPersistence;