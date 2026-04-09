import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ananya@ananya.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ananya123';

    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({ success: true, email });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
