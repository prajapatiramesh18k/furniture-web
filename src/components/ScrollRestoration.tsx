'use client';
import { useEffect } from 'react';

const SCROLL_KEY = 'ananya-scroll-pos';
const PENDING_KEY = 'ananya-scroll-pending';

function tryRestore(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return false;
    const y = parseInt(raw, 10);
    if (!Number.isFinite(y) || y < 0) {
      sessionStorage.removeItem(SCROLL_KEY);
      return false;
    }
    window.scrollTo(0, y);
    sessionStorage.removeItem(SCROLL_KEY);
    return true;
  } catch {
    return false;
  }
}

function markPending() {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw) sessionStorage.setItem(PENDING_KEY, raw);
  } catch {}
}

function restoreIfPending(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return false;
    const y = parseInt(raw, 10);
    if (Number.isFinite(y) && y >= 0) {
      window.scrollTo(0, y);
    }
    sessionStorage.removeItem(PENDING_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    return true;
  } catch {
    return false;
  }
}

export default function ScrollRestoration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    restoreIfPending();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => restoreIfPending());
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPopState = () => {
      markPending();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => restoreIfPending());
      });
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        markPending();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => restoreIfPending());
        });
      }
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return;

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      } catch {}
    };

    const onPageHide = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      } catch {}
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('click', onClick, true);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  return null;
}
