'use client';

import { useEffect, useState } from 'react';

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

export function useAdminFetch<T>(url: string): { data: T | null; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) setData(d); })
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
