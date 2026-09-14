import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Review from '@/lib/models/Review';
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
    const [products, pendingOrders, pendingReviews] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ status: { $in: ['New Order', 'Pending', 'Processing'] } }),
      Review.countDocuments({ approved: false }),
    ]);
    return NextResponse.json({ products, pendingOrders, pendingReviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load badges' }, { status: 500 });
  }
}
