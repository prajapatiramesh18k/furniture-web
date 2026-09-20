'use client';

import { useEffect, useMemo, useState } from 'react';

/** Client-side pagination state — resets to page 1 when deps change. */
export function usePagination<T>(rows: T[], pageSize = 10, resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1);
  // Reset to first page whenever filters change.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );
  return { page: safePage, totalPages, paged, setPage, pageSize };
}

/** Shared pagination footer — same design on every list page. */
export function ListPagination({
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
  if (total === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderTop: '1px solid #f0e7d4', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12.5, color: '#8a7a66' }}>
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="ahf-btn ahf-btn-ghost ahf-btn-sm"
          disabled={page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
          style={page <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6e4c22' }}>
          Page {page} of {totalPages}
        </span>
        <button
          className="ahf-btn ahf-btn-ghost ahf-btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          style={page >= totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
