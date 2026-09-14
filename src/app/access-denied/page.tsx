import Link from 'next/link';

export const metadata = { title: 'Access Denied', robots: { index: false, follow: false } };

export default function AccessDenied() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#3d2a1a 0%,#2b1d12 100%)', padding: 24,
        fontFamily: 'Poppins, system-ui, sans-serif',
      }}
    >
      <div style={{ background: '#fffdf8', border: '1px solid #c9a15f', borderRadius: 26, padding: '44px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,.4)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fbe7e3', color: '#c0392b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18, border: '2px solid #f0c4bc' }}>
          <i className="fas fa-lock"></i>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontFamily: 'Fraunces, Georgia, serif', color: '#2e2117' }}>Access Denied</h1>
        <p style={{ color: '#98816a', fontSize: 14, margin: '0 0 22px' }}>
          This area is restricted to authorized staff. Customers can continue shopping on the main website.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff8ec', borderRadius: 999, padding: '11px 22px', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>Go to Login</Link>
          <Link href="/" style={{ border: '1px solid #e7dcc6', borderRadius: 999, padding: '11px 22px', fontWeight: 600, textDecoration: 'none', fontSize: 14, color: '#2e2117' }}>Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
