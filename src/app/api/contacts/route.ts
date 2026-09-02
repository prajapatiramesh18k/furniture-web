import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

let mongoConnected = false;

async function connectDB() {
  if (mongoConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ananya');
    mongoConnected = true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

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
    await connectDB();

    const body = await req.json();

    if (body.website || body.company_url) {
      return NextResponse.json({ success: true });
    }

    const { name, phone, email, address, projectType, message, branch } = body;

    if (!name || !phone || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const Contact = (await import('@/models/Contact')).default;

    const messageWithBranch =
      branch && String(branch).trim()
        ? `${message}\n\n[Preferred branch: ${branch}]`
        : message;

    const contact = await Contact.create({
      name,
      phone,
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
        phone,
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

export async function GET() {
  try {
    await connectDB();

    const Contact = (await import('@/models/Contact')).default;
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return NextResponse.json(contacts);
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
