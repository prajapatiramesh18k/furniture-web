/**
 * Calculation engine for the multi-department quotation maker.
 * Explicit functions per CalculationType — no eval().
 *
 * Multi-trade rules (all optional → legacy docs compute exactly as before):
 * - line gross = existing calculateLineAmount (qty/area × rate)
 * - line net   = gross × (1 − discountPct/100)
 * - line tax % = item.taxPct ?? category.taxPct ?? (includeGst ? 18 : 0)
 * - category flat discount is subtracted from the category net (floored at 0)
 */
import type { CalculationType, CategoryTotals, QuotationCategory, QuotationItem } from './types';

export const num = (v: string | number | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Measurable extent of an item (sqft-ish) for area-type departments. */
export function measureOf(item: QuotationItem): number {
  const h = num(item.height);
  const w = num(item.width);
  if (h > 0 && w > 0) return h * w;
  return num(item.area);
}

export function hasMeasure(item: QuotationItem): boolean {
  return measureOf(item) > 0;
}

export function calculateLineAmount(item: QuotationItem, calc: CalculationType): number {
  const qty = num(item.quantity) > 0 ? num(item.quantity) : 1;
  const rate = num(item.rate);
  switch (calc) {
    case 'area': {
      const m = measureOf(item);
      // Area without dimensions falls back to quantity x rate.
      return m > 0 ? m * rate * qty : rate * qty;
    }
    case 'quantity':
    case 'hour':
    case 'day':
      return rate * qty;
    case 'fixed':
      return rate * qty;
    default:
      return rate * qty;
  }
}

export function totalsOf(items: QuotationItem[], calc: CalculationType, includeGst: boolean) {
  const subtotal = items.reduce((s, i) => s + calculateLineAmount(i, calc), 0);
  const gst = includeGst ? subtotal * 0.18 : 0;
  return { subtotal, gst, total: subtotal + gst };
}

export const discountPctOf = (item: QuotationItem): number => {
  const d = num(item.discountPct);
  return d > 0 ? Math.min(100, d) : 0;
};

/** Gross → net after the per-item discount %. */
export function calculateLineNet(item: QuotationItem, calc: CalculationType): number {
  const gross = calculateLineAmount(item, calc);
  return gross * (1 - discountPctOf(item) / 100);
}

/** Discount ₹ saved on one line (gross − net). */
export function calculateLineDiscount(item: QuotationItem, calc: CalculationType): number {
  return calculateLineAmount(item, calc) - calculateLineNet(item, calc);
}

/**
 * Effective tax % for a line: item taxPct → category taxPct → global 18% toggle.
 * An explicit 0 means "no tax on this line" and stops the fallback chain.
 */
export function taxPctOf(item: QuotationItem, categoryTaxPct?: number | null, includeGst = false): number {
  if (item.taxPct !== undefined && item.taxPct !== null && String(item.taxPct) !== '') {
    return Math.max(0, num(item.taxPct));
  }
  if (categoryTaxPct !== undefined && categoryTaxPct !== null && String(categoryTaxPct) !== '') {
    return Math.max(0, num(categoryTaxPct));
  }
  return includeGst ? 18 : 0;
}

export function calculateLineTax(item: QuotationItem, calc: CalculationType, categoryTaxPct?: number | null, includeGst = false): number {
  return calculateLineNet(item, calc) * (taxPctOf(item, categoryTaxPct, includeGst) / 100);
}

export function calculateLineTotal(item: QuotationItem, calc: CalculationType, categoryTaxPct?: number | null, includeGst = false): number {
  return calculateLineNet(item, calc) + calculateLineTax(item, calc, categoryTaxPct, includeGst);
}

export type CalcResolver = (tradeKey: string | undefined) => CalculationType;

/**
 * Category-wise + grand totals for a multi-trade quotation.
 * Items are grouped by `item.trade` (fallback: first category / 'other').
 * calcOf resolves the CalculationType per trade (each trade keeps its own rules).
 */
export function multiTotalsOf(
  items: QuotationItem[],
  categories: QuotationCategory[],
  calcOf: CalcResolver,
  includeGst: boolean,
) {
  const cats = [...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const fallbackKey = cats[0]?.key || 'other';
  const catByKey = new Map(cats.map((c) => [c.key, c]));

  const categoryTotals: CategoryTotals[] = cats.map((c) => {
    const catItems = items.filter((it) => (it.trade || fallbackKey) === c.key);
    const calc = calcOf(c.trade);
    let gross = 0;
    let net = 0;
    let tax = 0;
    for (const it of catItems) {
      gross += calculateLineAmount(it, calc);
      const n = calculateLineNet(it, calc);
      net += n;
      tax += n * (taxPctOf(it, c.taxPct, includeGst) / 100);
    }
    const flat = Math.max(0, num(c.discount));
    const cappedFlat = Math.min(flat, net);
    net -= cappedFlat;
    return {
      key: c.key,
      label: c.label,
      room: c.room,
      subtotal: net,
      discount: gross - net,
      tax,
      total: net + tax,
    };
  });

  // Items whose trade matches no known category (e.g. legacy 'other') — attach to fallback.
  const knownKeys = new Set(cats.map((c) => c.key));
  const orphaned = items.filter((it) => it.trade && !knownKeys.has(it.trade));
  if (orphaned.length > 0) {
    const fb = categoryTotals.find((c) => c.key === fallbackKey);
    const cat = catByKey.get(fallbackKey);
    const calc = calcOf(cat?.trade);
    if (fb) {
      for (const it of orphaned) {
        const gross = calculateLineAmount(it, calc);
        const n = calculateLineNet(it, calc);
        const t = n * (taxPctOf(it, cat?.taxPct, includeGst) / 100);
        fb.subtotal += n;
        fb.discount += gross - n;
        fb.tax += t;
        fb.total += n + t;
      }
    }
  }

  const subtotal = categoryTotals.reduce((s, c) => s + c.subtotal, 0);
  const totalDiscount = categoryTotals.reduce((s, c) => s + c.discount, 0);
  const gst = categoryTotals.reduce((s, c) => s + c.tax, 0);
  return { subtotal, totalDiscount, gst, total: subtotal + gst, categoryTotals };
}

export const formatINR = (n: number): string =>
  '₹' +
  n.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

export function numberToWords(numValue: number): string {
  if (numValue === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const two = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };

  const three = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h ? ones[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : '');
  };

  let result = '';
  const crore = Math.floor(numValue / 10000000);
  const lakh = Math.floor((numValue % 10000000) / 100000);
  const thousand = Math.floor((numValue % 100000) / 1000);
  const hundred = numValue % 1000;

  if (crore) result += three(crore) + ' Crore ';
  if (lakh) result += two(lakh) + ' Lakh ';
  if (thousand) result += two(thousand) + ' Thousand ';
  if (hundred) result += three(hundred);

  return result.trim() + ' Rupees Only';
}
