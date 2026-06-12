import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Counter from '@/lib/models/Counter';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const result = await Counter.findByIdAndUpdate(
      'quotation',
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    const number = result?.seq ?? 1;
    return NextResponse.json({ quoteNo: `Q-${String(number).padStart(6, '0')}` });
  } catch (err) {
    console.error('quotation-counter error', err);
    return NextResponse.json(
      { quoteNo: `Q-${Date.now().toString().slice(-6)}` },
      { status: 200 }
    );
  }
}
