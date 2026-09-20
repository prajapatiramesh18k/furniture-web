'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QMSelect from './QMSelect';
import { calculateLineAmount, calculateLineDiscount, calculateLineNet, formatINR } from '@/lib/quotation/calculations';
import type { CalculationType, DepartmentConfig, QuotationItem } from '@/lib/quotation/types';

/**
 * Generic item form — renders exactly config.itemFields, so the same
 * component serves furniture, electrical, software, etc.
 * Labeled mini-grid: name (2fr) + inline numerics (1fr each) + live amount.
 */
const INLINE_KEYS = ['height', 'width', 'area', 'quantity', 'rate'];

/** Shared grid template so the page header row aligns with the form row. */
export function formGridCols(config: DepartmentConfig): string {
  const inlineCount = config.itemFields.filter((f) => INLINE_KEYS.includes(f.key) && f.key !== 'name').length;
  const hasName = config.itemFields.some((f) => f.key === 'name');
  const mid = inlineCount > 0 ? ` ${'1fr '.repeat(inlineCount).trim()}` : '';
  return `${hasName ? '2fr' : '1fr'}${mid} 0.9fr`;
}

export function formInlineFields(config: DepartmentConfig) {
  return config.itemFields.filter((f) => INLINE_KEYS.includes(f.key) && f.key !== 'name');
}

function optionsFor(config: DepartmentConfig, key: string, fieldOptions?: string[]): string[] {
  if (fieldOptions && fieldOptions.length > 0) return fieldOptions;
  if (key === 'unit') return config.units;
  if (key === 'material') return config.materials ?? [];
  return [];
}

/**
 * Preset-name field with a custom suggestion menu (brand gradient highlight).
 * Replaces the native <datalist>, whose popup is OS-rendered and always
 * shows the OS blue highlight that can't be styled.
 */
export function SuggestInput({
  value,
  suggestions,
  placeholder,
  label,
  onChange,
  onBlurField,
  inputClassName = 'qm-input',
  blurKey = 'name',
}: {
  value: string;
  suggestions: string[];
  placeholder?: string;
  label: string;
  inputClassName?: string;
  blurKey?: string;
  onChange: (v: string) => void;
  onBlurField?: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const s = value.trim().toLowerCase();
    if (!s) return suggestions;
    return suggestions.filter((o) => o.toLowerCase().includes(s));
  }, [value, suggestions]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open ]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setHighlight(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        className={inputClassName}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-label={label}
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => onBlurField?.(blurKey)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              setHighlight(filtered.length > 0 ? 0 : -1);
            } else {
              setHighlight((h) => Math.min(filtered.length - 1, h + 1));
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(-1, h - 1));
          } else if (e.key === 'Enter') {
            if (open && highlight >= 0 && filtered[highlight] !== undefined) {
              e.preventDefault();
              pick(filtered[highlight]);
            } else {
              (e.target as HTMLInputElement).blur();
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && filtered.length > 0 && (
        <div className="qm-dd-menu" role="listbox" aria-label={label}>
          <div className="qm-dd-list">
            {filtered.map((o) => {
              const selected = o === value;
              const hi = filtered.indexOf(o) === highlight;
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`qm-dd-item${selected ? ' is-selected' : ''}${hi ? ' is-highlight' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlight(filtered.indexOf(o))}
                  onClick={() => pick(o)}
                >
                  <span className="qm-dd-check">
                    {selected && <i className="fas fa-check"></i>}
                  </span>
                  <span className="qm-dd-text">{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Control({
  config,
  fieldKey,
  draft,
  onChange,
  onBlurField,
  placeholder,
}: {
  config: DepartmentConfig;
  fieldKey: string;
  draft: QuotationItem;
  onChange: (key: string, value: string | number) => void;
  onBlurField?: (key: string) => void;
  placeholder?: string;
}) {
  const f = config.itemFields.find((x) => x.key === fieldKey);
  const val = draft[fieldKey] ?? '';
  if (!f) return null;

  if (f.type === 'select') {
    return (
      <QMSelect
        label={f.label}
        value={String(val)}
        options={optionsFor(config, fieldKey, f.options)}
        onChange={(v) => onChange(fieldKey, v)}
      />
    );
  }
  if (f.type === 'number') {
    return (
      <input
        type="number"
        className="qm-input"
        min={f.min ?? 0}
        step={f.step ?? 'any'}
        value={val === 0 || val === '' ? '' : String(val)}
        placeholder={placeholder ?? f.placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value === '' ? 0 : Number(e.target.value))}
        onBlur={() => onBlurField?.(fieldKey)}
        aria-label={f.label}
      />
    );
  }
  if (fieldKey === 'quantity') {
    return (
      <input
        type="text"
        inputMode="numeric"
        className="qm-input"
        value={draft[fieldKey] === 0 ? '' : String(draft[fieldKey] ?? '')}
        placeholder={placeholder ?? f.placeholder}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          onChange(fieldKey, v === '' ? 0 : Number(v));
        }}
        onBlur={() => onBlurField?.(fieldKey)}
        aria-label={f.label}
      />
    );
  }
  return (
    <input
      type="text"
      className="qm-input"
      value={String(val)}
      placeholder={placeholder ?? f.placeholder}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      onBlur={() => onBlurField?.(fieldKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      aria-label={f.label}
    />
  );
}

export default function DynamicItemForm({
  config,
  draft,
  onChange,
  onSubmit,
  submitLabel,
  datalistOptions,
  onBlurField,
  /** Multi-trade extras: room/area + per-item discount % + tax % under the form. */
  tradeExtras = false,
  /** Override the calc rules (multi mode: active trade's department). */
  calcOverride,
}: {
  config: DepartmentConfig;
  draft: QuotationItem;
  onChange: (key: string, value: string | number) => void;
  onSubmit: () => void;
  submitLabel?: string;
  /** Optional preset name suggestions (item presets). */
  datalistOptions?: string[];
  onBlurField?: (key: string) => void;
  tradeExtras?: boolean;
  calcOverride?: CalculationType;
}) {
  const nameField = config.itemFields.find((f) => f.key === 'name');
  const inline = formInlineFields(config);
  const metaFields = config.itemFields.filter((f) => f.key !== 'name' && !INLINE_KEYS.includes(f.key));
  const calc = calcOverride || config.calculationType;
  const normalized = { ...draft, quantity: Number(draft.quantity) > 0 ? Number(draft.quantity) : 1 };
  const liveAmount = calculateLineAmount(normalized, calc);
  const liveDiscount = tradeExtras ? calculateLineDiscount(normalized, calc) : 0;
  const liveNet = liveAmount - liveDiscount;

  return (
    <div className="qm-item-card">
      <div className="qm-item-grid" style={{ gridTemplateColumns: formGridCols(config) }}>
        <label className="qm-mini">
          <span>{nameField?.label || 'Item'}{nameField?.required && <i style={{ color: '#c0392b' }}>*</i>}</span>
          <SuggestInput
            label={nameField?.label || 'Item'}
            value={String(draft.name ?? '')}
            suggestions={datalistOptions ?? []}
            placeholder={nameField?.placeholder}
            onChange={(v) => onChange('name', v)}
            onBlurField={onBlurField}
          />
        </label>
        {inline.map((f) => (
          <label className="qm-mini" key={f.key}>
            <span>{f.label}</span>
            <Control config={config} fieldKey={f.key} draft={draft} onChange={onChange} onBlurField={onBlurField} />
          </label>
        ))}
        <div className="qm-mini">
          <span>Amount</span>
          <span className="qm-amount">{formatINR(tradeExtras ? liveNet : liveAmount)}</span>
          {tradeExtras && liveDiscount > 0 && (
            <span style={{ fontSize: 11, color: '#2e7d4f' }}>(−{formatINR(liveDiscount)} disc.)</span>
          )}
        </div>
      </div>
      <div className="qm-item-meta2">
        {metaFields.map((f) => (
          <label className="qm-mini" key={f.key}>
            <span>{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea
                className="qm-input"
                rows={2}
                value={String(draft[f.key] ?? '')}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                aria-label={f.label}
              />
            ) : (
              <Control config={config} fieldKey={f.key} draft={draft} onChange={onChange} onBlurField={onBlurField} />
            )}
          </label>
        ))}
        <button type="button" className="qm-submit" onClick={onSubmit} disabled={!draft.name.trim()}>
          <i className="fas fa-paper-plane"></i> {submitLabel || 'Add Item'}
        </button>
      </div>
    </div>
  );
}
