import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import Site from '@/lib/models/Site';
import { requireTenant, tenantFilter } from '@/lib/tenant';

// Collapse concurrent 30s polls into one DB hit per 10s window.
const liveCache = new Map<string, { data: unknown; expire: number }>();
const LIVE_TTL = 10_000;

export async function GET(req: Request) {
  try {
    const gate = await requireTenant(req as never, 'team');
    if ('error' in gate) return gate.error;
    const tenantId = gate.ctx.user.tenantId!;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const siteId = searchParams.get('siteId');
    const cacheKey = `live:${tenantId}:${dateParam || 'today'}:${siteId || 'all'}`;
    const hit = liveCache.get(cacheKey);
    if (hit && hit.expire > Date.now()) {
      return NextResponse.json(hit.data, { headers: { 'Cache-Control': 'no-store' } });
    }

    await dbConnect();

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all active employees + today's attendance + sites in parallel.
    // No populate: siteName is stored on the record; sites list is fetched once.
    const attendanceQuery: Record<string, unknown> = {
      ...tenantFilter(tenantId),
      date: { $gte: startOfDay, $lte: endOfDay },
    };
    if (siteId) {
      attendanceQuery.siteId = siteId;
    }

    const [employees, attendanceRecords, sites] = await Promise.all([
      Employee.find({ ...tenantFilter(tenantId), status: 'Active' })
        .select('employeeId name department role phone dailyRate standardHours deviceId deviceName')
        .sort({ name: 1 })
        .limit(1000)
        .lean(),
      EmployeeAttendance.find(attendanceQuery)
        .select('employeeId date siteId siteName status workHours earnedDays overtimeHours punchIn punchOut notes')
        .limit(2000)
        .lean(),
      Site.find({ ...tenantFilter(tenantId), isActive: true }).select('name address').limit(500).lean(),
    ]);

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

    const payload = {
      summary: {
        totalEmployees: employees.length,
        currentlyWorking: currentlyWorkingCount,
        completedToday: completedCount,
        absent: absentCount,
      },
      date: startOfDay,
      records: liveList,
      sites,
    };
    liveCache.set(cacheKey, { data: payload, expire: Date.now() + LIVE_TTL });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    console.error('Error in live attendance API:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch live attendance' }, { status: 500 });
  }
}
