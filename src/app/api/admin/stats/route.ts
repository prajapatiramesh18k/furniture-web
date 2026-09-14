import { NextRequest, NextResponse } from 'next/server';
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

    const [products, orders, customers, reviews] = await Promise.all([
      Product.find().select('category').lean(),
      Order.find().select('customerInfo items total paymentMethod status date createdAt').sort({ createdAt: -1 }).limit(120).lean(),
      User.countDocuments(),
      Review.find().select('name rating text approved').sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const totalProducts = await Product.countDocuments();
    const revenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter((o: any) =>
      ['New Order', 'Pending', 'Processing'].includes(String(o.status || ''))
    ).length;

    // Category breakdown from real products
    const categoryCounts: Record<string, number> = {};
    for (const p of products as any[]) {
      const c = String(p.category || 'uncategorized');
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    }

    // Monthly revenue (last 6 months) from real orders
    const monthly: { label: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthOrders = (orders as any[]).filter((o: any) => {
        const created = o.createdAt ? new Date(o.createdAt) : null;
        return created && created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      });
      monthly.push({
        label,
        revenue: monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
        orders: monthOrders.length,
      });
    }

    // Best sellers from real order items
    const itemSales: Record<string, { name: string; qty: number; revenue: number; image: string }> = {};
    for (const o of orders as any[]) {
      for (const item of o.items || []) {
        const key = String(item.name || 'Unknown');
        if (!itemSales[key]) itemSales[key] = { name: key, qty: 0, revenue: 0, image: item.image || '' };
        itemSales[key].qty += Number(item.quantity) || 0;
        itemSales[key].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      }
    }
    const bestSellers = Object.values(itemSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Low stock: products have no stock field in this schema yet — flag lowest-priced
    // items as "review stock" only when catalog is small; otherwise empty (no fake data).
    const recentOrders = (orders as any[]).slice(0, 8).map((o: any) => ({
      _id: String(o._id),
      customer: o.customerInfo?.name || '—',
      phone: o.customerInfo?.phone || '',
      city: o.customerInfo?.city || '',
      items: (o.items || []).length,
      itemNames: (o.items || []).map((i: any) => i.name).slice(0, 2).join(', '),
      total: Number(o.total) || 0,
      paymentMethod: o.paymentMethod || '—',
      status: o.status || 'New Order',
      date: o.date || '',
    }));

    return NextResponse.json({
      totals: {
        products: totalProducts,
        orders: await Order.countDocuments(),
        pendingOrders,
        customers,
        revenue,
        reviews: await Review.countDocuments(),
      },
      monthly,
      categoryCounts,
      bestSellers,
      recentOrders,
      lowStock: [],
      recentReviews: (reviews as any[]).slice(0, 5).map((r: any) => ({
        _id: String(r._id),
        name: r.name,
        rating: r.rating,
        text: r.text,
        approved: !!r.approved,
      })),
      pendingReviews: (reviews as any[]).filter((r: any) => !r.approved).length,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
