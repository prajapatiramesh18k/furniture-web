import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { requireTenant, tenantFilter } from '@/lib/tenant';

const STATUSES = ['todo', 'in_progress', 'done'];

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
    if (projectId && !(await scopedProject(gate.ctx.user.tenantId!, projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const tasks = await Task.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('assignedTo', 'name')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, tasks });
  } catch (err: unknown) {
    console.error('tasks GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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
    if (!body.projectId || !body.title) {
      return NextResponse.json({ error: 'Project and title are required' }, { status: 400 });
    }
    if (!(await scopedProject(gate.ctx.user.tenantId!, body.projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const task = new Task({ ...body, tenantId: gate.ctx.user.tenantId, createdBy: gate.ctx.user.id });
    await task.save();
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: unknown) {
    console.error('tasks POST error:', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    delete patch.tenantId;
    delete patch.createdBy;
    delete patch.projectId;
    if (patch.status !== undefined && !STATUSES.includes(String(patch.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const task = await Task.findOneAndUpdate(tenantFilter(gate.ctx.user.tenantId!, { _id: id }), patch, { new: true });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    console.error('tasks PUT error:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    await dbConnect();
    const deleted = await Task.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('tasks DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
