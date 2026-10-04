import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { requireAdmin } from '@/lib/admin-auth';
import { getStorefrontTenantId } from '@/lib/storefront-tenant';

const fallbackOrders = [
  { _id: '1', customerInfo: { name: 'Amit Kumar', phone: '9876543210', address: '123 Main St, Mumbai', city: 'Mumbai' }, items: [{ name: 'Pooja Unit', price: 9999, quantity: 1 }], total: 9999, paymentMethod: 'UPI', status: 'New Order', date: '2024-01-20' },
  { _id: '2', customerInfo: { name: 'Neha Singh', phone: '9876543211', address: '456 Oak Rd, Delhi', city: 'Delhi' }, items: [{ name: 'TV Unit', price: 12999, quantity: 1 }], total: 12999, paymentMethod: 'Card', status: 'Processing', date: '2024-01-18' },
  { _id: '3', customerInfo: { name: 'Rajesh Patel', phone: '9876543212', address: '789 Pine Ave, Ahmedabad', city: 'Ahmedabad' }, items: [{ name: 'Dining Table', price: 18999, quantity: 1 }], total: 18999, paymentMethod: 'Cash', status: 'Delivered', date: '2024-01-15' },
];

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request, 'orders');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 100;
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
    const filter = gate.user.isSuperAdmin && !gate.user.tenantId ? {} : { tenantId: gate.user.tenantId };
    // lean() skips Mongoose hydration; bounded limit + pagination keeps this
    // fast as order volume grows (was: unbounded full-document fetch).
    const orders = await Order.find(filter)
      .select('customerInfo items total paymentMethod paymentId status date createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return NextResponse.json({ orders });
  } catch (error) {
    // Return fallback data if DB is not connected
    return NextResponse.json({ orders: fallbackOrders });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    // Public checkout attaches to the default storefront tenant (cached id).
    const storefrontTenantId = await getStorefrontTenantId();
    const order = new Order({
      tenantId: storefrontTenantId,
      customerInfo: body.customerInfo,
      items: body.items,
      total: body.total,
      paymentMethod: body.paymentMethod,
      paymentId: body.paymentId || null,
      razorpayOrderId: body.razorpayOrderId || null,
      status: body.paymentId ? 'Paid' : 'New Order',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    });
    await order.save();
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdmin(request, 'orders');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status } = body;
    const filter = gate.user.isSuperAdmin && !gate.user.tenantId ? { _id: id } : { _id: id, tenantId: gate.user.tenantId };
    await Order.findOneAndUpdate(filter, { status });
    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
