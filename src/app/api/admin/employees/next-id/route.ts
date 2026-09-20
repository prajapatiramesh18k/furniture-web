import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { generateNextEmployeeId, getTenantEmployeePrefix } from '@/lib/employee-id-utils';
import { requireTenant } from '@/lib/tenant';

/** Preview the next company-wise Employee ID (e.g. PIS-001) for the form. */
export async function GET(request: Request) {
  try {
    const gate = await requireTenant(request as never, 'team');
    if ('error' in gate) return gate.error;
    await dbConnect();
    const [employeeId, prefix] = await Promise.all([
      generateNextEmployeeId(gate.ctx.user.tenantId),
      getTenantEmployeePrefix(gate.ctx.user.tenantId),
    ]);
    return NextResponse.json({ employeeId, prefix }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('next employee id error', e);
    return NextResponse.json({ error: 'Failed to compute next ID' }, { status: 500 });
  }
}
