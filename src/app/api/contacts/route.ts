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

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, phone, email, address, projectType, message } = body;

    if (!name || !phone || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Dynamic import to avoid issues
    const Contact = (await import('@/models/Contact')).default;

    const contact = await Contact.create({
      name,
      phone,
      email,
      address: address || '',
      projectType: projectType || 'not specified',
      message,
    });

    return NextResponse.json({ success: true, id: contact._id });
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
