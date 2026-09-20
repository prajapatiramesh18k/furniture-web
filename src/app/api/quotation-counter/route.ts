import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Counter from '@/lib/models/Counter';
import { getTenantContext } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Per-tenant quotation sequence: `quotation:<tenantId>`.
    // Falls back to the legacy global `quotation` key only when no tenant resolves
    // (public maker before migration / default storefront tenant).
    let key = 'quotation';
    let prefix = 'Q';
    try {
      const ctx = await getTenantContext(request);
      if (ctx?.tenant) {
        key = `quotation:${ctx.tenant.id}`;
        prefix = ctx.tenant.quotationPrefix || 'Q';
      } else {
        const Tenant = (await import('@/lib/models/Tenant')).default;
        const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
        const t = (await Tenant.findOne({ slug: defaultSlug }).lean()) || (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).lean());
        if (t) {
          key = `quotation:${String(t._id)}`;
          prefix = t.quotationPrefix || 'Q';
        }
      }
    } catch {}
    // Peek-only: never increment on preview/refresh. The number is consumed
    // atomically in POST /api/quotations when the quotation is actually saved.
    const current = await Counter.findById(key).lean();
    const number = (current?.seq ?? 0) + 1;
    return NextResponse.json({ quoteNo: `${prefix}-${String(number).padStart(6, '0')}` });
  } catch (err) {
    console.error('quotation-counter error', err);
    return NextResponse.json(
      { quoteNo: `Q-${Date.now().toString().slice(-6)}` },
      { status: 200 }
    );
  }
}
