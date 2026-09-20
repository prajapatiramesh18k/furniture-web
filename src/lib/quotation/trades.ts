/**
 * Multi-trade registry for interior quotations.
 * Each trade maps to an existing department config (calculation rules, item
 * fields, presets) — so multi-trade quotations reuse single-trade logic and
 * old single-trade quotations keep working untouched.
 */
import type { DepartmentId } from './types';
import { DEPARTMENT_CONFIGS, getDepartmentConfig } from './departments';
import type { DepartmentConfig } from './types';

export interface TradeOption {
  /** Stable key stored on items/categories, e.g. 'carpentry'. */
  key: string;
  /** Display label, e.g. 'Carpentry'. */
  label: string;
  /** Department whose calc rules + item form apply to this trade. */
  department: DepartmentId;
  icon: string;
}

export const TRADE_OPTIONS: TradeOption[] = [
  { key: 'furniture', label: 'Furniture', department: 'furniture', icon: 'fa-couch' },
  { key: 'interior', label: 'Interior', department: 'interior', icon: 'fa-compass-drafting' },
  { key: 'false-ceiling', label: 'False Ceiling', department: 'interior', icon: 'fa-border-all' },
  { key: 'electrical', label: 'Electrical', department: 'electrical', icon: 'fa-bolt' },
  { key: 'plumbing', label: 'Plumbing', department: 'plumbing', icon: 'fa-faucet' },
  { key: 'civil', label: 'Civil', department: 'construction', icon: 'fa-trowel-bricks' },
  { key: 'painting', label: 'Painting', department: 'painting', icon: 'fa-paint-roller' },
  { key: 'other', label: 'Other', department: 'general', icon: 'fa-box-open' },
];

/**
 * Retired trade keys kept so OLD quotations/projects still resolve to the
 * right label, icon and department instead of falling back to "Other".
 * Carpentry is no longer offered as a new section — use Furniture.
 */
const LEGACY_TRADES: Record<string, TradeOption> = {
  carpentry: { key: 'carpentry', label: 'Carpentry', department: 'furniture', icon: 'fa-hammer' },
};

/** First trade backed by a department — used when entering multi mode. */
export function tradeForDepartment(department: string): TradeOption {
  const hit = TRADE_OPTIONS.find((t) => t.department === department);
  return hit || TRADE_OPTIONS[TRADE_OPTIONS.length - 1];
}

export function tradeOf(key: string | undefined | null): TradeOption {
  const k = String(key || '').toLowerCase();
  const hit = TRADE_OPTIONS.find((t) => t.key === k);
  if (hit) return hit;
  if (LEGACY_TRADES[k]) return LEGACY_TRADES[k];
  return TRADE_OPTIONS[TRADE_OPTIONS.length - 1];
}

export function tradeLabelOf(key: string | undefined | null): string {
  return tradeOf(key).label;
}

/** Department config backing a trade key (falls back to 'general'). */
export function configOfTrade(tradeKey: string | undefined | null): DepartmentConfig {
  try {
    return getDepartmentConfig(tradeOf(tradeKey).department);
  } catch {
    return DEPARTMENT_CONFIGS.general;
  }
}

/** Suggested display label for a new category (avoids duplicates: Painting, Painting 2…). */
export function uniqueCategoryLabel(base: string, taken: string[]): string {
  const clean = base.trim() || 'Other';
  if (!taken.includes(clean)) return clean;
  let i = 2;
  while (taken.includes(`${clean} ${i}`)) i++;
  return `${clean} ${i}`;
}
