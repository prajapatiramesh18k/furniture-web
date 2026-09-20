/**
 * Multi-department quotation maker — shared TypeScript types.
 * One generic Quotation / QuotationItem is used for every department;
 * department-specific values live in lib/quotation/<dept>.ts configs.
 */

export type DepartmentId =
  | 'furniture'
  | 'electrical'
  | 'plumbing'
  | 'interior'
  | 'construction'
  | 'painting'
  | 'software'
  | 'general'
  | 'custom';

export const DEPARTMENT_IDS: DepartmentId[] = [
  'furniture',
  'electrical',
  'plumbing',
  'interior',
  'construction',
  'painting',
  'software',
  'general',
  'custom',
];

export type ItemFieldType = 'text' | 'number' | 'select' | 'textarea';

export type CalculationType =
  | 'area' // (height x width || area) x rate x quantity — furniture, painting, interior
  | 'quantity' // quantity x rate — electrical, plumbing, construction, general
  | 'fixed' // rate flat — software fixed-price style still honours quantity
  | 'hour'
  | 'day';

export interface ItemFieldConfig {
  key: string;
  label: string;
  type: ItemFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  unit?: string;
  step?: string;
  min?: number;
}

export interface TableColumnConfig {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export interface WorkTypeConfig {
  value: string;
  label: string;
  terms: string[];
  inclusions: string[];
}

/** Single selectable preset item (fills the draft / item list). */
export interface ItemPreset {
  name: string;
  quantity?: number;
  rate?: number;
  /** Department-specific field values, e.g. { material: 'BWR Plywood', height: 7, width: 8 }. */
  fields?: Record<string, string | number>;
}

export interface PackagePreset {
  label: string;
  projectType: string;
  items: ItemPreset[];
}

/** Material-variant shortcut (furniture PVC / Plywood). Generic so any dept can define variants. */
export interface VariantConfig {
  key: string;
  label: string;
  /** Field overrides applied to the draft when the variant is picked. */
  fields: Record<string, string | number>;
}

export interface QuickStart {
  label: string;
  presetIndex: number;
  variantKey?: string | null;
}

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  short: string;

  projectTypes: string[];

  /** Complete item form definition — DynamicItemForm renders exactly these fields. */
  itemFields: ItemFieldConfig[];

  units: string[];
  calculationType: CalculationType;

  /** Select-options for the `material`-ish field (if the dept has one). */
  materials?: string[];

  presets?: ItemPreset[];
  packages?: PackagePreset[];
  variants?: VariantConfig[];
  quickStart?: QuickStart[];

  workTypes: WorkTypeConfig[];
  defaultWorkType: string;

  defaultTerms: string[];
  defaultInclusions: string[];

  labels: {
    itemName: string;
    rate: string;
    quantity: string;
    amount: string;
    itemsTitle: string;
  };

  /** Columns for the items table / PDF. Rendered by DynamicItemsTable — no dept ifs in JSX. */
  tableColumns: TableColumnConfig[];
}

/**
 * Flexible line item shared by ALL departments.
 * Furniture-era fields (material/height/width) stay top-level so existing
 * quotations keep working; every other dept uses the optional extras.
 *
 * Multi-trade extras (all optional — old docs unaffected):
 * - trade: trade key, e.g. 'carpentry' (see lib/quotation/trades.ts)
 * - room: room/area label, e.g. 'Living Room'
 * - discountPct: per-item discount % on the line amount (0-100)
 * - taxPct: per-item tax % on the discounted line (overrides category/global)
 */
export interface QuotationItem {
  id: number;
  name: string;
  quantity: number;
  rate: number;
  unit?: string;
  description?: string;
  material?: string;
  brand?: string;
  specification?: string;
  size?: string;
  finish?: string;
  paintType?: string;
  billingType?: string;
  area?: number;
  height?: number;
  width?: number;
  trade?: string;
  room?: string;
  discountPct?: number;
  taxPct?: number;
  [key: string]: string | number | undefined;
}

/**
 * One work category (trade section) inside a multi-trade quotation.
 * Single-trade quotations have no categories — reads treat missing as one
 * implicit section backed by the quotation's department.
 */
export interface QuotationCategory {
  /** Stable key, e.g. 'carpentry' or 'carpentry-2'. Items link via item.trade. */
  key: string;
  /** Trade key from TRADE_OPTIONS, e.g. 'carpentry'. */
  trade: string;
  /** Display label, e.g. 'Carpentry'. */
  label: string;
  /** Optional room/area for the whole section, e.g. '2 BHK — Full Home'. */
  room?: string;
  /** Flat ₹ discount on this category's net (after item discounts). */
  discount?: number;
  /** Category tax % — applies to lines without an explicit item taxPct. */
  taxPct?: number;
  sortOrder: number;
}

export interface CategoryTotals {
  key: string;
  label: string;
  room?: string;
  /** Net after item + category discounts, before tax. */
  subtotal: number;
  /** Total discount given in this category (item % + flat). */
  discount: number;
  /** Total tax in this category (item + category + global share). */
  tax: number;
  total: number;
}

export interface TenantBrand {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  website: string;
  logo: string;
}

export interface QuotationTotals {
  subtotal: number;
  gst: number;
  total: number;
  /** Sum of all discounts (item % + category flat). Absent on legacy docs (= 0). */
  totalDiscount?: number;
  /** Per-category breakdown. Absent on single-trade docs. */
  categoryTotals?: CategoryTotals[];
}

/** Legacy furniture-era item shape — assignable to QuotationItem, kept for migration clarity. */
export interface LegacyLineItem {
  id?: number;
  _id?: string;
  name: string;
  material?: string;
  height?: number;
  width?: number;
  quantity: number;
  rate: number;
}

export function normalizeItem(raw: LegacyLineItem & Partial<QuotationItem>): QuotationItem {
  return {
    id: typeof raw.id === 'number' ? raw.id : Date.now() + Math.floor(Math.random() * 1000),
    name: String(raw.name || ''),
    quantity: Number(raw.quantity) || 1,
    rate: Number(raw.rate) || 0,
    unit: raw.unit ? String(raw.unit) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    material: raw.material ? String(raw.material) : undefined,
    brand: raw.brand ? String(raw.brand) : undefined,
    specification: raw.specification ? String(raw.specification) : undefined,
    size: raw.size ? String(raw.size) : undefined,
    finish: raw.finish ? String(raw.finish) : undefined,
    paintType: raw.paintType ? String(raw.paintType) : undefined,
    billingType: raw.billingType ? String(raw.billingType) : undefined,
    area: raw.area !== undefined ? Number(raw.area) || 0 : undefined,
    height: raw.height !== undefined ? Number(raw.height) || 0 : undefined,
    width: raw.width !== undefined ? Number(raw.width) || 0 : undefined,
    trade: raw.trade ? String(raw.trade) : undefined,
    room: raw.room ? String(raw.room) : undefined,
    discountPct: raw.discountPct !== undefined ? Math.min(100, Math.max(0, Number(raw.discountPct) || 0)) : undefined,
    taxPct: raw.taxPct !== undefined && raw.taxPct !== null && String(raw.taxPct) !== '' ? Math.max(0, Number(raw.taxPct) || 0) : undefined,
  };
}
