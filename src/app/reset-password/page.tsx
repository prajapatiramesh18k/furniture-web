'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password reset successfully!');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to reset password');
    }

    setLoading(false);
  };

  if (!token) {
    return (
      <div className="forgot-split-page">
        <div className="forgot-image-side">
          <div className="forgot-image-overlay">
            <div className="forgot-brand">
              <i className="fas fa-couch"></i>
              <h1>Ananya House of Furniture</h1>
            </div>
            <div className="forgot-image-content">
              <h2>Oops!</h2>
              <p>The reset link is invalid or has expired. Request a new one to continue.</p>
            </div>
          </div>
        </div>
        <div className="forgot-form-side">
          <div className="forgot-form-container">
            <div className="forgot-form-header">
              <Link href="/" className="forgot-back-home">
                <i className="fas fa-home"></i>
              </Link>
              <div className="forgot-icon error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h1>Invalid Reset Link</h1>
              <p>This password reset link is invalid or has expired.</p>
            </div>
            <Link href="/forgot-password" className="btn-submit-forgot">
              <i className="fas fa-key"></i>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="forgot-split-page">
        <div className="forgot-image-side">
          <div className="forgot-image-overlay">
            <div className="forgot-brand">
              <i className="fas fa-couch"></i>
              <h1>Ananya House of Furniture</h1>
            </div>
            <div className="forgot-image-content">
              <h2>All Set!</h2>
              <p>Your password has been reset successfully. You can now login with your new password.</p>
              <div className="forgot-features">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Password Updated</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Ready to Login</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="forgot-form-side">
          <div className="forgot-form-container">
            <div className="forgot-success-state">
              <div className="success-animation">
                <div className="success-circle">
                  <i className="fas fa-check"></i>
                </div>
              </div>
              <h2>Password Reset!</h2>
              <p>Your password has been successfully updated.</p>
              <div className="success-actions">
                <Link href="/login" className="btn-submit-forgot">
                  <i className="fas fa-sign-in-alt"></i>
                  Login with New Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-split-page">
      {/* Left Side - Image */}
      <div className="forgot-image-side">
        <div className="forgot-image-overlay">
          <div className="forgot-brand">
            <i className="fas fa-couch"></i>
            <h1>Ananya House of Furniture</h1>
          </div>
          <div className="forgot-image-content">
            <h2>New Password</h2>
            <p>Create a strong password to keep your account secure.</p>
            <div className="forgot-features">
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>At least 6 characters</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-key"></i>
                <span>Mix letters and numbers</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-lock"></i>
                <span>Keep it private</span>
              </div>
            </div>
          </div>
          <div className="forgot-pattern"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="forgot-form-side">
        <div className="forgot-form-container">
          <div className="forgot-form-header">
            <Link href="/" className="forgot-back-home">
              <i className="fas fa-home"></i>
            </Link>
            <div className="forgot-icon">
              <i className="fas fa-key"></i>
            </div>
            <h1>Set New Password</h1>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-form-main">
            <div className="input-icon-group">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>

            <div className="input-icon-group">
              <i className="fas fa-lock"></i>
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <i className={`fas fa-${showConfirm ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>

            {error && (
              <div className="error-banner">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-submit-forgot" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="forgot-login-link">
            <span>Remember your password?</span>
            <Link href="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="forgot-split-page">
        <div className="forgot-form-side">
          <div className="forgot-form-container">
            <div className="forgot-form-header">
              <div className="forgot-icon">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <h1>Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
