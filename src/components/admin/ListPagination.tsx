'use client';

import { useEffect, useMemo, useState, useRef, useCallback, memo } from 'react';

/** Client-side pagination state — resets to page 1 when deps change. Optimized to avoid duplicate renders. */
export function usePagination<T>(rows: T[], pageSize = 10, resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1);
  const prevDepsRef = useRef<string | null>(null);
  // resetDeps is a fresh array literal on every render — stringify directly instead of
  // memoizing on its identity (which would recompute every render anyway).
  const depsKey = JSON.stringify(resetDeps);

  // Reset to first page only when deps actually change — prevents duplicate request / extra render
  useEffect(() => {
    if (prevDepsRef.current === null) {
      prevDepsRef.current = depsKey;
      return;
    }
    if (prevDepsRef.current !== depsKey) {
      prevDepsRef.current = depsKey;
      setPage((p) => (p === 1 ? p : 1));
    }
  }, [depsKey]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(rows.length / pageSize)), [rows.length, pageSize]);
  const safePage = Math.min(page, totalPages);

  // Clamp page if rows shrink (e.g., after delete) without extra effect cycle
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paged = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );

  const setPageStable = useCallback((p: number | ((prev: number) => number)) => {
    setPage(p);
  }, []);

  return { page: safePage, totalPages, paged, setPage: setPageStable, pageSize };
}

/** Shared pagination footer — same design on every list page. Memoized to reduce re-renders. */
export const ListPagination = memo(function ListPagination({
  page,
  totalPages,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const handlePrev = useCallback(() => {
    onPage(Math.max(1, page - 1));
  }, [onPage, page]);

  const handleNext = useCallback(() => {
    onPage(Math.min(totalPages, page + 1));
  }, [onPage, totalPages]);

  if (total === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderTop: '1px solid #f0e7d4', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12.5, color: '#8a7a66' }}>
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="ahf-btn ahf-btn-ghost ahf-btn-sm"
          disabled={page <= 1}
          onClick={handlePrev}
          style={page <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6e4c22' }}>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="ahf-btn ahf-btn-ghost ahf-btn-sm"
          disabled={page >= totalPages}
          onClick={handleNext}
          style={page >= totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
});
