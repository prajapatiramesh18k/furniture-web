import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { id } = await params;
    await dbConnect();
    const employee = await Employee.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import EmployeeSettlement from '@/lib/models/EmployeeSettlement';
import EmployeePayment from '@/lib/models/EmployeePayment';
import { calculateMonthlyPayroll } from '@/lib/payroll-service';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { id } = await params;
    const data = await request.json();
    if (data._id) delete data._id;
    if (data.tenantId) delete data.tenantId;
    if (data.employeeId) delete data.employeeId; // ID is read-only and immutable after creation
    if (data.phone) {
      data.phone = data.phone.replace(/\D/g, '').slice(-10);
    }
    await dbConnect();
    const updatedEmployee = await Employee.findOneAndUpdate(
      tenantFilter(gate.ctx.user.tenantId!, { _id: id }),
      { $set: data },
      { new: true, runValidators: false }
    );
    if (!updatedEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'employee.update', 'Employee', id, { fields: Object.keys(data) });

    // If dailyRate was updated, automatically synchronize the current month's payroll settlement
    if (data.dailyRate !== undefined && Number(data.dailyRate) > 0) {
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const existingSettlement = await EmployeeSettlement.findOne({
          tenantId: gate.ctx.user.tenantId,
          employeeId: id,
          month: currentMonth,
          year: currentYear,
        });

        if (existingSettlement) {
          const newRate = Number(data.dailyRate);
          const calc = await calculateMonthlyPayroll(id, newRate, currentMonth, currentYear);
          existingSettlement.dailyRate = newRate;
          existingSettlement.totalWorkHours = calc.totalWorkHours;
          existingSettlement.totalEarnedDays = calc.totalEarnedDays;
          existingSettlement.grossAmount = calc.grossAmount;
          existingSettlement.totalPaid = calc.totalPaid;
          existingSettlement.balanceAmount = calc.balanceAmount;
          existingSettlement.settlementAmount = calc.balanceAmount;
          await existingSettlement.save();

          const settlementNotes = `Settlement for ${currentMonth}/${currentYear}`;
          const existingPayment = await EmployeePayment.findOne({
            tenantId: gate.ctx.user.tenantId,
            employeeId: id,
            paymentType: 'Settlement',
            notes: settlementNotes,
          });
          if (existingPayment) {
            existingPayment.amount = calc.balanceAmount;
            await existingPayment.save();
          }
        }
      } catch (syncErr) {
        console.error('Error synchronizing settlement on dailyRate update:', syncErr);
      }
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const { id } = await params;
    await dbConnect();
    const deletedEmployee = await Employee.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deletedEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'employee.delete', 'Employee', id, {});
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
