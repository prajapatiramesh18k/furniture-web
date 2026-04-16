import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, projectType, message } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const whatsappInstanceId = process.env.WHATSAPP_INSTANCE_ID;

    if (!whatsappToken || !whatsappInstanceId) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 500 });
    }

    const adminPhone = process.env.ADMIN_WHATSAPP || '+919321812823';

    const whatsappMessage = `🔔 *New Contact Form Submission*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📧 *Email:* ${email || 'Not provided'}
📋 *Project Type:* ${projectType || 'Not specified'}

💬 *Message:*
${message || 'No message provided'}

---
Sent from: Ananya House of Furniture Website`;

    const url = `https://api.ultramsg.com/${whatsappInstanceId}/messages/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: whatsappToken,
        to: adminPhone,
        body: whatsappMessage,
      }),
    });

    if (!response.ok) {
      console.error('WhatsApp API error:', await response.text());
      return NextResponse.json({ error: 'Failed to send WhatsApp notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact notify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
