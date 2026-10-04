import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import ProjectPayment from '@/lib/models/ProjectPayment';
import Invoice from '@/lib/models/Invoice';
import Project from '@/lib/models/Project';
import { requireTenant, tenantFilter } from '@/lib/tenant';

/** Re-sum an invoice's payments and derive its status (aggregation, no full fetch). */
async function refreshInvoice(tenantId: string, invoiceId: string) {
  const invoice = await Invoice.findOne(tenantFilter(tenantId, { _id: invoiceId })).select('total status');
  if (!invoice) return null;
  const rows = await ProjectPayment.aggregate([
    { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), invoiceId: new mongoose.Types.ObjectId(invoiceId) } },
    { $group: { _id: null, paid: { $sum: '$amount' } } },
  ]);
  const paid = (rows as { paid?: number }[])[0]?.paid || 0;
  const nextStatus =
    String(invoice.status) === 'cancelled'
      ? 'cancelled'
      : paid >= invoice.total && invoice.total > 0
        ? 'paid'
        : paid > 0
          ? 'partial'
          : 'sent';
  await Invoice.updateOne({ _id: invoice._id }, { $set: { paidTotal: paid, status: nextStatus } });
  invoice.paidTotal = paid;
  invoice.status = nextStatus;
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
    // Project + invoice existence checks run in parallel (was sequential).
    const [project, invDoc] = await Promise.all([
      Project.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: body.projectId })).select('_id').lean(),
      body.invoiceId
        ? Invoice.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: body.invoiceId })).select('projectId').lean()
        : Promise.resolve(null),
    ]);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (body.invoiceId) {
      if (!invDoc) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      if (String((invDoc as { projectId?: unknown }).projectId) !== String(body.projectId)) {
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
