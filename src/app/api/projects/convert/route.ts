import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';
import { createProjectFromQuotation } from '@/lib/project-from-quotation';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

/**
 * Convert an APPROVED quotation into a project.
 * Snapshots customer + budget so later quotation edits never rewrite history.
 * Multi-trade quotations carry categories as work packages (see project-from-quotation).
 * Idempotent: returns the existing project with 409 + alreadyExists when linked.
 */
export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const { quotationId, siteId } = await request.json();
    if (!quotationId) return NextResponse.json({ error: 'Quotation id is required' }, { status: 400 });

    const quotation = await Quotation.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: quotationId })).lean();
    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    const q = quotation as Record<string, unknown>;
    if (String(q.status || 'sent') !== 'approved') {
      return NextResponse.json({ error: 'Only approved quotations can become projects' }, { status: 400 });
    }

    const { projectId, created } = await createProjectFromQuotation(
      { ...(q as object), _id: (quotation as { _id: unknown })._id },
      { tenantId: gate.ctx.user.tenantId, userId: gate.ctx.user.id, siteId: siteId || null, auditEmail: gate.ctx.user.email },
    );
    if (!created) {
      return NextResponse.json({ message: 'This quotation is already linked to a project — no duplicate was created.', projectId, alreadyExists: true }, { status: 409 });
    }

    try {
      if (gate.ctx.user.tenantId) {
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'project.convert', 'Project', projectId, {
          quotationId: String(quotationId),
          quoteNo: String(((q.project || {}) as { quoteNo?: string }).quoteNo || ''),
        });
      }
    } catch {}
    return NextResponse.json({ success: true, projectId }, { status: 201 });
  } catch (err: unknown) {
    console.error('projects/convert error:', err);
    return NextResponse.json({ error: 'Failed to convert quotation' }, { status: 500 });
  }
}
