import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { requireTenant, tenantFilter } from '@/lib/tenant';

const CATEGORIES = ['material', 'labour', 'transport', 'contractor', 'misc'];

async function scopedProject(tenantId: string, projectId: string) {
  const Project = (await import('@/lib/models/Project')).default;
  return Project.findOne(tenantFilter(tenantId, { _id: projectId })).select('_id');
}

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const projectId = new URL(request.url).searchParams.get('projectId');
    const extra = projectId ? { projectId } : {};
    const expenses = await Expense.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('vendorId', 'company')
      .populate('employeeId', 'name')
      .populate('projectId', 'name')
      .sort({ expenseDate: -1 });
    return NextResponse.json({ success: true, expenses });
  } catch (err: unknown) {
    console.error('expenses GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.tenantId;
    delete body.createdBy;
    if (!body.projectId || body.amount === undefined) {
      return NextResponse.json({ error: 'Project and amount are required' }, { status: 400 });
    }
    if (Number(body.amount) < 0) return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 });
    if (body.category !== undefined && !CATEGORIES.includes(String(body.category))) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (!(await scopedProject(gate.ctx.user.tenantId!, body.projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const expense = new Expense({ ...body, tenantId: gate.ctx.user.tenantId, createdBy: gate.ctx.user.id });
    await expense.save();
    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (err: unknown) {
    console.error('expenses POST error:', err);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Expense id is required' }, { status: 400 });
    await dbConnect();
    const deleted = await Expense.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deleted) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('expenses DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
