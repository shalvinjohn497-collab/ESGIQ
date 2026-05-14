import { useState, useCallback } from 'react';
import { assessmentApi } from '@/services/api/assessment.api';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || 'demo-token';
    }
  } catch {}
  return 'demo-token';
}

/**
 * Hook to generate and download a PDF report for the current assessment.
 * Returns { downloadPdf, isGenerating }.
 */
export function useDownloadPdf({ onSuccess, onError } = {}) {
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (!assessmentId || isGenerating) return;

    setIsGenerating(true);
    try {
      // Step 1: Tell the backend to generate the PDF
      const { data } = await assessmentApi.generatePdf(assessmentId);
      const downloadUrl = data.downloadUrl;

      // Step 2: Trigger browser download via a hidden fetch + blob
      const token = getToken();
      const res = await fetch(`${API_BASE}${downloadUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || 'ESG_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      onSuccess?.();
    } catch (err) {
      console.error('[useDownloadPdf] Error:', err);
      onError?.(err);
    } finally {
      setIsGenerating(false);
    }
  }, [assessmentId, isGenerating, onSuccess, onError]);

  return { downloadPdf, isGenerating };
}

export default useDownloadPdf;
