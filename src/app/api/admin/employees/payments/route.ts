import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeePayment from '@/lib/models/EmployeePayment';
import Employee from '@/lib/models/Employee';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    await dbConnect();
    if (employeeId) {
      const emp = await Employee.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: employeeId })).select('_id').lean();
      if (!emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    let query: Record<string, unknown> = tenantFilter(gate.ctx.user.tenantId!);
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
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    // Payroll money movement is owner/admin-only.
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage payroll.' }, { status: 403 });
    }
    const data = await request.json();
    delete data.tenantId;
    await dbConnect();
    // Verify employee belongs to this tenant.
    if (data.employeeId) {
      const emp = await Employee.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: data.employeeId })).select('_id').lean();
      if (!emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    const newPayment = await EmployeePayment.create({ ...data, tenantId: gate.ctx.user.tenantId });
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
