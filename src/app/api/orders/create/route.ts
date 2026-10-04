import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay order creation failed: missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET env');
      return NextResponse.json(
        { error: 'Payment is not configured (missing Razorpay keys on server)' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error?.error || error);
    // Surface Razorpay's own message (e.g. auth failed) instead of a generic one
    const message =
      error?.error?.description ||
      error?.message ||
      'Failed to create order';
    const status = error?.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
