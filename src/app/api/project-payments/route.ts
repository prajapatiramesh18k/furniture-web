import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectPayment from '@/lib/models/ProjectPayment';
import Invoice from '@/lib/models/Invoice';
import { requireTenant, tenantFilter } from '@/lib/tenant';

/** Re-sum an invoice's payments and derive its status. */
async function refreshInvoice(tenantId: string, invoiceId: string) {
  const invoice = await Invoice.findOne(tenantFilter(tenantId, { _id: invoiceId }));
  if (!invoice) return null;
  const payments = await ProjectPayment.find(tenantFilter(tenantId, { invoiceId })).select('amount').lean();
  const paid = payments.reduce((s: number, p: { amount: number }) => s + (Number(p.amount) || 0), 0);
  invoice.paidTotal = paid;
  if (String(invoice.status) !== 'cancelled') {
    invoice.status = paid >= invoice.total && invoice.total > 0 ? 'paid' : paid > 0 ? 'partial' : 'sent';
  }
  await invoice.save();
  return invoice;
}

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const projectId = new URL(request.url).searchParams.get('projectId');
    const extra = projectId ? { projectId } : {};
    const payments = await ProjectPayment.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('invoiceId', 'invoiceNo')
      .populate('projectId', 'name')
      .sort({ paymentDate: -1 });
    return NextResponse.json({ success: true, payments });
  } catch (err: unknown) {
    console.error('payments GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.tenantId;
    delete body.receivedBy;
    if (!body.projectId || body.amount === undefined) {
      return NextResponse.json({ error: 'Project and amount are required' }, { status: 400 });
    }
    if (Number(body.amount) <= 0) return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    const Project = (await import('@/lib/models/Project')).default;
    if (!(await Project.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: body.projectId })).select('_id'))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (body.invoiceId) {
      const invDoc = await Invoice.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: body.invoiceId }));
      if (!invDoc) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      if (String(invDoc.projectId) !== String(body.projectId)) {
        return NextResponse.json({ error: 'Invoice belongs to a different project' }, { status: 400 });
      }
    }
    const payment = new ProjectPayment({
      ...body,
      tenantId: gate.ctx.user.tenantId,
      receivedBy: gate.ctx.user.id,
    });
    await payment.save();
    let invoice = null;
    if (body.invoiceId) invoice = await refreshInvoice(gate.ctx.user.tenantId!, body.invoiceId);
    return NextResponse.json({ success: true, payment, invoice }, { status: 201 });
  } catch (err: unknown) {
    console.error('payments POST error:', err);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Payment id is required' }, { status: 400 });
    await dbConnect();
    const existing = await ProjectPayment.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!existing) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    const invoiceId = existing.invoiceId ? String(existing.invoiceId) : null;
    await existing.deleteOne();
    let invoice = null;
    if (invoiceId) invoice = await refreshInvoice(gate.ctx.user.tenantId!, invoiceId);
    return NextResponse.json({ success: true, invoice });
  } catch (err: unknown) {
    console.error('payments DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
