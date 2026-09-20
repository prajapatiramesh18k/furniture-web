'use client';

import type { CSSProperties, ReactNode } from 'react';

/**
 * Shared admin UI primitives extracted from Admin → Leads
 * (src/app/admin/leads/page.tsx — the visual source of truth).
 *
 * Pages should reuse these instead of re-implementing their own
 * modal / toast / form-grid markup so every screen shares the same
 * spacing, radius, shadows, gradients and interaction patterns.
 * Business logic, API calls and payloads stay on each page.
 */

/** Leads-style toast: fixed, check-circle icon. Caller controls visibility.
 *  Optional error tone keeps the same position/animation in brand red. */
export function AdminToast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  if (!message) return null;
  const error = tone === 'error';
  return (
    <div
      className="admin-toast"
      style={error ? { position: 'fixed', background: '#b3273a' } : { position: 'fixed' }}
    >
      <i className={error ? 'fas fa-circle-exclamation' : 'fas fa-check-circle'}></i> {message}
    </div>
  );
}

/** Leads-style modal shell: overlay + white card + gradient header. */
export function AdminModal({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  width = 720,
  busy = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  busy?: boolean;
}) {
  return (
    <div
      onClick={() => !busy && onClose()}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="ahf-modal-noscroll"
        style={{
          background: '#fff',
          borderRadius: 16,
          width: `min(${width}px, 100%)`,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)',
            color: '#fff',
            padding: '18px 22px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{eyebrow}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, opacity: 0.9 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

/** Leads-style responsive form grid: auto-fit minmax(180px, 1fr), gap 10. */
export function AdminFormGrid({
  children,
  min = 180,
  style,
}: {
  children: ReactNode;
  min?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 10,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Leads-style labelled field wrapper (flex column, gap 4, 12.5px label). */
export function AdminField({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 12.5,
        ...style,
      }}
    >
      {label}
      {children}
    </label>
  );
}

/** Leads-style modal footer: right-aligned ghost/primary actions. Wraps so
 *  narrow screens never get a horizontal scrollbar. */
export function AdminModalFooter({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{children}</div>
  );
}

/** Leads-style filter bar row inside .ahf-panel-body. */
export function AdminFilterRow({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {children}
      {action && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{action}</span>}
    </div>
  );
}
