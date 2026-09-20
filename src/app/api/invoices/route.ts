import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Counter from '@/lib/models/Counter';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

const STATUSES = ['draft', 'sent', 'partial', 'paid', 'cancelled'];

async function scopedProject(tenantId: string, projectId: string) {
  const Project = (await import('@/lib/models/Project')).default;
  return Project.findOne(tenantFilter(tenantId, { _id: projectId })).select('_id');
}

async function nextInvoiceNo(tenantId: string): Promise<string> {
  const result = await Counter.findByIdAndUpdate(
    `invoice:${tenantId}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  const number = (result as { seq?: number } | null)?.seq ?? 1;
  return `INV-${String(number).padStart(6, '0')}`;
}

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const projectId = new URL(request.url).searchParams.get('projectId');
    const extra = projectId ? { projectId } : {};
    const invoices = await Invoice.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, invoices });
  } catch (err: unknown) {
    console.error('invoices GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
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
    delete body.paidTotal;
    delete body.status;
    if (!body.projectId || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Project and at least one item are required' }, { status: 400 });
    }
    if (!(await scopedProject(gate.ctx.user.tenantId!, body.projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const items = body.items.map((it: { name?: string; quantity?: number; rate?: number }) => {
      const quantity = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
      const rate = Number(it.rate) > 0 ? Number(it.rate) : 0;
      return { name: String(it.name || 'Item'), quantity, rate, amount: quantity * rate };
    });
    const subtotal = items.reduce((s: number, it: { amount: number }) => s + it.amount, 0);
    const discount = Math.min(Math.max(Number(body.discount) || 0, 0), subtotal);
    const gst = Math.max(Number(body.gst) || 0, 0);
    const total = subtotal - discount + gst;
    const t = gate.ctx.tenant;

    const invoice = new Invoice({
      projectId: body.projectId,
      quotationId: body.quotationId || null,
      invoiceNo: await nextInvoiceNo(gate.ctx.user.tenantId!),
      items,
      subtotal,
      discount,
      gst,
      total,
      paidTotal: 0,
      status: 'draft',
      dueDate: body.dueDate || null,
      notes: body.notes || '',
      company: {
        name: t?.name || '',
        address: t?.address || '',
        phone: t?.phone || '',
        email: t?.email || '',
        gstNumber: t?.gstNumber || '',
        logo: t?.logo || '',
        website: '',
      },
      tenantId: gate.ctx.user.tenantId,
      createdBy: gate.ctx.user.id,
    });
    await invoice.save();
    try {
      if (gate.ctx.user.tenantId) {
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'invoice.create', 'Invoice', String(invoice._id), {
          invoiceNo: invoice.invoiceNo,
          total,
        });
      }
    } catch {}
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err: unknown) {
    console.error('invoices POST error:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Invoice id is required' }, { status: 400 });
    delete patch.tenantId;
    delete patch.createdBy;
    delete patch.paidTotal;
    delete patch.invoiceNo;
    delete patch.projectId;
    if (patch.status !== undefined && !STATUSES.includes(String(patch.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const existing = await Invoice.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!existing) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    // Money already collected freezes the money fields — cancel/re-issue instead.
    if (existing.paidTotal > 0 && (patch.items !== undefined || patch.total !== undefined)) {
      return NextResponse.json({ error: 'Invoice has payments — cancel and re-issue to change amounts' }, { status: 400 });
    }
    if (patch.items !== undefined) {
      const items = (patch.items as { name?: string; quantity?: number; rate?: number }[]).map((it) => {
        const quantity = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
        const rate = Number(it.rate) > 0 ? Number(it.rate) : 0;
        return { name: String(it.name || 'Item'), quantity, rate, amount: quantity * rate };
      });
      const subtotal = items.reduce((s: number, it: { amount: number }) => s + it.amount, 0);
      const discount = Math.min(Math.max(Number(patch.discount ?? existing.discount) || 0, 0), subtotal);
      const gst = Math.max(Number(patch.gst ?? existing.gst) || 0, 0);
      patch.items = items;
      patch.subtotal = subtotal;
      patch.discount = discount;
      patch.gst = gst;
      patch.total = subtotal - discount + gst;
    }
    Object.assign(existing, patch);
    await existing.save();
    return NextResponse.json({ success: true, invoice: existing });
  } catch (err: unknown) {
    console.error('invoices PUT error:', err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
