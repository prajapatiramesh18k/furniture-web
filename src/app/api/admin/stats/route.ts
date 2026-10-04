import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request, 'dashboard');
  if ('error' in gate) return gate.error;

  try {
    await dbConnect();

    const tenantId = gate.user.isSuperAdmin && !gate.user.tenantId ? null : gate.user.tenantId;
    const scope: Record<string, unknown> = tenantId ? { tenantId } : {};
    const match: Record<string, unknown> = tenantId
      ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
      : {};

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const [
      totalProducts,
      totalOrders,
      customers,
      totalReviews,
      pendingOrders,
      revenueRows,
      categoryRows,
      monthlyRows,
      bestSellerRows,
      recentOrders,
      recentReviews,
      pendingReviews,
    ] = await Promise.all([
      Product.countDocuments(scope),
      Order.countDocuments(scope),
      User.countDocuments(scope),
      Review.countDocuments(scope),
      Order.countDocuments({ ...scope, status: { $in: ['New Order', 'Pending', 'Processing'] } }),
      Order.aggregate([{ $match: match }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
      // Category breakdown computed in Mongo (was: fetch ALL products into Node).
      Product.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      // Monthly revenue/orders for last 6 months computed in Mongo (was: fetch
      // 120 orders + filter in JS).
      Order.aggregate([
        { $match: { ...match, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
      ]),
      // Best sellers computed in Mongo (was: unwind 120 orders in JS).
      Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            qty: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            image: { $first: '$items.image' },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', qty: 1, revenue: 1, image: 1 } },
      ]),
      Order.find(scope)
        .select('customerInfo items total paymentMethod status date createdAt')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Review.find(scope).select('name rating text approved').sort({ createdAt: -1 }).limit(5).lean(),
      Review.countDocuments({ ...scope, approved: { $ne: true } }),
    ]);

    const revenue = (revenueRows as { revenue?: number }[])[0]?.revenue || 0;

    const categoryCounts: Record<string, number> = {};
    for (const r of categoryRows as { _id?: string; count?: number }[]) {
      categoryCounts[String(r._id || 'uncategorized')] = r.count || 0;
    }

    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (const r of monthlyRows as { _id?: { y?: number; m?: number }; revenue?: number; orders?: number }[]) {
      if (r._id?.y && r._id?.m) monthlyMap.set(`${r._id.y}-${r._id.m}`, { revenue: r.revenue || 0, orders: r.orders || 0 });
    }
    const monthly: { label: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const hit = monthlyMap.get(`${d.getFullYear()}-${d.getMonth() + 1}`) || { revenue: 0, orders: 0 };
      monthly.push({ label, ...hit });
    }

    const recentOrdersOut = (recentOrders as Record<string, unknown>[]).map((o) => {
      const info = (o.customerInfo as { name?: string; phone?: string; city?: string } | undefined) || {};
      const items = (o.items as { name?: string }[] | undefined) || [];
      return {
        _id: String(o._id),
        customer: info.name || '—',
        phone: info.phone || '',
        city: info.city || '',
        items: items.length,
        itemNames: items.map((i) => i.name).slice(0, 2).join(', '),
        total: Number(o.total) || 0,
        paymentMethod: (o.paymentMethod as string) || '—',
        status: (o.status as string) || 'New Order',
        date: (o.date as string) || '',
      };
    });

    return NextResponse.json({
      totals: {
        products: totalProducts,
        orders: totalOrders,
        pendingOrders,
        customers,
        revenue,
        reviews: totalReviews,
      },
      monthly,
      categoryCounts,
      bestSellers: bestSellerRows,
      recentOrders: recentOrdersOut,
      lowStock: [],
      recentReviews: (recentReviews as Record<string, unknown>[]).map((r) => ({
        _id: String(r._id),
        name: r.name,
        rating: r.rating,
        text: r.text,
        approved: !!r.approved,
      })),
      pendingReviews,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
