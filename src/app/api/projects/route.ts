import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

const STATUSES = ['planning', 'design', 'procurement', 'execution', 'finishing', 'completed', 'on_hold', 'cancelled'];

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const params = new URL(request.url).searchParams;
    const id = params.get('id');
    if (id) {
      const project = await Project.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }))
        .populate('managerId', 'name')
        .populate('supervisorId', 'name')
        .populate('siteId', 'name address');
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      return NextResponse.json({ success: true, project });
    }
    const status = params.get('status');
    const extra = status && STATUSES.includes(status) ? { status } : {};
    const projects = await Project.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('managerId', 'name')
      .populate('supervisorId', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, projects });
  } catch (err: unknown) {
    console.error('projects GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    if (!body.name || !body.customer?.name) {
      return NextResponse.json({ error: 'Project name and customer name are required' }, { status: 400 });
    }
    if (body.status !== undefined && !STATUSES.includes(String(body.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const project = new Project({ ...body, tenantId: gate.ctx.user.tenantId, createdBy: gate.ctx.user.id });
    await project.save();
    try {
      if (gate.ctx.user.tenantId) {
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'project.create', 'Project', String(project._id), {
          name: body.name,
        });
      }
    } catch {}
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err: unknown) {
    console.error('projects POST error:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    delete patch.tenantId;
    delete patch.createdBy;
    delete patch.quotationId;
    if (patch.status !== undefined && !STATUSES.includes(String(patch.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const project = await Project.findOneAndUpdate(tenantFilter(gate.ctx.user.tenantId!, { _id: id }), patch, { new: true });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, project });
  } catch (err: unknown) {
    console.error('projects PUT error:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
