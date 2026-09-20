import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import Employee from '@/lib/models/Employee';
import { calculateEarnedDays } from '@/lib/payroll-service';
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
    // If an employee filter is given, verify it belongs to this tenant.
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
    const attendance = await EmployeeAttendance.find(query)
      .select('employeeId date siteId siteName status workHours earnedDays overtimeHours notes punchIn punchOut createdAt')
      .sort({ date: -1 })
      .limit(500)
      .lean();
    return NextResponse.json(attendance, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const data = await request.json();
    delete data.tenantId;
    await dbConnect();

    const employee = await Employee.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: data.employeeId }));
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    data.tenantId = gate.ctx.user.tenantId;

    const earnedDays = calculateEarnedDays(data.workHours, employee.standardHours);
    data.earnedDays = earnedDays;
    if (!data.status) {
      data.status = Number(data.workHours) > 0 ? 'manual' : 'absent';
    }

    const targetDate = new Date(data.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if an attendance record already exists for this employee on this date
    const existing = await EmployeeAttendance.findOne({
      tenantId: gate.ctx.user.tenantId,
      employeeId: data.employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      existing.workHours = Number(data.workHours);
      existing.earnedDays = earnedDays;
      if (data.notes !== undefined) existing.notes = data.notes;
      existing.status = data.status || (Number(data.workHours) > 0 ? 'manual' : 'absent');
      await existing.save();
      return NextResponse.json(existing, { status: 200 });
    }

    const newAttendance = await EmployeeAttendance.create(data);
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error: any) {
    console.error('Error creating attendance:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Attendance already exists for this date' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
