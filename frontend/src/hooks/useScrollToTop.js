import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const el = document.getElementById('main-scroll');
    if (el) {
      el.scrollTop = 0;
    }
  }, [pathname]);
}