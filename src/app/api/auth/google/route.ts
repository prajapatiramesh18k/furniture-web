import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'ananya-furniture-secret-key-2024';
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      );
    }

    // Fetch user info using access_token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 400 }
      );
    }

    const payload = await userInfoResponse.json();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Failed to retrieve email from Google' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    
    // If not, create them
    if (!user) {
      user = new User({
        name: payload.name || 'Google User',
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        isAdmin: false,
      });
      await user.save();
    } else if (!user.googleId) {
      // If user exists but no googleId, link them
      user.googleId = payload.sub;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
