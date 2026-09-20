import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProgressUpdate from '@/lib/models/ProgressUpdate';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const projectId = new URL(request.url).searchParams.get('projectId');
    const extra = projectId ? { projectId } : {};
    const updates = await ProgressUpdate.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('projectId', 'name')
      .sort({ updateDate: -1 });
    return NextResponse.json({ success: true, updates });
  } catch (err: unknown) {
    console.error('progress GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
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
    if (!body.projectId || (!body.notes && !(body.photos || []).length)) {
      return NextResponse.json({ error: 'Project and a note or photo are required' }, { status: 400 });
    }
    const Project = (await import('@/lib/models/Project')).default;
    if (!(await Project.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: body.projectId })).select('_id'))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const update = new ProgressUpdate({ ...body, tenantId: gate.ctx.user.tenantId, createdBy: gate.ctx.user.id });
    await update.save();
    return NextResponse.json({ success: true, update }, { status: 201 });
  } catch (err: unknown) {
    console.error('progress POST error:', err);
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Update id is required' }, { status: 400 });
    await dbConnect();
    const deleted = await ProgressUpdate.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deleted) return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('progress DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
  }
}
