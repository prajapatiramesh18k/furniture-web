'use client';

import { calculateLineAmount, formatINR, measureOf, num } from '@/lib/quotation/calculations';
import type { DepartmentConfig, QuotationItem } from '@/lib/quotation/types';

/** Secondary attribute line under the item name (material / brand / description …). */
export function itemSubline(item: QuotationItem): string {
  const bits: string[] = [];
  if (item.material) bits.push(String(item.material));
  if (item.finish) bits.push(String(item.finish));
  if (item.brand) bits.push(String(item.brand));
  if (item.paintType) bits.push(String(item.paintType));
  if (item.description) bits.push(String(item.description));
  return bits.join(' · ');
}

function specText(item: QuotationItem): string {
  if (item.specification) return String(item.specification);
  const bits: string[] = [];
  if (item.material) bits.push(String(item.material));
  if (item.size) bits.push(String(item.size));
  return bits.join(' / ') || '—';
}

/** Render one logical cell for print + editor tables. */
export function renderCell(colKey: string, item: QuotationItem, index: number, config: DepartmentConfig): React.ReactNode {
  switch (colKey) {
    case 'index':
      return index + 1;
    case 'name':
      return (
        <>
          <div className="qp-item-name">{item.name || '—'}</div>
          {itemSubline(item) && <div className="qp-item-material">{itemSubline(item)}</div>}
        </>
      );
    case 'dims': {
      const h = num(item.height);
      const w = num(item.width);
      return h > 0 && w > 0 ? `${h} × ${w}` : '—';
    }
    case 'qty':
      return Number(item.quantity) || 1;
    case 'measure': {
      const m = measureOf(item);
      return m > 0 ? m.toLocaleString('en-IN') : '—';
    }
    case 'rate':
      return formatINR(num(item.rate));
    case 'amount':
      return formatINR(calculateLineAmount(item, config.calculationType));
    case 'unit':
      return item.unit ? String(item.unit) : '—';
    case 'brand':
      return item.brand ? String(item.brand) : '—';
    case 'specification':
      return specText(item);
    case 'material':
      return item.material ? String(item.material) : '—';
    case 'size':
      return item.size ? String(item.size) : '—';
    case 'finish':
      return item.finish ? String(item.finish) : '—';
    case 'paintType':
      return item.paintType ? String(item.paintType) : '—';
    case 'description':
      return item.description ? String(item.description) : '—';
    case 'billingType':
      return item.billingType ? String(item.billingType) : '—';
    case 'area':
      return num(item.area) > 0 ? num(item.area).toLocaleString('en-IN') : '—';
    default:
      return item[colKey] !== undefined && item[colKey] !== '' ? String(item[colKey]) : '—';
  }
}

/**
 * Department-driven items table.
 * variant="print" renders the qp-table used by html2canvas PDF capture.
 * variant="editor" renders the editable Added-Items list with Update/Delete.
 */
export default function DynamicItemsTable({
  config,
  items,
  variant,
  onEdit,
  onDelete,
}: {
  config: DepartmentConfig;
  items: QuotationItem[];
  variant: 'print' | 'editor';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}) {
  if (items.length === 0) return null;

  if (variant === 'print') {
    return (
      <table className="qp-table">
        <thead>
          <tr>
            {config.tableColumns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id ?? idx}>
              {config.tableColumns.map((c) => (
                <td key={c.key} style={c.align === 'right' ? { textAlign: 'right' } : undefined}>
                  {renderCell(c.key, it, idx, config)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="quotation-items-list">
      <div className="quotation-items-list-head">
        <i className="fas fa-list-check"></i>
        <span>
          Added Items ({items.length})
        </span>
      </div>
      <div className="quotation-items-list-header" style={{ gridTemplateColumns: `2fr 1fr 0.6fr 1fr 0.9fr 0.9fr` }}>
        <span>{config.labels.itemName}</span>
        <span>Details</span>
        <span>{config.labels.quantity}</span>
        <span>{config.labels.rate}</span>
        <span>{config.labels.amount}</span>
        <span>Actions</span>
      </div>
      {items.map((it, idx) => (
        <div className="quotation-items-list-row" key={it.id ?? idx} style={{ gridTemplateColumns: `2fr 1fr 0.6fr 1fr 0.9fr 0.9fr` }}>
          <div className="quotation-items-list-name-cell">
            <div className="quotation-items-list-name">{it.name}</div>
          </div>
          <div className="quotation-items-list-material-cell">
            {itemSubline(it) || <span className="quotation-items-list-empty">—</span>}
          </div>
          <div className="quotation-items-list-num">{Number(it.quantity) || 1}</div>
          <div className="quotation-items-list-num">{formatINR(num(it.rate))}</div>
          <div className="quotation-items-list-num quotation-items-list-amt">
            {formatINR(calculateLineAmount(it, config.calculationType))}
          </div>
          <div className="quotation-items-list-action-cell" style={{ display: 'flex', gap: 6 }}>
            {onEdit && (
              <button type="button" className="quotation-list-btn quotation-list-btn-update" onClick={() => onEdit(it.id)} title="Edit this item">
                <i className="fas fa-pen"></i> Update
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="quotation-list-btn quotation-list-btn-update"
                style={{ color: '#b3273a' }}
                onClick={() => onDelete(it.id)}
                title="Delete this item"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
