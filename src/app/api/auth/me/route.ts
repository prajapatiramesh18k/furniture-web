import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ user: null });
  }

  try {
    await dbConnect();
    const user = await User.findById(decoded.userId).select('name email isAdmin');

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Only return what's needed for display - no user ID exposed
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
