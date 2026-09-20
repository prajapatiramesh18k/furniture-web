'use client';

import DynamicItemsTable from './DynamicItemsTable';
import { formatINR } from '@/lib/quotation/calculations';
import { TRADE_OPTIONS, configOfTrade, tradeOf, uniqueCategoryLabel } from '@/lib/quotation/trades';
import type { CalculationType, CategoryTotals, QuotationCategory, QuotationItem } from '@/lib/quotation/types';

export function newCategoryFor(tradeKey: string, takenLabels: string[], sortOrder: number): QuotationCategory {
  const t = tradeOf(tradeKey);
  const base = `${t.key}-${Date.now().toString(36)}`;
  return {
    key: `${t.key}-${sortOrder}-${base.slice(-4)}`,
    trade: t.key,
    label: uniqueCategoryLabel(t.label, takenLabels),
    room: '',
    discount: 0,
    taxPct: undefined,
    sortOrder,
  };
}

export function calcOfTrade(tradeKey: string | undefined): CalculationType {
  return configOfTrade(tradeKey).calculationType;
}

/**
 * "Add trade" pills — rendered FIRST, above the item form. Whatever trade
 * the user picks, the item form below follows the newly selected section.
 */
export function AddTradePills({
  categories,
  onAdd,
}: {
  categories: QuotationCategory[];
  onAdd: (tradeKey: string) => void;
}) {
  const usedTrades = new Set(categories.map((c) => c.trade));
  return (
    <div className="quotation-package-pills" style={{ marginBottom: 10 }}>
      <span className="quotation-package-label">Add trade:</span>
      {TRADE_OPTIONS.map((t) => (
        <button
          key={t.key}
          type="button"
          className="quotation-package-pill"
          onClick={() => onAdd(t.key)}
          title={`Add ${t.label} section${usedTrades.has(t.key) ? ' (another)' : ''}`}
        >
          <i className={`fas ${t.icon}`}></i> {t.label}
        </button>
      ))}
    </div>
  );
}
/**
 * Multi-trade section cards: per-section settings (room, flat discount,
 * tax %) and read-only item lists with category-wise subtotals.
 * The item form lives above these cards and targets `activeKey`.
 * Pass `hidePicker` when the AddTradePills are rendered separately first.
 */
export default function MultiTradeSections({
  categories,
  activeKey,
  onActive,
  onAdd,
  onRemove,
  onPatch,
  items,
  totalsByKey,
  onEdit,
  onDelete,
  hidePicker,
}: {
  categories: QuotationCategory[];
  activeKey: string;
  onActive: (key: string) => void;
  onAdd: (tradeKey: string) => void;
  onRemove: (key: string) => void;
  onPatch: (key: string, patch: Partial<QuotationCategory>) => void;
  items: QuotationItem[];
  totalsByKey: Map<string, CategoryTotals>;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  hidePicker?: boolean;
}) {
  const sorted = [...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div>
      {!hidePicker && <AddTradePills categories={categories} onAdd={onAdd} />}

      {sorted.map((c) => {
        const cfg = configOfTrade(c.trade);
        const catItems = items.filter((it) => (it.trade || activeKey) === c.key);
        const ct = totalsByKey.get(c.key);
        const isActive = c.key === activeKey;
        return (
          <div
            key={c.key}
            style={{
              border: isActive ? '1.5px solid #a27341' : '1px solid #e7dbc4',
              borderRadius: 12,
              marginBottom: 12,
              background: isActive ? '#fffdf7' : '#fff',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', background: isActive ? '#faf3e3' : '#faf7f1' }}>
              <i className={`fas ${tradeOf(c.trade).icon}`} style={{ color: '#a27341' }}></i>
              <input
                className="qm-input"
                style={{ maxWidth: 200, fontWeight: 700 }}
                value={c.label}
                onChange={(e) => onPatch(c.key, { label: e.target.value })}
                aria-label="Category label"
              />
              {c.room ? <span style={{ fontSize: 12, color: '#8a7a66' }}>· {c.room}</span> : null}
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {!isActive && (
                  <button type="button" className="qm-cancel" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onActive(c.key)}>
                    Add items here
                  </button>
                )}
                {categories.length > 1 && (
                  <button
                    type="button"
                    className="qm-cancel"
                    style={{ padding: '4px 10px', fontSize: 12, color: '#b3273a' }}
                    onClick={() => onRemove(c.key)}
                    title={catItems.length > 0 ? `Remove section + move ${catItems.length} item(s) to first section` : 'Remove section'}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </span>
            </div>

            <div style={{ padding: '4px 12px 12px' }}>
              {catItems.length > 0 ? (
                <>
                  <DynamicItemsTable config={cfg} items={catItems} variant="editor" onEdit={onEdit} onDelete={onDelete} />
                  {ct && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 16, padding: '8px 4px 0', fontSize: 13, flexWrap: 'wrap', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {ct.discount > 0 && <span style={{ color: '#2e7d4f' }}>Discount −{formatINR(ct.discount)}</span>}
                      {ct.tax > 0 && <span style={{ color: '#8a7a66' }}>Tax {formatINR(ct.tax)}</span>}
                      <strong style={{ marginLeft: 'auto' }}>{c.label} subtotal: {formatINR(ct.total)}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12.5, color: '#8a7a66', margin: '6px 0' }}>
                  {isActive ? 'No items yet — use the item form above; items land in this section.' : 'No items yet.'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
