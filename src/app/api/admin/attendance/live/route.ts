import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import Site from '@/lib/models/Site';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const siteId = searchParams.get('siteId');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all active employees
    const employees = await Employee.find({ status: { $regex: /^active$/i } })
      .select('employeeId name department role phone dailyRate standardHours deviceId deviceName deviceRegisteredAt')
      .sort({ name: 1 })
      .lean();

    // Query today's attendance
    const attendanceQuery: any = {
      date: { $gte: startOfDay, $lte: endOfDay },
    };
    if (siteId) {
      attendanceQuery.siteId = siteId;
    }

    const attendanceRecords = await EmployeeAttendance.find(attendanceQuery)
      .populate('siteId', 'name address location radiusMeters')
      .lean();

    const attendanceMap = new Map();
    for (const record of attendanceRecords) {
      attendanceMap.set(record.employeeId.toString(), record);
    }

    const now = new Date();
    let currentlyWorkingCount = 0;
    let completedCount = 0;
    let absentCount = 0;

    const liveList = employees.map(emp => {
      const att = attendanceMap.get(emp._id.toString());
      if (!att) {
        absentCount++;
        return {
          employee: emp,
          attendance: null,
          status: 'absent',
          siteName: '—',
          punchIn: null,
          punchOut: null,
          workHours: 0,
          earnedDays: 0,
          elapsedMinutes: 0,
        };
      }

      let elapsedMinutes = 0;
      const effectiveStatus = att.status || (att.workHours > 0 ? 'completed' : 'absent');

      if (effectiveStatus === 'punched_in' && att.punchIn) {
        currentlyWorkingCount++;
        elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(att.punchIn).getTime()) / (1000 * 60)));
      } else if (effectiveStatus === 'completed') {
        completedCount++;
      } else {
        absentCount++;
      }

      return {
        employee: emp,
        attendance: att,
        status: effectiveStatus,
        siteName: att.siteName || (att.siteId as any)?.name || 'Manual Entry',
        punchIn: att.punchIn || null,
        punchOut: att.punchOut || null,
        workHours: att.workHours || 0,
        earnedDays: att.earnedDays || 0,
        overtimeHours: att.overtimeHours || 0,
        elapsedMinutes,
      };
    });

    // Fetch active sites list for filter dropdown
    const sites = await Site.find({ isActive: true }).select('name address').lean();

    return NextResponse.json({
      summary: {
        totalEmployees: employees.length,
        currentlyWorking: currentlyWorkingCount,
        completedToday: completedCount,
        absent: absentCount,
      },
      date: startOfDay,
      records: liveList,
      sites,
    });
  } catch (err: any) {
    console.error('Error in live attendance API:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch live attendance' }, { status: 500 });
  }
}
