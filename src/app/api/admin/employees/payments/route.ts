import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeePayment from '@/lib/models/EmployeePayment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    await dbConnect();
    let query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // lean + bounded limit; no populate (client already holds employee names)
    const payments = await EmployeePayment.find(query)
      .select('employeeId date amount paymentType notes createdBy createdAt')
      .sort({ date: -1 })
      .limit(500)
      .lean();
    return NextResponse.json(payments, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    const newPayment = await EmployeePayment.create(data);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
