import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

const fallbackOrders = [
  { _id: '1', customerInfo: { name: 'Amit Kumar', phone: '9876543210', address: '123 Main St, Mumbai', city: 'Mumbai' }, items: [{ name: 'Pooja Unit', price: 9999, quantity: 1 }], total: 9999, paymentMethod: 'UPI', status: 'New Order', date: '2024-01-20' },
  { _id: '2', customerInfo: { name: 'Neha Singh', phone: '9876543211', address: '456 Oak Rd, Delhi', city: 'Delhi' }, items: [{ name: 'TV Unit', price: 12999, quantity: 1 }], total: 12999, paymentMethod: 'Card', status: 'Processing', date: '2024-01-18' },
  { _id: '3', customerInfo: { name: 'Rajesh Patel', phone: '9876543212', address: '789 Pine Ave, Ahmedabad', city: 'Ahmedabad' }, items: [{ name: 'Dining Table', price: 18999, quantity: 1 }], total: 18999, paymentMethod: 'Cash', status: 'Delivered', date: '2024-01-15' },
];

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
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
    const order = new Order({
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
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status } = body;
    await Order.findByIdAndUpdate(id, { status });
    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
