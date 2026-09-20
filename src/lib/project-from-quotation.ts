/**
 * Shared quotation → project conversion.
 * Used by the manual convert API and by the auto-create-on-approval hook.
 * Idempotent: returns the existing project when one is already linked.
 *
 * Multi-trade quotations carry their categories over as project work packages
 * (with per-package budgets) and seed one execution task per package.
 * Single-trade quotations keep the legacy generic checklist.
 */
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import type { QuotationCategory } from '@/lib/quotation/types';

const SEED_TASKS = [
  { title: 'Site Measurement', category: 'Measurement' },
  { title: 'Design Approval', category: 'Design' },
  { title: 'Material Selection & Procurement', category: 'Materials' },
  { title: 'Execution / Installation', category: 'Execution' },
  { title: 'Finishing & Final Inspection', category: 'Finishing' },
];

interface ConvertResult {
  projectId: string;
  created: boolean;
}

export async function createProjectFromQuotation(
  quotation: Record<string, unknown> & { _id: unknown },
  opts: { tenantId: string | null; userId?: string | null; siteId?: string | null; auditEmail?: string },
): Promise<ConvertResult> {
  const q = quotation;
  const tenantId = opts.tenantId;

  const existing = tenantId
    ? await Project.findOne({ tenantId, quotationId: q._id }).select('_id')
    : await Project.findOne({ quotationId: q._id }).select('_id');
  if (existing) return { projectId: String(existing._id), created: false };

  const customer = (q.customer || {}) as { name?: string; phone?: string; email?: string };
  const projectDoc = (q.project || {}) as { type?: string; quoteNo?: string };
  const totals = (q.totals || {}) as { total?: number; categoryTotals?: { key: string; label: string; room?: string; total: number }[] };
  const categories = (Array.isArray(q.categories) ? q.categories : []) as QuotationCategory[];
  const mode = String(q.mode || (categories.length > 0 ? 'multi' : 'single'));

  const packages =
    mode === 'multi' && categories.length > 0
      ? categories
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((c) => {
            const ct = (totals.categoryTotals || []).find((t) => t.key === c.key);
            return {
              key: c.key,
              label: c.label,
              trade: c.trade,
              room: c.room || '',
              budgetValue: Math.round(Number(ct?.total) || 0),
              status: 'pending',
            };
          })
      : [];

  const project = new Project({
    tenantId,
    name: `${customer.name || 'Customer'} — ${projectDoc.type || (q.departmentName as string) || 'Project'}`,
    customer: { name: customer.name || '', phone: customer.phone || '', email: customer.email || '' },
    siteId: opts.siteId || null,
    quotationId: q._id,
    quotationNo: projectDoc.quoteNo || '',
    projectType: mode === 'multi' ? 'Interior (Multi-Trade)' : ((q.departmentName as string) || 'General'),
    status: 'planning',
    budgetValue: Number(totals.total) || 0,
    packages,
    createdBy: opts.userId || null,
  });
  await project.save();

  if (packages.length > 0) {
    const items = (Array.isArray(q.items) ? q.items : []) as {
      trade?: string;
      room?: string;
      name?: string;
      quantity?: number;
      rate?: number;
    }[];
    await Task.insertMany(
      packages.map((p) => {
        const pkgItems = items.filter((it) => String(it.trade || '') === p.key);
        const lines = pkgItems.slice(0, 8).map((it) => `• ${it.name || 'Item'} × ${it.quantity || 1}${it.room ? ` (${it.room})` : ''}`);
        if (pkgItems.length > 8) lines.push(`• …and ${pkgItems.length - 8} more`);
        return {
          tenantId,
          projectId: project._id,
          title: `${p.label}${p.room ? ` — ${p.room}` : ''} package (₹${Number(p.budgetValue).toLocaleString('en-IN')})`,
          category: p.label,
          notes: lines.join('\n') || `${p.label} work package from quotation ${projectDoc.quoteNo || ''}.`,
        };
      }),
    );
  } else {
    await Task.insertMany(
      SEED_TASKS.map((t) => ({ ...t, tenantId, projectId: project._id })),
    );
  }

  return { projectId: String(project._id), created: true };
}
