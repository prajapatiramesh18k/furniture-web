'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | Login';
  }, []);

  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'in' | 'out'>('in');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormVisible(true);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  const handleToggle = (mode: boolean) => {
    setSlideDirection('out');
    setError('');
    setSuccess('');

    setTimeout(() => {
      setIsLogin(mode);
      setSlideDirection('in');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          window.dispatchEvent(new Event('auth-change'));
          router.push('/');
        } else {
          showToast(data.error || 'Invalid email or password', 'error');
        }
      } else {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          showToast('Account created successfully! Welcome aboard 🎉', 'success');
          setName('');
          setEmail('');
          setPassword('');
          setTimeout(() => handleToggle(true), 2000);
        } else {
          showToast(data.error || 'Something went wrong', 'error');
        }
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Toast Notification */}
      {toastVisible && (
        <div className={`login-toast ${toastType}`}>
          <div className="login-toast-icon">
            {toastType === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <span className="login-toast-message">{toastMessage}</span>
          <button className="login-toast-close" onClick={() => setToastVisible(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Close button */}
      <a href="/" className="close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </a>

      {/* Left Side - Image */}
      <div className="login-page-left">
        <img src="/images/contact.png" alt="Ananya House of Furniture" />
        <div className="login-page-left-overlay">
          <h1>Crafting Homes,<br />One Piece at a Time</h1>
          <p>Welcome back to our furniture family. Sign in to manage your products and orders.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-page-right">
        <div
          ref={formRef}
          key={isLogin ? 'login' : 'register'}
          className={`login-form-wrap ${formVisible ? 'visible' : ''} ${slideDirection === 'out' ? 'slide-out' : 'slide-in'}`}
        >
          <div className="login-form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to your account' : 'Join our furniture family'}</p>
          </div>

          <div className="login-toggle">
            <button
              className={`login-toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => !isLogin && handleToggle(true)}
            >
              Sign In
            </button>
            <button
              className={`login-toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => isLogin && handleToggle(false)}
            >
              Register
            </button>
            <div className={`login-toggle-slider ${!isLogin ? 'right' : ''}`} />
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="login-field animate-field" key={`name-${isLogin}`}>
                <label>Full Name</label>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-field animate-field">
              <label>Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field animate-field">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="login-remember animate-field">
                <label>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
            )}

            {!isLogin && (
              <p className="login-terms animate-field" key={`terms-${isLogin}`}>
                By registering, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
              </p>
            )}

            {error && (
              <div className="login-error animate-field" key={`error-${error}`}>
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="login-success animate-field" key={`success-${success}`}>
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            <button
              type="submit"
              className={`login-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <i className={`fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="login-social">
            <button className="social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="social-btn">
              <i className="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
