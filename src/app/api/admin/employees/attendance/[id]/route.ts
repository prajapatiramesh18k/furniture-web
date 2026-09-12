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
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.workHours !== undefined) {
      const hours = Number(data.workHours);
      updateData.workHours = hours;
      if (attendance.status === 'punched_in') {
        updateData.status = hours > 0 ? 'completed' : 'absent';
        if (!attendance.punchOut) updateData.punchOut = new Date();
      } else if (hours > 0 && (!attendance.status || attendance.status === 'absent')) {
        updateData.status = 'manual';
      } else if (hours === 0 && !data.status) {
        updateData.status = 'absent';
      }

      const employee = await Employee.findById(attendance.employeeId);
      if (employee) {
        updateData.earnedDays = calculateEarnedDays(hours, employee.standardHours);
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
