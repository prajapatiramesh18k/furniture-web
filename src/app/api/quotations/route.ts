import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/lib/models/Quotation";
import { requireTenant, tenantFilter, writeAudit } from "@/lib/tenant";

// Lead-pipeline sync: never overwrite a closed lead.
const CLOSED_LEAD = ['won', 'lost', 'converted'];

async function syncLeadStatus(tenantId: string, leadId: unknown, to: 'quotation' | 'won') {
  try {
    const id = String(leadId || '');
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return;
    const Contact = (await import('@/models/Contact')).default;
    const lead = await Contact.findOne({ _id: id, tenantId }).select('status').lean() as { status?: string } | null;
    if (!lead || CLOSED_LEAD.includes(String(lead.status || ''))) return;
    await Contact.updateOne({ _id: id, tenantId }, { $set: { status: to } });
  } catch (e) {
    console.error('lead sync failed', e);
  }
}

// Resolve the source lead for a new/edited quotation: explicit leadId wins,
// otherwise follow the site visit's leadId.
async function resolveLeadId(tenantId: string | null, body: { leadId?: unknown; visitId?: unknown }) {
  try {
    if (body.leadId && /^[0-9a-fA-F]{24}$/.test(String(body.leadId))) return String(body.leadId);
    if (body.visitId && /^[0-9a-fA-F]{24}$/.test(String(body.visitId))) {
      await dbConnect();
      const SiteVisit = (await import('@/lib/models/SiteVisit')).default;
      const v = await SiteVisit.findOne(
        tenantId ? { _id: body.visitId, tenantId } : { _id: body.visitId },
      ).select('leadId').lean() as { leadId?: unknown } | null;
      const lid = v?.leadId && typeof v.leadId === 'object' && '_id' in (v.leadId as object)
        ? String((v.leadId as { _id: unknown })._id)
        : String(v?.leadId || '');
      if (/^[0-9a-fA-F]{24}$/.test(lid)) return lid;
    }
  } catch (e) {
    console.error('lead resolve failed', e);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Quotations can be created from the logged-in portal (tenant-scoped) or the
    // public quotation-maker (attached to the default storefront tenant).
    let tenantId: string | null = null;
    let createdBy: string | null = null;
    try {
      const gate = await requireTenant(request, 'quotations');
      if (!('error' in gate) && !gate.ctx.user.isSuperAdmin) {
        tenantId = gate.ctx.user.tenantId;
        createdBy = gate.ctx.user.id;
      }
    } catch {}
    if (!tenantId) {
      await dbConnect();
      const Tenant = (await import('@/lib/models/Tenant')).default;
      const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
      const t = (await Tenant.findOne({ slug: defaultSlug }).lean()) || (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).lean());
      tenantId = t ? String(t._id) : null;
    }
    await dbConnect();
    const body = await request.json();
    // Never trust tenantId from the client.
    delete body.tenantId;
    delete body.createdBy;
    // Validate department; legacy furniture payloads have none (default applies).
    const DEPARTMENTS = ['furniture', 'electrical', 'plumbing', 'interior', 'construction', 'painting', 'software', 'general', 'custom'];
    if (body.department !== undefined && !DEPARTMENTS.includes(String(body.department))) {
      return NextResponse.json({ error: 'Unknown department' }, { status: 400 });
    }
    // Multi-trade payload: validate categories when mode === 'multi'.
    if (body.mode !== undefined && !['single', 'multi'].includes(String(body.mode))) {
      return NextResponse.json({ error: 'Unknown quotation mode' }, { status: 400 });
    }
    if (String(body.mode || 'single') === 'multi') {
      if (!Array.isArray(body.categories) || body.categories.length === 0) {
        return NextResponse.json({ error: 'Multi-trade quotations need at least one work category' }, { status: 400 });
      }
      for (const c of body.categories) {
        if (!c || typeof c.key !== 'string' || !c.key.trim() || typeof c.label !== 'string' || !c.label.trim()) {
          return NextResponse.json({ error: 'Each work category needs a label' }, { status: 400 });
        }
      }
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json({ error: 'Add at least one line item' }, { status: 400 });
      }
    }
    // New quotations start as draft/sent only — approval happens via PUT.
    if (body.status !== undefined && !['draft', 'sent'].includes(String(body.status))) {
      return NextResponse.json({ error: 'New quotations must start as draft or sent' }, { status: 400 });
    }
    if (body.status === undefined) body.status = 'sent';

    // Consume the next quotation number atomically — only on actual save,
    // so refresh/preview never burns a number.
    try {
      const Counter = (await import('@/lib/models/Counter')).default;
      let prefix = 'Q';
      if (tenantId) {
        try {
          const Tenant = (await import('@/lib/models/Tenant')).default;
          const t = await Tenant.findById(tenantId).select('quotationPrefix').lean() as { quotationPrefix?: string } | null;
          if (t?.quotationPrefix) prefix = t.quotationPrefix;
        } catch {}
      }
      const key = tenantId ? `quotation:${tenantId}` : 'quotation';
      const result = await Counter.findByIdAndUpdate(
        key,
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean() as { seq?: number } | null;
      const number = result?.seq ?? 1;
      const assigned = `${prefix}-${String(number).padStart(6, '0')}`;
      if (!body.project || typeof body.project !== 'object') body.project = {};
      body.project.quoteNo = assigned;
    } catch (e) {
      console.error('quotation number assign failed', e);
    }

    // Link the source lead (explicit leadId, or via the site visit) so the
    // lead pipeline follows automatically: create → 'quotation'.
    const linkedLeadId = await resolveLeadId(tenantId, body);
    if (linkedLeadId) body.leadId = linkedLeadId;
    delete body.visitId;

    const newQuotation = new Quotation({ ...body, tenantId, createdBy });
    // Attach issuing-company snapshot so generated PDFs use the tenant's branding.
    try {
      if (tenantId) {
        const Tenant = (await import('@/lib/models/Tenant')).default;
        const t = await Tenant.findById(tenantId).lean();
        if (t) {
          newQuotation.company = {
            name: t.name || '',
            address: t.address || '',
            phone: t.phone || '',
            email: t.email || '',
            gstNumber: t.gstNumber || '',
            logo: t.logo || '',
            website: t.website || '',
          };
        }
      }
    } catch {}
    await newQuotation.save();
    if (tenantId) {
      await writeAudit(tenantId, createdBy, '', 'quotation.create', 'Quotation', String(newQuotation._id), {
        quoteNo: body?.project?.quoteNo,
      });
    }
    // A newly made quotation moves its source lead to 'quotation'.
    if (tenantId && linkedLeadId) {
      await syncLeadStatus(tenantId, linkedLeadId, 'quotation');
    }

    return NextResponse.json(
      { success: true, quotation: newQuotation },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error saving quotation:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save quotation" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Tenant-scoped: user can only list their own company's quotations.
    const gate = await requireTenant(request, 'quotations');
    if ('error' in gate) return gate.error;
    if (gate.ctx.user.isSuperAdmin && !gate.ctx.user.tenantId) {
      return NextResponse.json({ error: 'Super admin: open a tenant context to view quotations.' }, { status: 400 });
    }

    await dbConnect();

    // Privacy: owner/admin see every company quotation; manager/staff see only
    // quotations they created (so e.g. Rahul Mehta + the creating manager see it,
    // other members do not). Legacy rows without createdBy stay owner/admin-only.
    const role = String(gate.ctx.user.role || '');
    const canSeeAll = gate.ctx.user.isSuperAdmin || role === 'owner' || role === 'admin';
    const filter = canSeeAll
      ? tenantFilter(gate.ctx.user.tenantId!)
      : tenantFilter(gate.ctx.user.tenantId!, { createdBy: gate.ctx.user.id });

    const url = new URL(request.url);
    const singleId = url.searchParams.get('id');
    if (singleId) {
      const one = await Quotation.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: singleId }));
      if (!one) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      return NextResponse.json({ success: true, quotation: one });
    }

    // Fetch tenant quotations, latest activity first (recently decided quotes surface on top)
    const quotations = await Quotation.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, quotations });
  } catch (error: any) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireTenant(request, 'quotations');
  if ('error' in gate) return gate.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Quotation id is required' }, { status: 400 });
    }
    await dbConnect();
    // Verify record belongs to current tenant before deleting.
    const existing = await Quotation.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!existing) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    // Privacy: manager/staff can delete only their own quotations.
    const role = String(gate.ctx.user.role || '');
    const canDeleteAll = gate.ctx.user.isSuperAdmin || role === 'owner' || role === 'admin';
    if (!canDeleteAll && String(existing.createdBy || '') !== String(gate.ctx.user.id)) {
      return NextResponse.json({ error: 'You can only delete quotations you created.' }, { status: 403 });
    }
    const deleted = await Quotation.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deleted) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'quotation.delete', 'Quotation', id, {});
    return NextResponse.json({ success: true, message: 'Quotation deleted' });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete quotation' },
      { status: 500 },
    );
  }
}

const STATUS_FLOW: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['draft', 'approved', 'rejected'],
  approved: ['sent'],
  rejected: ['sent'],
};

/**
 * Approval lifecycle transitions. Tenant + ownership enforced:
 * - owner/admin: any of their company's quotations.
 * - manager/staff: only their own; and only owner/admin may mark
 *   approved/rejected (customer decision recorded by the office).
 */
export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'quotations');
  if ('error' in gate) return gate.error;

  try {
    const body = await request.json();
    const { id, status, rejectReason, fullEdit } = body as { id?: string; status?: string; rejectReason?: string; fullEdit?: boolean };
    if (!id) return NextResponse.json({ error: 'Quotation id is required' }, { status: 400 });
    await dbConnect();
    const existing = await Quotation.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!existing) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });

    const role = String(gate.ctx.user.role || '');
    const isPrivileged = gate.ctx.user.isSuperAdmin || role === 'owner' || role === 'admin';
    const isOwner = String(existing.createdBy || '') === String(gate.ctx.user.id);
    if (!isPrivileged && !isOwner) {
      return NextResponse.json({ error: 'You can only update quotations you created.' }, { status: 403 });
    }

    // Full edit mode — update quotation content (?edit=id flow).
    // Allowed for draft/sent/rejected so approved projects are never rewritten.
    if (fullEdit) {
      const current = String(existing.status || 'sent');
      if (current === 'approved') {
        return NextResponse.json({ error: 'Approved quotations cannot be edited' }, { status: 400 });
      }
      const DEPARTMENTS = ['furniture', 'electrical', 'plumbing', 'interior', 'construction', 'painting', 'software', 'general', 'custom'];
      if (body.department !== undefined) {
        if (!DEPARTMENTS.includes(String(body.department))) {
          return NextResponse.json({ error: 'Unknown department' }, { status: 400 });
        }
        existing.department = body.department;
      }
      if (body.departmentName !== undefined) existing.departmentName = String(body.departmentName || '');
      if (body.mode !== undefined) {
        if (!['single', 'multi'].includes(String(body.mode))) {
          return NextResponse.json({ error: 'Unknown quotation mode' }, { status: 400 });
        }
        existing.mode = body.mode;
      }
      if (body.categories !== undefined) existing.categories = Array.isArray(body.categories) ? body.categories : [];
      if (body.customer !== undefined) existing.customer = body.customer;
      if (body.project !== undefined) {
        // Keep original quoteNo to preserve identity — allow other project fields.
        const incoming = body.project || {};
        existing.project = {
          type: incoming.type ?? existing.project?.type,
          quoteNo: existing.project?.quoteNo,
          date: incoming.date ?? existing.project?.date,
          validTill: incoming.validTill ?? existing.project?.validTill,
        };
      }
      if (body.items !== undefined) {
        if (!Array.isArray(body.items) || body.items.length === 0) {
          return NextResponse.json({ error: 'Add at least one line item' }, { status: 400 });
        }
        existing.items = body.items;
      }
      if (body.totals !== undefined) existing.totals = body.totals;
      if (body.workType !== undefined) existing.workType = body.workType;
      if (body.terms !== undefined) existing.terms = body.terms;
      if (body.inclusions !== undefined) existing.inclusions = body.inclusions;
      // Backfill the source lead when editing a visit-linked quotation saved
      // before lead linkage existed. Edits never move the lead pipeline.
      if (!(existing as unknown as { leadId?: unknown }).leadId && (body.leadId !== undefined || body.visitId !== undefined)) {
        const lid = await resolveLeadId(String(gate.ctx.user.tenantId), body);
        if (lid) (existing as unknown as { leadId?: unknown }).leadId = lid;
      }
      delete (body as Record<string, unknown>).visitId;
      await existing.save();
      await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'quotation.edit', 'Quotation', id, {
        quoteNo: String((existing.project as { quoteNo?: string } | undefined)?.quoteNo || ''),
      });
      return NextResponse.json({ success: true, quotation: existing });
    }

    if (!status || !['draft', 'sent', 'approved', 'rejected'].includes(String(status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if ((status === 'approved' || status === 'rejected') && !isPrivileged) {
      return NextResponse.json({ error: 'Only owners/admins can approve or reject quotations.' }, { status: 403 });
    }
    const current = String(existing.status || 'sent');
    if (current !== status && !(STATUS_FLOW[current] || []).includes(status)) {
      return NextResponse.json({ error: `Cannot move quotation from ${current} to ${status}` }, { status: 400 });
    }
    existing.status = status;
    if (status === 'rejected' && rejectReason) {
      existing.rejectReason = rejectReason;
    }
    if (status === 'approved' || status === 'rejected') {
      existing.decidedAt = new Date();
      existing.decidedBy = gate.ctx.user.email || '';
    } else {
      existing.decidedAt = null;
      existing.decidedBy = '';
    }
    await existing.save();
    // An approved quotation wins its source lead automatically.
    if (status === 'approved' && current !== 'approved') {
      const lid = (existing as unknown as { leadId?: unknown }).leadId;
      if (lid) await syncLeadStatus(String(gate.ctx.user.tenantId), lid, 'won');
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'quotation.status', 'Quotation', id, { from: current, to: status });
    // On approval, automatically create one project (with the same work
    // packages for multi-trade quotes). Idempotent — skips when linked.
    let autoProjectId: string | null = null;
    if (status === 'approved' && current !== 'approved') {
      try {
        const { createProjectFromQuotation } = await import('@/lib/project-from-quotation');
        const lean = existing.toObject ? existing.toObject() : existing;
        const res = await createProjectFromQuotation(lean as Record<string, unknown> & { _id: unknown }, {
          tenantId: gate.ctx.user.tenantId,
          userId: gate.ctx.user.id,
        });
        autoProjectId = res.projectId;
        if (res.created) {
          await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'project.auto-create', 'Project', res.projectId, {
            quotationId: id,
            quoteNo: String((existing.project as { quoteNo?: string } | undefined)?.quoteNo || ''),
          });
        }
      } catch (e) {
        console.error('auto project create on approval failed', e);
      }
    }
    return NextResponse.json({ success: true, quotation: existing, ...(autoProjectId ? { projectId: autoProjectId } : {}) });
  } catch (error: any) {
    console.error('Error updating quotation status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update quotation' },
      { status: 500 },
    );
  }
}
