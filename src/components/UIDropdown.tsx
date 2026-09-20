'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export type UIDropdownOption = { value: string; label: string };

const toOptions = (options: (string | UIDropdownOption)[]): UIDropdownOption[] =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/**
 * Shared dropdown for the whole application (admin, staff, customer, public).
 *
 * Native <select>/<option> popups are OS-rendered — the blue selected/hover
 * highlight cannot be styled reliably. This custom dropdown renders its own
 * menu using the global beige/cream theme (gradient = selected, cream =
 * hover/keyboard focus), so no browser blue can ever appear.
 */
export default function UIDropdown({
  value,
  options,
  onChange,
  label,
  placeholder = '— Select —',
  disabled = false,
  className = '',
  style,
  small = false,
  variant = 'default',
  menuMaxHeight = 240,
  onFocus,
  onBlur,
}: {
  value: string;
  options: (string | UIDropdownOption)[];
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  small?: boolean;
  /** 'cpf' renders the button like a public-site floating-label input. Menu stays gradient. */
  variant?: 'default' | 'cpf';
  menuMaxHeight?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const items = toOptions(options);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = items.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  const close = () => {
    setOpen(false);
    setPos(null);
  };

  const openMenu = () => {
    if (disabled) return;
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const up = below < 260 && r.top > below;
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 180) - 8)),
      width: Math.max(r.width, 180),
      top: up ? Math.max(8, r.top - menuMaxHeight - 12) : r.bottom + 6,
      up,
    });
    setHighlight(Math.max(0, items.findIndex((o) => o.value === value)));
    setOpen(true);
    onFocus?.();
  };

  const pick = (v: string) => {
    onChange(v);
    close();
    onBlur?.();
    btnRef.current?.focus();
  };

  // Outside click / scroll / resize / Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };
    const onScroll = (e: Event) => {
      // Scrolling inside the menu list itself must not close it.
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        onBlur?.();
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

  const onBtnKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) {
        setHighlight((h) => Math.min(items.length - 1, h + 1));
      } else {
        openMenu();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) setHighlight((h) => Math.max(0, h - 1));
      else openMenu();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(items.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter' && highlight >= 0 && items[highlight] !== undefined) {
      e.preventDefault();
      pick(items[highlight].value);
    }
  };

  return (
    <div className={`qm-dd ${className}`} ref={rootRef} style={style}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        className={`qm-dd-btn${open ? ' is-open' : ''}${!selected ? ' is-empty' : ''}${variant === 'cpf' ? ' uidd-cpf' : ''}`}
        style={small ? { minHeight: 32, fontSize: 12, padding: '4px 10px', borderRadius: 6 } : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? (close(), onBlur?.()) : openMenu())}
        onKeyDown={onBtnKey}
        onFocus={() => onFocus?.()}
        onBlur={() => {
          // Delay so a pick (which refocuses the button) doesn't flash blur.
          setTimeout(() => {
            if (!open) onBlur?.();
          }, 0);
        }}
      >
        <span className="qm-dd-value">{display}</span>
        <i className={`fas fa-chevron-down qm-dd-chev${open ? ' is-open' : ''}`}></i>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className="qm-dd-menu"
            role="listbox"
            id={listId}
            aria-label={label}
            onKeyDown={onListKey}
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              right: 'auto',
              zIndex: 9999,
            }}
          >
            <div className="qm-dd-list" style={{ maxHeight: menuMaxHeight }}>
              {items.length === 0 && <div className="qm-dd-empty">No options</div>}
              {items.map((o) => {
                const isSel = o.value === value;
                const isHi = items.indexOf(o) === highlight;
                return (
                  <button
                    key={`${o.value}-${o.label}`}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    className={`qm-dd-item${isSel ? ' is-selected' : ''}${isHi ? ' is-highlight' : ''}`}
                    onMouseEnter={() => setHighlight(items.indexOf(o))}
                    onClick={() => pick(o.value)}
                  >
                    <span className="qm-dd-check">{isSel && <i className="fas fa-check"></i>}</span>
                    <span className="qm-dd-text">{o.label || placeholder}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
