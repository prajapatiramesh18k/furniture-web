import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ success: true, message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await User.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry
        }
      }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('=== PASSWORD RESET ===');
    console.log('Email:', email);
    console.log('Reset URL:', resetUrl);
    console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);

    // Send email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Ananya Furniture <onboarding@resend.dev>',
          to: email,
          subject: 'Reset Your Password - Ananya House of Furniture',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #a27341; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Ananya House of Furniture</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px;">
                  Hello ${user.name || 'there'},
                </p>
                <p style="color: #666; font-size: 16px;">
                  You requested a password reset for your Ananya House of Furniture account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: #a27341; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #888; font-size: 14px;">
                  This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                  Ananya House of Furniture<br>
                  Diva-Shil Road, Khardipada, Thane, Maharashtra<br>
                  contact@ananyahouseoffurniture.com
                </p>
              </div>
            </div>
          `,
        });

        if (error) {
          console.error('Resend error:', error);
        } else {
          console.log('Email sent successfully:', data);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent! Check your inbox.',
      // Return reset URL for testing (remove in production)
      resetUrl
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
