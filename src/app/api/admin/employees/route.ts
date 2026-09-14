import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { generateNextEmployeeId } from '@/lib/employee-id-utils';

export async function GET(request: Request) {
  try {
    await dbConnect();
    // NOTE: ID backfill migration removed from hot path (was a full-collection
    // scan + writes on every list fetch). Run via script when needed.
    const limitParam = parseInt(new URL(request.url).searchParams.get('limit') || '500', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 1000) : 500;

    const employees = await Employee.find()
      .select('employeeId name phone department role dailyRate standardHours status joiningDate createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json(employees, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data.phone) {
      data.phone = data.phone.replace(/\D/g, '').slice(-10);
    }
    await dbConnect();

    // Auto-generate the next unique Employee ID (AHF-001, AHF-002, ...)
    data.employeeId = await generateNextEmployeeId();

    const newEmployee = await Employee.create(data);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
