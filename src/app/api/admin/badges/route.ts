import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Review from '@/lib/models/Review';
import Quotation from '@/lib/models/Quotation';
import Contact from '@/models/Contact';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Lightweight badge counts for the shell sidebar (cheap countDocuments only).
 * The heavy /api/admin/stats aggregation loads on demand from the dashboard.
 */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request, 'dashboard');
  if ('error' in gate) return gate.error;

  try {
    await dbConnect();
    const scope = gate.user.isSuperAdmin && !gate.user.tenantId ? {} : { tenantId: gate.user.tenantId };
    const [products, pendingOrders, pendingReviews, pendingQuotations, pendingLeads] = await Promise.all([
      Product.countDocuments(scope),
      Order.countDocuments({ ...scope, status: { $in: ['New Order', 'Pending', 'Processing'] } }),
      Review.countDocuments({ ...scope, approved: false }),
      // Quotations awaiting customer decision (legacy docs without status count as sent).
      Quotation.countDocuments({ ...scope, $or: [{ status: 'sent' }, { status: { $exists: false } }, { status: null }, { status: '' }] }),
      // Fresh leads that nobody has contacted yet.
      Contact.countDocuments({ ...scope, status: 'new' }),
    ]);
    return NextResponse.json({ products, pendingOrders, pendingReviews, pendingQuotations, pendingLeads });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load badges' }, { status: 500 });
  }
}
