import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import Employee from '@/lib/models/Employee';
import { calculateEarnedDays } from '@/lib/payroll-service';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();

    const attendance = await EmployeeAttendance.findById(id);
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    // Build update object with only the fields we want to change
    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.workHours !== undefined) updateData.workHours = data.workHours;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Recalculate earned days if workHours is provided
    if (data.workHours !== undefined) {
      const employee = await Employee.findById(attendance.employeeId);
      if (employee) {
        updateData.earnedDays = calculateEarnedDays(data.workHours, employee.standardHours);
      }
    }

    const updatedAttendance = await EmployeeAttendance.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deletedAttendance = await EmployeeAttendance.findByIdAndDelete(id);
    if (!deletedAttendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
