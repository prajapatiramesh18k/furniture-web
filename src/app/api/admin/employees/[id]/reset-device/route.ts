import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { id } = await params;
    await dbConnect();

    const employee = await Employee.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Reset device lock
    employee.deviceId = null;
    employee.deviceName = '';
    employee.deviceRegisteredAt = null;
    await employee.save();

    return NextResponse.json({
      success: true,
      message: `Device lock for "${employee.name}" has been reset. They can now link their new phone on their next punch.`,
      employee,
    });
  } catch (error: any) {
    console.error('Error resetting device lock:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
