import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

const QUOTE_NOTIFY_EMAIL =
  process.env.QUOTE_NOTIFY_EMAIL || 'ananyahouseoffurniture@gmail.com';

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type QuotePayload = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  branch?: string;
  projectType?: string;
  message: string;
};

function buildQuoteEmailHtml(payload: QuotePayload) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
      <div style="background: #a27341; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">New Get Quote Submission</h1>
      </div>
      <div style="padding: 24px; background: #f9f9f9; border: 1px solid #eee;">
        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
          A customer submitted the Get Quote / contact form on the website.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2; width: 140px;"><strong>Name</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">${escapeHtml(payload.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;"><strong>Phone</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">
              <a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;"><strong>Email</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">
              <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;"><strong>Address</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">${escapeHtml(payload.address || '—')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;"><strong>Branch</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">${escapeHtml(payload.branch || '—')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;"><strong>Project Type</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e0d2;">${escapeHtml(payload.projectType || 'Not specified')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;"><strong>Message</strong></td>
            <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(payload.message)}</td>
          </tr>
        </table>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
        Ananya House of Furniture — Website quote notification
      </p>
    </div>
  `;
}

async function sendViaGmail(payload: QuotePayload) {
  const user = process.env.GMAIL_USER || QUOTE_NOTIFY_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: pass.replace(/\s/g, '') },
  });

  const info = await transporter.sendMail({
    from: `"Ananya House of Furniture" <${user}>`,
    to: QUOTE_NOTIFY_EMAIL,
    replyTo: payload.email,
    subject: `New Quote Request — ${payload.name}${payload.projectType ? ` (${payload.projectType})` : ''}`,
    html: buildQuoteEmailHtml(payload),
  });

  return { sent: true as const, provider: 'gmail' as const, data: info };
}

async function sendViaResend(payload: QuotePayload) {
  if (!process.env.RESEND_API_KEY) return null;

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.EMAIL_FROM || 'Ananya House of Furniture <onboarding@resend.dev>';

  const { data, error } = await resend.emails.send({
    from,
    to: QUOTE_NOTIFY_EMAIL,
    replyTo: payload.email,
    subject: `New Quote Request — ${payload.name}${payload.projectType ? ` (${payload.projectType})` : ''}`,
    html: buildQuoteEmailHtml(payload),
  });

  if (error) {
    console.error('Quote notify Resend error:', error);
    return { sent: false as const, provider: 'resend' as const, reason: 'resend_error' as const, error };
  }

  return { sent: true as const, provider: 'resend' as const, data };
}

async function sendQuoteEmail(payload: QuotePayload) {
  // Prefer Gmail SMTP — can deliver to ananyahouseoffurniture@gmail.com without domain setup
  try {
    const gmailResult = await sendViaGmail(payload);
    if (gmailResult) return gmailResult;
  } catch (err) {
    console.error('Gmail SMTP send failed, trying Resend fallback:', err);
  }

  try {
    const resendResult = await sendViaResend(payload);
    if (resendResult) return resendResult;
  } catch (err) {
    console.error('Resend send failed:', err);
  }

  console.warn('No email provider configured (need GMAIL_APP_PASSWORD or working RESEND domain)');
  return { sent: false as const, reason: 'missing_provider' as const };
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    if (body.website || body.company_url) {
      return NextResponse.json({ success: true });
    }

    const { name, phone, email, address, projectType, message, branch } = body;

    if (!name || !phone || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Contact numbers are fixed 10-digit Indian mobiles (accepts +91 / 0 prefix).
    const digits = String(phone).replace(/\D/g, '');
    const cleanPhone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Phone must be exactly 10 digits' }, { status: 400 });
    }

    const Contact = (await import('@/models/Contact')).default;

    const messageWithBranch =
      branch && String(branch).trim()
        ? `${message}\n\n[Preferred branch: ${branch}]`
        : message;

    // Prefer the logged-in user's tenant (admin manually creating a lead);
    // fall back to the default storefront tenant for the public website form.
    let tenantId: unknown = null;
    try {
      const { requireTenant } = await import('@/lib/tenant');
      const gate = await requireTenant(req, 'customers');
      if (!('error' in gate) && !gate.ctx.user.isSuperAdmin) {
        tenantId = gate.ctx.user.tenantId;
      }
    } catch {}
    if (!tenantId) {
      tenantId = await (async () => {
        try {
          const Tenant = (await import('@/lib/models/Tenant')).default;
          const slug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
          const dt = (await Tenant.findOne({ slug }).lean()) || (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).lean());
          return dt ? dt._id : null;
        } catch { return null; }
      })();
    }

    const contact = await Contact.create({
      tenantId,
      name,
      phone: cleanPhone,
      email,
      address: address || '',
      projectType: projectType || 'not specified',
      message: messageWithBranch,
    });

    type EmailResult =
      | Awaited<ReturnType<typeof sendQuoteEmail>>
      | { sent: false; reason: 'send_failed' };

    let emailResult: EmailResult;
    try {
      emailResult = await sendQuoteEmail({
        name,
        phone: cleanPhone,
        email,
        address: address || '',
        branch: branch || '',
        projectType: projectType || 'not specified',
        message,
      });
    } catch (emailErr) {
      console.error('Failed to send quote notification email:', emailErr);
      emailResult = { sent: false, reason: 'send_failed' };
    }

    return NextResponse.json({
      success: true,
      id: contact._id,
      emailSent: emailResult.sent,
    });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { requireAdmin } = await import('@/lib/admin-auth');
  const gate = await requireAdmin(req, 'customers');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();

    const Contact = (await import('@/models/Contact')).default;
    const url = new URL(req.url);
    const singleId = url.searchParams.get('id');

    // Single customer 360° view — bind anywhere you need all customer details:
    // GET /api/contacts?id=<leadId> → { lead, visits, quotations }
    if (singleId) {
      const scope =
        gate.user.isSuperAdmin && !gate.user.tenantId ? { _id: singleId } : { _id: singleId, tenantId: gate.user.tenantId };
      const lead = await Contact.findOne(scope).populate('assignedTo', 'name').lean();
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

      const tenantId = (lead as { tenantId?: unknown }).tenantId ?? gate.user.tenantId;
      const phone = String((lead as { phone?: unknown }).phone || '').replace(/\D/g, '').slice(-10);

      const { default: SiteVisit } = await import('@/lib/models/SiteVisit');
      const { default: Quotation } = await import('@/lib/models/Quotation');
      const tFilter = (extra: Record<string, unknown>) =>
        tenantId ? { tenantId, ...extra } : extra;

      const visits = await SiteVisit.find(
        tFilter({ $or: [{ leadId: (lead as { _id?: unknown })._id }, ...(phone ? [{ phone }] : [])] }),
      )
        .sort({ visitDate: -1 })
        .lean();

      const quotations = phone
        ? await Quotation.find(tFilter({ 'customer.phone': phone }))
            .select('_id project customer totals status createdAt')
            .sort({ createdAt: -1 })
            .lean()
        : [];

      return NextResponse.json({ success: true, lead, visits, quotations });
    }

    const filter = gate.user.isSuperAdmin && !gate.user.tenantId ? {} : { tenantId: gate.user.tenantId };
    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(contacts);
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

const LEAD_STATUSES = ['new', 'contacted', 'site_visit', 'proposal', 'quotation', 'won', 'lost', 'converted'];

/** Update a lead — status, assignee, follow-up, notes. Tenant-scoped. */
export async function PUT(req: NextRequest) {
  const { requireAdmin } = await import('@/lib/admin-auth');
  const gate = await requireAdmin(req, 'customers');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await req.json();
    const { id, status, source, budget, followUpAt, notes, assignedTo } = body;
    if (!id) return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });

    const Contact = (await import('@/models/Contact')).default;
    const scope =
      gate.user.isSuperAdmin && !gate.user.tenantId ? { _id: id } : { _id: id, tenantId: gate.user.tenantId };
    const existing = await Contact.findOne(scope);
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const before = String(existing.status || 'new');
    if (status !== undefined) {
      if (!LEAD_STATUSES.includes(String(status))) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      existing.status = status;
    }
    if (source !== undefined) existing.source = String(source).slice(0, 120);
    if (budget !== undefined) existing.budget = String(budget).slice(0, 120);
    if (notes !== undefined) existing.notes = String(notes).slice(0, 2000);
    if (followUpAt !== undefined) {
      const d = followUpAt ? new Date(followUpAt) : null;
      if (d && Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid follow-up date' }, { status: 400 });
      }
      existing.followUpAt = d;
    }
    if (assignedTo !== undefined) {
      if (!assignedTo) {
        existing.assignedTo = null;
      } else {
        // Assignee must belong to the same company — never trust the client id blindly.
        const Employee = (await import('@/lib/models/Employee')).default;
        const emp = await Employee.findOne({ _id: assignedTo, tenantId: existing.tenantId }).select('_id');
        if (!emp) return NextResponse.json({ error: 'Invalid assignee' }, { status: 400 });
        existing.assignedTo = emp._id;
      }
    }
    await existing.save();

    try {
      if (existing.tenantId) {
        const { writeAudit } = await import('@/lib/tenant');
        await writeAudit(String(existing.tenantId), gate.user.id, gate.user.email, 'lead.update', 'Contact', String(existing._id), {
          from: before,
          to: String(existing.status || ''),
        });
      }
    } catch {}

    const lead = await Contact.findById(existing._id).populate('assignedTo', 'name');
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
