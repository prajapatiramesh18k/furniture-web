import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import Employee from '@/lib/models/Employee';
import { calculateEarnedDays } from '@/lib/payroll-service';

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

    const attendance = await EmployeeAttendance.find(query).sort({ date: -1 }).populate('employeeId', 'name');
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();

    const employee = await Employee.findById(data.employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const earnedDays = calculateEarnedDays(data.workHours, employee.standardHours);
    data.earnedDays = earnedDays;

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
