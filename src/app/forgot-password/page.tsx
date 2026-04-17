'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to send reset email');
    }

    setLoading(false);
  };

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
            <h2>Welcome Back!</h2>
            <p>Reset your password and continue creating beautiful spaces with our furniture.</p>
            <div className="forgot-features">
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Password Reset</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-envelope-open-text"></i>
                <span>Quick Email Recovery</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-lock-open"></i>
                <span>Instant Access Restored</span>
              </div>
            </div>
          </div>
          <div className="forgot-pattern"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="forgot-form-side">
        <div className="forgot-form-container">
          {sent ? (
            <div className="forgot-success-state">
              <div className="success-animation">
                <div className="success-circle">
                  <i className="fas fa-check"></i>
                </div>
              </div>
              <h2>Check Your Email!</h2>
              <p>We have sent password reset instructions to</p>
              <strong className="success-email">{email}</strong>
              <div className="success-message">
                <i className="fas fa-info-circle"></i>
                <p>If you don&apos;t see the email, check your spam folder or try again in a few minutes.</p>
              </div>

              {resetUrl && (
                <div className="dev-reset-box">
                  <div className="dev-reset-header">
                    <i className="fas fa-code"></i>
                    <span>Development Mode</span>
                  </div>
                  <p>Click the link below to reset your password:</p>
                  <a href={resetUrl} className="dev-reset-link">
                    <i className="fas fa-external-link-alt"></i>
                    Reset Password
                  </a>
                </div>
              )}

              <div className="success-actions">
                <Link href="/login" className="btn-back-login">
                  <i className="fas fa-arrow-left"></i>
                  Back to Login
                </Link>
                <button onClick={() => { setSent(false); setEmail(''); }} className="btn-resend">
                  <i className="fas fa-redo"></i>
                  Resend Email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="forgot-form-header">
                <Link href="/" className="forgot-back-home">
                  <i className="fas fa-home"></i>
                </Link>
                <div className="forgot-icon">
                  <i className="fas fa-key"></i>
                </div>
                <h1>Forgot Password?</h1>
                <p>No worries, we&apos;ll help you get back into your account</p>
              </div>

              <form onSubmit={handleSubmit} className="forgot-form-main">
                <div className="input-icon-group">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-help-text">
                <p><i className="fas fa-lightbulb"></i> Tip: Use the same email you registered with</p>
              </div>

              <div className="forgot-login-link">
                <span>Remember your password?</span>
                <Link href="/login">Sign In</Link>
              </div>

              <div className="forgot-divider">
                <span>or</span>
              </div>

              <div className="forgot-signup-link">
                <p>Don&apos;t have an account?</p>
                <Link href="/login?mode=signup" className="signup-link">
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
