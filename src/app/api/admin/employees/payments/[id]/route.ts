import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeePayment from '@/lib/models/EmployeePayment';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const payment = await EmployeePayment.findById(id).populate('employeeId', 'name employeeId');
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();

    const payment = await EmployeePayment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.paymentType !== undefined) updateData.paymentType = data.paymentType;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await EmployeePayment.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await EmployeePayment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
