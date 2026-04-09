import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ orders });  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
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
      status: 'New Order',
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
