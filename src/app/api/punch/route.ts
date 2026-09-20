import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import Site from '@/lib/models/Site';
import EmployeeAttendance from '@/lib/models/EmployeeAttendance';
import mongoose from 'mongoose';
import { calculateDistanceMeters, calculateShiftMetrics } from '@/lib/geo-utils';

// Helper to get normalized start & end of day
function getDayBounds(date: Date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Resolve the punch tenant from `?tenant=<slug>`, falling back to the default
 * storefront tenant. Returns null when tenancy isn't set up yet (legacy mode).
 * Punch is a public self-service endpoint (no login), so the tenant comes from
 * the punch page URL — never trust employee/site IDs across tenants.
 */
async function resolvePunchTenantId(searchParams: URLSearchParams): Promise<string | null> {
  try {
    const Tenant = (await import('@/lib/models/Tenant')).default;
    const slug = (searchParams.get('tenant') || '').toLowerCase().trim();
    if (slug) {
      const t = await Tenant.findOne({ slug, status: 'active' }).select('_id').lean();
      if (t) return String(t._id);
      return null;
    }
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
    const t =
      (await Tenant.findOne({ slug: defaultSlug }).select('_id').lean()) ||
      (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).select('_id').lean());
    return t ? String(t._id) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = await resolvePunchTenantId(searchParams);
    const tenantScope = tenantId ? { tenantId } : {};
    const identifier = searchParams.get('identifier') || searchParams.get('employeeId') || searchParams.get('phone');
    const deviceId = searchParams.get('deviceId');
    const deviceName = searchParams.get('deviceName') || 'Mobile Phone';

    let employee = null;

    if (!identifier) {
      if (deviceId) {
        // Auto-detect employee registered to this phone in the database!
        employee = await Employee.findOne({
          ...tenantScope,
          deviceId,
          status: { $regex: /^active$/i },
        });
        if (!employee) {
          return NextResponse.json({ error: 'Please enter your Employee ID to continue.' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Employee ID or phone number is required' }, { status: 400 });
      }
    } else {
      const cleanInput = identifier.trim();
      const { getTenantEmployeePrefix, formatEmployeeId } = await import('@/lib/employee-id-utils');
      const tenantPrefix = tenantId ? await getTenantEmployeePrefix(tenantId) : 'AHF';

      // Escape regex specials in raw input for the direct match.
      const escaped = cleanInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Build search conditions:
      // 1. Direct match on employeeId (e.g. "PIS-001" or "AHF-001", any company prefix)
      const queryConditions: any[] = [
        { employeeId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
      ];

      // 2. If user typed pure digits (e.g. "1" or "001") -> expand with company prefix
      //    plus legacy AHF fallback so old IDs keep working.
      if (/^\d{1,4}$/.test(cleanInput)) {
        const num = parseInt(cleanInput, 10);
        queryConditions.push({ employeeId: formatEmployeeId(num, tenantPrefix) });
        if (tenantPrefix !== 'AHF') queryConditions.push({ employeeId: formatEmployeeId(num, 'AHF') });
      }

      // 3. If user typed "<prefix>-1" (any prefix, e.g. "PIS-1", "AHF-1", with space/dash)
      const prefixNumMatch = cleanInput.match(/^([a-z0-9]{2,5})[- ]?(\d+)$/i);
      if (prefixNumMatch) {
        const num = parseInt(prefixNumMatch[2], 10);
        queryConditions.push({ employeeId: formatEmployeeId(num, prefixNumMatch[1]) });
      }

      // 4. Fallback: match 10-digit mobile number
      const cleanPhone = cleanInput.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        queryConditions.push({ phone: { $regex: cleanPhone } });
      }

      // Find active employee in database
      employee = await Employee.findOne({
        ...tenantScope,
        $or: queryConditions,
        status: { $regex: /^active$/i },
      });

      if (!employee) {
        // Distinguish "no such ID" from "ID exists but deactivated" so the
        // worker gets an actionable message instead of a generic not-found.
        try {
          const inactiveMatch = await Employee.findOne({ ...tenantScope, $or: queryConditions })
            .select('status')
            .lean() as { status?: string } | null;
          if (inactiveMatch) {
            return NextResponse.json({
              error: 'This Employee ID is deactivated. Please contact your supervisor to reactivate it.',
            }, { status: 403 });
          }
        } catch {}
        return NextResponse.json({
          error: `No active employee found with this ID. Please enter your valid Employee ID (e.g. ${formatEmployeeId(1, tenantPrefix)}) or contact your supervisor.`,
        }, { status: 404 });
      }
    }

    // DEVICE LOCK VERIFICATION:
    if (deviceId) {
      // 1. Check if this physical phone is already linked to another active worker
      const otherEmp = await Employee.findOne({
        ...tenantScope,
        deviceId,
        _id: { $ne: employee._id },
        status: { $regex: /^active$/i },
      });

      if (otherEmp) {
        return NextResponse.json({
          error: `Device Locked: This phone is already linked to ${otherEmp.name}. Each worker must punch from their own mobile phone.`,
          deviceConflict: true,
          lockedTo: otherEmp.name,
        }, { status: 403 });
      }

      // 2. Check if this employee is registered on a different phone
      if (employee.deviceId && employee.deviceId !== deviceId) {
        return NextResponse.json({
          error: `Device Mismatch: ${employee.name} is already registered on another phone (${employee.deviceName || 'Registered Phone'}). If you got a new phone, please contact your Admin to reset your device lock.`,
          deviceMismatch: true,
          registeredDevice: employee.deviceName || 'Registered Phone',
        }, { status: 403 });
      }

      // 3. If employee does not have a device linked yet, auto-bind this phone!
      if (!employee.deviceId) {
        employee.deviceId = deviceId;
        employee.deviceName = deviceName;
        employee.deviceRegisteredAt = new Date();
        await employee.save();
      }
    }

    // Check today's attendance
    const { start, end } = getDayBounds();
    const todayAttendance = await EmployeeAttendance.findOne({
      ...(tenantId ? { tenantId } : {}),
      employeeId: employee._id,
      date: { $gte: start, $lte: end },
    }).lean();

    // Fetch active sites
    const activeSites = await Site.find({ ...tenantScope, isActive: true }).select('name clientName address location radiusMeters').lean();

    // Fetch last 7 days history for employee
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const history = await EmployeeAttendance.find({
      ...(tenantId ? { tenantId } : {}),
      employeeId: employee._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 }).lean();

    return NextResponse.json({
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        role: employee.role,
        phone: employee.phone,
        dailyRate: employee.dailyRate,
        standardHours: (employee as any).standardHours || 8,
        deviceId: employee.deviceId,
        deviceName: employee.deviceName,
        deviceRegisteredAt: employee.deviceRegisteredAt,
      },
      todayAttendance,
      activeSites,
      history,
    });
  } catch (err: any) {
    console.error('Error in punch GET:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, employeeId, siteId, latitude, longitude, notes, deviceId, deviceName } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Resolve punch tenant (body.tenant slug or default storefront tenant).
    let punchTenantId: string | null = null;
    try {
      const Tenant = (await import('@/lib/models/Tenant')).default;
      const slug = String(body.tenant || '').toLowerCase().trim();
      const t = slug
        ? await Tenant.findOne({ slug, status: 'active' }).select('_id').lean()
        : (await Tenant.findOne({ slug: process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture' }).select('_id').lean()) ||
          (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).select('_id').lean());
      punchTenantId = t ? String(t._id) : null;
    } catch {}
    const pScope = punchTenantId ? { tenantId: punchTenantId } : {};

    let employee = null;
    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      employee = await Employee.findOne({ _id: employeeId, ...pScope });
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: { $regex: new RegExp(`^${employeeId}$`, 'i') }, ...pScope });
    }
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // DEVICE LOCK VALIDATION ON POST:
    if (deviceId) {
      const otherEmp = await Employee.findOne({
        ...pScope,
        deviceId,
        _id: { $ne: employee._id },
        status: { $regex: /^active$/i },
      });
      if (otherEmp) {
        return NextResponse.json({
          error: `Security Error: This phone is already linked to ${otherEmp.name}. You cannot punch for ${employee.name} from this phone.`,
        }, { status: 403 });
      }

      if (employee.deviceId && employee.deviceId !== deviceId) {
        return NextResponse.json({
          error: `Security Error: ${employee.name} is registered on another phone (${employee.deviceName || 'Registered Phone'}). Please punch from your own registered phone.`,
        }, { status: 403 });
      }

      if (!employee.deviceId) {
        employee.deviceId = deviceId;
        employee.deviceName = deviceName || 'Mobile Phone';
        employee.deviceRegisteredAt = new Date();
        await employee.save();
      }
    }

    const { start, end } = getDayBounds();
    const todayAttendance = await EmployeeAttendance.findOne({
      ...(punchTenantId ? { tenantId: punchTenantId } : {}),
      employeeId,
      date: { $gte: start, $lte: end },
    });

    if (action === 'punch-in') {
      if (!siteId) {
        return NextResponse.json({ error: 'Please select a job site' }, { status: 400 });
      }
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json({ error: 'GPS location is required to punch in' }, { status: 400 });
      }

      const site = await Site.findOne({ _id: siteId, ...pScope });
      if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
      }
      // Cross-tenant guard: site must belong to the employee's company.
      if (employee.tenantId && site.tenantId && String(employee.tenantId) !== String(site.tenantId)) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
      }
      // Properties without GPS coordinates cannot enforce a geofence.
      if (site.location?.latitude == null || site.location?.longitude == null) {
        return NextResponse.json({ error: `"${site.name}" has no GPS coordinates set. Ask your admin to add the site location before punching in.` }, { status: 400 });
      }

      // Calculate distance between employee GPS and site coordinates
      const distance = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        site.location.latitude,
        site.location.longitude
      );

      const allowedRadius = site.radiusMeters || 200;
      if (distance > allowedRadius) {
        return NextResponse.json({
          error: `You are outside the site boundary (${distance}m away). You must be within ${allowedRadius}m of "${site.name}" to punch in.`,
          distanceMeters: distance,
          allowedRadius,
          isWithinRadius: false,
        }, { status: 400 });
      }

      // Check if already punched in
      if (todayAttendance) {
        if (todayAttendance.status === 'punched_in') {
          return NextResponse.json({
            error: `Already punched in today at ${new Date(todayAttendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            attendance: todayAttendance,
          }, { status: 400 });
        }
        if (todayAttendance.status === 'completed') {
          return NextResponse.json({
            error: 'You have already completed your shift for today.',
            attendance: todayAttendance,
          }, { status: 400 });
        }
      }

      // Create new attendance record
      const punchRecord = await EmployeeAttendance.create({
        tenantId: employee.tenantId || punchTenantId || null,
        employeeId,
        date: start,
        siteId: site._id,
        siteName: site.name,
        punchIn: new Date(),
        punchInLocation: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          distanceMeters: distance,
        },
        punchInDeviceId: deviceId || null,
        status: 'punched_in',
        workHours: 0,
        earnedDays: 0,
        notes: notes || '',
      });

      return NextResponse.json({
        message: `Successfully punched in at ${site.name}!`,
        attendance: punchRecord,
        distanceMeters: distance,
      }, { status: 201 });
    }

    if (action === 'punch-out') {
      if (!todayAttendance || todayAttendance.status !== 'punched_in') {
        return NextResponse.json({
          error: 'No active punch-in found for today. Please punch in first.',
        }, { status: 400 });
      }

      const punchInTime = new Date(todayAttendance.punchIn);
      const punchOutTime = new Date();

      // Calculate distance if site & coordinates available
      let distance = 0;
      if (todayAttendance.siteId && latitude !== undefined && longitude !== undefined) {
        const site = await Site.findOne({ _id: todayAttendance.siteId, ...pScope });
        if (site && site.location?.latitude != null && site.location?.longitude != null) {
          distance = calculateDistanceMeters(
            Number(latitude),
            Number(longitude),
            site.location.latitude,
            site.location.longitude
          );
        }
      }

      const standardHours = (employee as any).standardHours || 8;
      const metrics = calculateShiftMetrics(punchInTime, punchOutTime, standardHours);

      todayAttendance.punchOut = punchOutTime;
      todayAttendance.punchOutLocation = {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        distanceMeters: distance,
      };
      todayAttendance.punchOutDeviceId = deviceId || null;
      todayAttendance.workHours = metrics.workHours;
      todayAttendance.earnedDays = metrics.earnedDays;
      todayAttendance.overtimeHours = metrics.overtimeHours;
      todayAttendance.status = 'completed';
      if (notes) {
        todayAttendance.notes = todayAttendance.notes ? `${todayAttendance.notes} | ${notes}` : notes;
      }

      await todayAttendance.save();

      return NextResponse.json({
        message: `Successfully punched out! Total hours worked: ${metrics.workHours} hrs (${metrics.earnedDays} days).`,
        attendance: todayAttendance,
        metrics,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "punch-in" or "punch-out".' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in punch POST:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
