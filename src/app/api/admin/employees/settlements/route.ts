import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeSettlement from '@/lib/models/EmployeeSettlement';
import Employee from '@/lib/models/Employee';
import { calculateMonthlyPayroll } from '@/lib/payroll-service';
import EmployeePayment from '@/lib/models/EmployeePayment';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const tenantId = gate.ctx.user.tenantId!;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employeeId');

    await dbConnect();

    // If we request for a specific employee, generate the current preview
    if (employeeId && month && year) {
      const employee = await Employee.findOne(tenantFilter(tenantId, { _id: employeeId })).select('dailyRate standardHours').lean() as { dailyRate: number; standardHours?: number } | null;
      if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

      // Check if already settled
      const existingSettlement = await EmployeeSettlement.findOne({ tenantId, employeeId, month: Number(month), year: Number(year) }).lean();
      if (existingSettlement) {
        return NextResponse.json({ ...existingSettlement, isPreview: false });
      }

      // Generate preview
      const preview = await calculateMonthlyPayroll(employeeId, employee.dailyRate, Number(month), Number(year));
      return NextResponse.json({ ...preview, isPreview: true });
    }

    // Otherwise return history of settlements
    let query: Record<string, unknown> = tenantFilter(tenantId);
    if (employeeId) {
      const emp = await Employee.findOne(tenantFilter(tenantId, { _id: employeeId })).select('_id').lean();
      if (!emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      query.employeeId = employeeId;
    }
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const settlements = await EmployeeSettlement.find(query)
      .sort({ settlementDate: -1 })
      .limit(200)
      .lean();
    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    // Settlements are owner/admin-only (manager never sees the Payroll tab).
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage settlements.' }, { status: 403 });
    }
    const tenantId = gate.ctx.user.tenantId!;
    const data = await request.json();
    delete data.tenantId;
    await dbConnect();

    const employee = await Employee.findOne(tenantFilter(tenantId, { _id: data.employeeId }));
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Verify it's not already settled
    const existingSettlement = await EmployeeSettlement.findOne({ tenantId, employeeId: data.employeeId, month: data.month, year: data.year });
    if (existingSettlement) {
      return NextResponse.json({ error: 'Account already settled for this month' }, { status: 400 });
    }

    const newSettlement = await EmployeeSettlement.create({
      ...data,
      tenantId,
      status: 'Settled',
      settlementDate: new Date()
    });

    // Optionally create a payment record for the settlement amount if > 0
    if (data.settlementAmount > 0) {
       await EmployeePayment.create({
         tenantId,
         employeeId: data.employeeId,
         date: new Date(),
         amount: data.settlementAmount,
         paymentType: 'Settlement',
         notes: `Settlement for ${data.month}/${data.year}`,
         createdBy: data.createdBy || 'Admin'
       });
    }

    return NextResponse.json(newSettlement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Account already settled for this month' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage settlements.' }, { status: 403 });
    }
    const tenantId = gate.ctx.user.tenantId!;
    const data = await request.json();
    delete data.tenantId;
    const { employeeId, month, year, dailyRate: customRate } = data;

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: 'Missing employeeId, month, or year' }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOne(tenantFilter(tenantId, { _id: employeeId }));
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const effectiveRate = customRate !== undefined && customRate !== null ? Number(customRate) : employee.dailyRate;
    const calc = await calculateMonthlyPayroll(employeeId, effectiveRate, Number(month), Number(year));

    const updatedSettlement = await EmployeeSettlement.findOneAndUpdate(
      { tenantId, employeeId, month: Number(month), year: Number(year) },
      {
        $set: {
          totalWorkHours: calc.totalWorkHours,
          totalEarnedDays: calc.totalEarnedDays,
          dailyRate: effectiveRate,
          grossAmount: calc.grossAmount,
          totalPaid: calc.totalPaid,
          balanceAmount: calc.balanceAmount,
          settlementAmount: calc.balanceAmount,
          status: 'Settled',
          updatedAt: new Date(),
        }
      },
      { new: true, upsert: true }
    );

    // Synchronize the associated settlement payment record
    const settlementNotes = `Settlement for ${month}/${year}`;
    const existingPayment = await EmployeePayment.findOne({
      tenantId,
      employeeId,
      paymentType: 'Settlement',
      notes: settlementNotes,
    });

    if (existingPayment) {
      existingPayment.amount = calc.balanceAmount;
      await existingPayment.save();
    } else if (calc.balanceAmount > 0) {
      await EmployeePayment.create({
        tenantId,
        employeeId,
        date: new Date(),
        amount: calc.balanceAmount,
        paymentType: 'Settlement',
        notes: settlementNotes,
        createdBy: data.createdBy || 'Admin'
      });
    }

    return NextResponse.json({ ...updatedSettlement.toObject(), isPreview: false });
  } catch (error: any) {
    console.error('Error updating settlement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage settlements.' }, { status: 403 });
    }
    const tenantId = gate.ctx.user.tenantId!;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: 'Missing employeeId, month, or year' }, { status: 400 });
    }

    await dbConnect();
    await EmployeeSettlement.findOneAndDelete({
      tenantId,
      employeeId,
      month: Number(month),
      year: Number(year),
    });

    // Remove the associated settlement payment record so advances/payments revert to clean state
    await EmployeePayment.findOneAndDelete({
      tenantId,
      employeeId,
      paymentType: 'Settlement',
      notes: `Settlement for ${month}/${year}`,
    });

    return NextResponse.json({ message: 'Settlement reset successfully' });
  } catch (error: any) {
    console.error('Error resetting settlement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
