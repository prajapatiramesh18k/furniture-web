'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseKey = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmtShort = (s: string) => {
  const d = parseKey(s);
  if (!d) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const fmtFull = (s: string) => {
  const d = parseKey(s);
  if (!d) return '';
  return `${d.getDate()} ${d.toLocaleDateString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
};

/**
 * Shared date-range picker — custom cream/gradient calendar popup.
 * Native date inputs and date libraries render OS/blue highlights that
 * can't be themed, so this draws its own month grid instead.
 */
export default function DateRangePicker({
  fromDate,
  toDate,
  onChange,
  label = 'Date range',
}: {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => {
    const base = parseKey(fromDate) || parseKey(toDate) || today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [hover, setHover] = useState<string>('');
  const [panel, setPanel] = useState<'days' | 'months' | 'years'>('days');
  const [yearPage, setYearPage] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setPos(null);
    setHover('');
  };

  const openMenu = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(r.width, 300);
    setPos({
      left: Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)),
      width: w,
      top: window.innerHeight - r.bottom < 340 ? Math.max(8, r.top - 348) : r.bottom + 6,
    });
    const base = parseKey(fromDate) || parseKey(toDate) || new Date();
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setPanel('days');
    setYearPage(0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };
    const onScroll = (e: Event) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        btnRef.current?.focus();
      }
    };
    const onResize = () => close();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const pick = (key: string) => {
    if (!fromDate || (fromDate && toDate)) {
      // Start a new range.
      onChange(key, '');
    } else if (key < fromDate) {
      onChange(key, fromDate);
      close();
    } else {
      onChange(fromDate, key);
      close();
    }
  };

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startDay = first.getDay();
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const list: (string | null)[] = [];
    for (let i = 0; i < startDay; i++) list.push(null);
    for (let d = 1; d <= days; d++) {
      list.push(toKey(new Date(view.y, view.m, d)));
    }
    return list;
  }, [view]);

  const inPreview = (key: string) => {
    if (fromDate && !toDate && hover && hover !== fromDate) {
      const a = fromDate < hover ? fromDate : hover;
      const b = fromDate < hover ? hover : fromDate;
      return key > a && key < b;
    }
    if (fromDate && toDate) return key > fromDate && key < toDate;
    return false;
  };

  const isEnd = (key: string) => key === fromDate || (toDate !== '' && key === toDate);

  const title = new Date(view.y, view.m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const btnLabel = !fromDate && !toDate ? 'Date Range' : !toDate ? `From ${fmtFull(fromDate)}` : `${fmtFull(fromDate)} – ${fmtFull(toDate)}`;

  const shift = (dir: number) => {
    const d = new Date(view.y, view.m + dir, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        aria-label={label}
        aria-expanded={open}
        title={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: (fromDate || toDate) ? '1.5px solid #a27341' : '1px solid #e2d5bd',
          background: (fromDate || toDate) ? '#faf3e3' : '#fff',
          color: (fromDate || toDate) ? '#6e4c22' : '#6b5d4f',
          padding: '8px 14px',
          borderRadius: 999,
          cursor: 'pointer',
          fontWeight: (fromDate || toDate) ? 700 : 500,
          fontSize: 13,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{btnLabel}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={label}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              background: '#fffdf8',
              border: '1.5px solid #e5d9c6',
              borderRadius: 14,
              boxShadow: '0 14px 36px rgba(62,42,18,.22)',
              zIndex: 9999,
              padding: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => (panel === 'days' ? shift(-1) : panel === 'months' ? setView((v) => ({ ...v, y: v.y - 1 })) : setYearPage((p) => p - 1))}
                aria-label="Previous"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a27341', fontSize: 14, padding: 4 }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                onClick={() => setPanel((p) => (p === 'days' ? 'months' : p === 'months' ? 'years' : 'days'))}
                title="Pick month & year"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13.5, color: '#3a2d20', fontWeight: 800 }}
              >
                {panel === 'days' ? title : panel === 'months' ? view.y : `${view.y + yearPage * 12 - 6} – ${view.y + yearPage * 12 + 5}`}
              </button>
              <button
                type="button"
                onClick={() => (panel === 'days' ? shift(1) : panel === 'months' ? setView((v) => ({ ...v, y: v.y + 1 })) : setYearPage((p) => p + 1))}
                aria-label="Next"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a27341', fontSize: 14, padding: 4 }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            {panel === 'days' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#a08e7a', padding: '4px 0' }}>
                      {d}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                  {cells.map((key, i) =>
                    key === null ? (
                      <span key={`e-${i}`} />
                    ) : (
                      <button
                        key={key}
                        type="button"
                        onClick={() => pick(key)}
                        onMouseEnter={() => setHover(key)}
                        aria-label={key}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '7px 0',
                          fontSize: 12.5,
                          borderRadius: 8,
                          fontWeight: isEnd(key) ? 800 : 500,
                          background: isEnd(key)
                            ? 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)'
                            : inPreview(key)
                              ? '#f7ecd4'
                              : 'transparent',
                          color: isEnd(key) ? '#fff' : '#3a2d20',
                        }}
                      >
                        {Number(key.slice(8, 10))}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
            {panel === 'months' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {Array.from({ length: 12 }, (_, m) => {
                  const label = new Date(view.y, m, 1).toLocaleDateString('en-IN', { month: 'short' });
                  const active = m === view.m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setView((v) => ({ ...v, m }));
                        setPanel('days');
                      }}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '9px 0',
                        fontSize: 12.5,
                        borderRadius: 8,
                        fontWeight: active ? 800 : 500,
                        background: active ? 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)' : '#faf3e3',
                        color: active ? '#fff' : '#3a2d20',
                      }}
                    >
                      {label} {view.y}
                    </button>
                  );
                })}
              </div>
            )}
            {panel === 'years' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const y = view.y + yearPage * 12 - 6 + i;
                  const active = y === view.y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setView((v) => ({ ...v, y }));
                        setYearPage(0);
                        setPanel('months');
                      }}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '9px 0',
                        fontSize: 12.5,
                        borderRadius: 8,
                        fontWeight: active ? 800 : 500,
                        background: active ? 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)' : '#faf3e3',
                        color: active ? '#fff' : '#3a2d20',
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 12, color: '#8a7a66' }}>
                {!fromDate ? 'Pick a start date' : !toDate ? 'Pick an end date' : `${fmtFull(fromDate)} – ${fmtFull(toDate)}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange('', '');
                  close();
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a27341', fontSize: 12.5, fontWeight: 700 }}
              >
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
