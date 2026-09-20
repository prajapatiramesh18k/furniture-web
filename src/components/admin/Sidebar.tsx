'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { filterNav, type NavEntry } from './AdminNav';

interface Counts {
  pendingReviews?: number;
  pendingOrders?: number;
  pendingQuotations?: number;
  pendingLeads?: number;
  products?: number;
}

export default function Sidebar({
  userName,
  userEmail,
  userRole,
  permissions,
  counts,
  query,
  onQuery,
  onNavigate,
  enabledModules,
  tenantName,
  tenantSlug,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  permissions: string[];
  counts: Counts;
  query: string;
  onQuery: (q: string) => void;
  onNavigate?: () => void;
  enabledModules?: string[];
  tenantName?: string;
  tenantSlug?: string | null;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const nav = filterNav(userRole, permissions, enabledModules, tenantSlug);

  const initials = (userName || 'A').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // Local filter — the header search filters globally via callback; sidebar search filters menu.
  const q = query.trim().toLowerCase();
  const visible = q
    ? nav.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          (n.children || []).some((c) => c.label.toLowerCase().includes(q))
      )
    : nav;

  const roleNorm = String(userRole || '').trim().toLowerCase();
  const childVisible = (c: { roles?: string[] }) =>
    !c.roles || c.roles.includes(roleNorm) || c.roles.includes(userRole);
  const [, setTick] = useState(0);
  // Full current location (path + query + hash) so deep links like ?tab=payroll or #onboard highlight correctly.
  const currentLoc = typeof window === 'undefined' ? '' : window.location.pathname + window.location.search + window.location.hash;

  let lastSection = '__none';
  const badgeFor = (entry: NavEntry): number | undefined => {
    if (entry.badgeKey === 'pendingReviews') return counts.pendingReviews || undefined;
    if (entry.badgeKey === 'pendingOrders') return counts.pendingOrders || undefined;
    if (entry.badgeKey === 'pendingQuotations') return counts.pendingQuotations || undefined;
    if (entry.badgeKey === 'pendingLeads') return counts.pendingLeads || undefined;
    if (entry.badgeKey === 'products') return counts.products || undefined;
    return undefined;
  };
  const pathOf = (href: string) => href.split('?')[0].split('#')[0];

  return (
    <>
      <div className="ahf-brand">
        <img
          src="/images/admin-logo.svg"
          alt="Anaya House of Furniture — Admin Portal"
          data-i="0"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const fallbacks = [
              '/images/admin-logo.svg',
              '/images/companylogo-transparent.png',
              '/images/companylogo-with-bg.png',
              '/images/company-logo.png',
              '/images/logo-circle.svg',
            ];
            const i = Number(img.dataset.i || 0);
            if (i < fallbacks.length - 1) {
              img.dataset.i = String(i + 1);
              img.src = fallbacks[i + 1];
            } else {
              img.style.display = 'none';
            }
          }}
        />
      </div>

      <div className="ahf-side-search">
        <div className="ahf-searchbox">
          <i className="fas fa-search"></i>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search menu…" aria-label="Search menu" />
        </div>
      </div>

      <nav className="ahf-nav" aria-label="Admin navigation">
        {visible.map((entry) => {
          const kids = (entry.children || []).filter(childVisible);
          const showSection = entry.section && entry.section !== lastSection;
          lastSection = entry.section || lastSection;
          const entryPath = pathOf(entry.href);
          const childPaths = kids.map((c) => pathOf(c.href));
          const active =
            pathname === entryPath ||
            pathname.startsWith(entryPath + '/') ||
            childPaths.includes(pathname);
          const badge = badgeFor(entry);
          const hasKids = kids.length > 0;
          const open = openGroups[entry.label] ?? active;
          return (
            <div key={entry.label}>
              {showSection && !q && <div className="ahf-nav-section">{entry.section}</div>}
              {hasKids ? (
                <>
                  <button
                    className={`ahf-nav-item ${active ? 'ahf-active' : ''}`}
                    onClick={() => setOpenGroups((s) => ({ ...s, [entry.label]: !open }))}
                    aria-expanded={open}
                  >
                    <i className={`fas ${entry.icon}`}></i>
                    <span>{entry.label}</span>
                    {typeof badge === 'number' && badge > 0 && <span className="ahf-count">{badge > 99 ? '99+' : badge}</span>}
                    <i className={`fas fa-chevron-down ahf-chev`} style={{ transform: open ? 'rotate(180deg)' : 'none' }}></i>
                  </button>
                  {open && (
                    <div className="ahf-nav-children">
                      {kids.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => { setTick((t) => t + 1); onNavigate?.(); }}
                          className={`ahf-nav-child ${currentLoc === c.href ? 'ahf-active' : ''}`}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={entry.href} onClick={onNavigate} className={`ahf-nav-item ${active ? 'ahf-active' : ''}`}>
                  <i className={`fas ${entry.icon}`}></i>
                  <span>{entry.label}</span>
                  {typeof badge === 'number' && badge > 0 && <span className="ahf-count">{badge > 99 ? '99+' : badge}</span>}
                </Link>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p style={{ color: '#8fa0c4', fontSize: 12.5, padding: '12px 10px' }}>No menu items match “{query}”.</p>
        )}
        <div style={{ height: 8 }} />
        {!visible.some((n) => n.href === '/') && (
          <Link href="/" className="ahf-nav-item">
            <i className="fas fa-globe"></i>
            <span>View Website</span>
          </Link>
        )}
      </nav>

      <div className="ahf-side-foot">
        <div className="ahf-side-user">
          <span className="ahf-avatar">{initials}</span>
          <div style={{ minWidth: 0 }}>
            <div className="ahf-u-name">{userName}</div>
            <div className="ahf-u-email">{(userEmail || '').toLowerCase()}</div>
            {tenantName && (
              <div className="ahf-u-email" style={{ fontWeight: 700, color: 'var(--ahf-gold)' }}>{tenantName}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
