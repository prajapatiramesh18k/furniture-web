import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { generateNextEmployeeId } from '@/lib/employee-id-utils';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    await dbConnect();
    // NOTE: ID backfill migration removed from hot path (was a full-collection
    // scan + writes on every list fetch). Run via script when needed.
    const limitParam = parseInt(new URL(request.url).searchParams.get('limit') || '500', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 1000) : 500;

    const employees = await Employee.find(tenantFilter(gate.ctx.user.tenantId!))
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
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    const data = await request.json();
    delete data.tenantId;
    if (data.phone) {
      data.phone = data.phone.replace(/\D/g, '').slice(-10);
    }
    await dbConnect();

    // Auto-generate the next unique company-wise Employee ID (AHF-001, PIS-001, ...)
    data.tenantId = gate.ctx.user.tenantId;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      data.employeeId = await generateNextEmployeeId(gate.ctx.user.tenantId);
      try {
        const newEmployee = await Employee.create(data);
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'employee.create', 'Employee', String(newEmployee._id), { name: newEmployee.name });
        return NextResponse.json(newEmployee, { status: 201 });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('E11000') || msg.includes('duplicate key')) {
          lastErr = e;
          continue; // ID race — regenerate and retry
        }
        throw e;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('Could not generate unique employee ID');
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
