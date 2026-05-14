import { useEffect, useCallback, useRef, useState } from 'react';
import { assessmentApi } from '@/services/api/assessment.api';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import useAuthStore from '@/store/auth.store';
import { DEFAULT_SECTOR } from '@/constants/sectors';


export function useAssessmentPersistence() {
  const assessmentIdRef = useRef(null);
  const saveTimerRef    = useRef(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const { flags, sector, hydrateFromApi, setAssessmentId } = useAssessmentStore();
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
        setAssessmentId(a._id);
      } catch (e) {
        if (!cancelled) console.log('No saved assessment:', e.message);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [token, hydrateFromApi, setAssessmentId]);

  // ── Auto-save with 2s debounce (governance ONLY) ──────────────
  const save = useCallback(async () => {
    if (!token) return;
    const payload = { flags, sector: sector || DEFAULT_SECTOR };
    try {
      if (assessmentIdRef.current) {
        await assessmentApi.update(assessmentIdRef.current, payload);
      } else {
        const res = await assessmentApi.create(payload);
        const id = res.data?.assessment?._id;
        assessmentIdRef.current = id;
        if (id) setAssessmentId(id);
      }
    } catch (e) {
      console.error('Governance save failed:', e.message);
    }
  }, [flags, sector, token, setAssessmentId]);

  useEffect(() => {
    if (!token) return;
    const hasFlags = Object.keys(flags).length > 0;
    if (!hasFlags) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [save, token, flags, sector]);

  return { assessmentId: assessmentIdRef.current, isHydrating };
}

export default useAssessmentPersistence;