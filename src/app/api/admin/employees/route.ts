import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { ensureAllEmployeesHaveIds, generateNextEmployeeId } from '@/lib/employee-id-utils';

export async function GET() {
  try {
    await dbConnect();
    // Safely ensure all existing employees have a unique sequential ID
    await ensureAllEmployeesHaveIds();

    const employees = await Employee.find().sort({ createdAt: -1 });
    return NextResponse.json(employees);
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
