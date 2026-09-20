/**
 * Central department registry — UI reads via DEPARTMENT_CONFIGS[department].
 * No department ifs in JSX; all variance lives in these configs.
 */
import type {
  DepartmentConfig,
  DepartmentId,
  ItemPreset,
  PackagePreset,
  QuotationItem,
} from './types';
import { DEPARTMENT_IDS } from './types';
import { furnitureConfig } from './furniture';
import { electricalConfig } from './electrical';
import { plumbingConfig } from './plumbing';
import { interiorConfig } from './interior';
import { constructionConfig } from './construction';
import { paintingConfig } from './painting';
import { softwareConfig } from './software';
import { generalConfig, customConfig } from './general';

export const DEPARTMENT_CONFIGS: Record<DepartmentId, DepartmentConfig> = {
  furniture: furnitureConfig,
  electrical: electricalConfig,
  plumbing: plumbingConfig,
  interior: interiorConfig,
  construction: constructionConfig,
  painting: paintingConfig,
  software: softwareConfig,
  general: generalConfig,
  custom: customConfig,
};

export function getDepartmentConfig(id: string | undefined | null): DepartmentConfig {
  if (id && (DEPARTMENT_IDS as string[]).includes(id)) return DEPARTMENT_CONFIGS[id as DepartmentId];
  return furnitureConfig;
}

export function makeEmptyItem(config: DepartmentConfig, id = -1): QuotationItem {
  const item: QuotationItem = { id, name: '', quantity: 1, rate: 0 };
  for (const f of config.itemFields) {
    if (f.key === 'name' || f.key === 'quantity' || f.key === 'rate') continue;
    if (f.type === 'number') item[f.key] = 0;
    else if (f.type === 'select' && f.options && f.options.length > 0 && f.key === 'unit' && config.units.length > 0) {
      item[f.key] = config.units[0];
    } else item[f.key] = '';
  }
  if (config.units.length > 0 && item.unit === undefined) item.unit = config.units[0];
  return item;
}

/** Convert a config preset into an editable draft/item (keeps furniture-era top-level fields). */
export function presetToItem(preset: ItemPreset, id: number): QuotationItem {
  const item: QuotationItem = {
    id,
    name: preset.name,
    quantity: preset.quantity ?? 1,
    rate: preset.rate ?? 0,
  };
  for (const [k, v] of Object.entries(preset.fields || {})) {
    if (k === 'quantity') item.quantity = Number(v) || 1;
    else if (k === 'rate') item.rate = Number(v) || 0;
    else item[k] = v;
  }
  return item;
}

/** Expand a package preset into items. Variant overrides (e.g. furniture PVC/Plywood) applied first. */
export function packageToItems(
  pkg: PackagePreset,
  variantFields?: Record<string, string | number>,
  baseId: number = Date.now(),
): QuotationItem[] {
  return pkg.items.map((p, i) => {
    const merged: ItemPreset = {
      ...p,
      fields: { ...(p.fields || {}), ...(variantFields || {}) },
    };
    return presetToItem(merged, baseId + i);
  });
}

export function workTypeOf(config: DepartmentConfig, value: string | undefined | null) {
  return config.workTypes.find((w) => w.value === value) || config.workTypes[0];
}

export const joinLines = (lines: string[]): string => lines.join('\n');
export const splitLines = (text: string): string[] =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
