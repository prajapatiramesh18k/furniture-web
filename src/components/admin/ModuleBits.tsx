'use client';

import { useEffect, useRef, useState } from 'react';

export function ModuleShell({ title, sub, children, action }: { title: string; sub: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="ahf-pagehead">
        <div>
          <p>{sub}</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j}><div className="ahf-skel" style={{ height: 18, borderRadius: 4 }} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function useAdminFetch<T>(url: string): { data: T | null; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const hasData = useRef(false);
  useEffect(() => {
    let alive = true;
    if (!hasData.current) setLoading(true);
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) { setData(d); hasData.current = true; } })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [url, tick]);
  return { data, loading, refresh: () => setTick((t) => t + 1) };
}

export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ahf-skel" style={{ height: 56 }} />
      ))}
    </div>
  );
}
