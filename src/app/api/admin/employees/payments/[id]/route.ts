import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeePayment from '@/lib/models/EmployeePayment';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { id } = await params;
    await dbConnect();
    const payment = await EmployeePayment.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id })).populate('employeeId', 'name employeeId');
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
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage payroll.' }, { status: 403 });
    }
    const { id } = await params;
    const data = await request.json();
    delete data.tenantId;
    delete data.employeeId;
    await dbConnect();

    const payment = await EmployeePayment.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.paymentType !== undefined) updateData.paymentType = data.paymentType;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await EmployeePayment.findOneAndUpdate(tenantFilter(gate.ctx.user.tenantId!, { _id: id }), { $set: updateData }, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage payroll.' }, { status: 403 });
    }
    const { id } = await params;
    await dbConnect();
    const deleted = await EmployeePayment.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deleted) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
