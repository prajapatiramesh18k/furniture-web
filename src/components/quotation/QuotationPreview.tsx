'use client';

import DynamicItemsTable from './DynamicItemsTable';
import { formatINR, numberToWords } from '@/lib/quotation/calculations';
import { configOfTrade } from '@/lib/quotation/trades';
import type { CategoryTotals, DepartmentConfig, QuotationCategory, QuotationItem, QuotationTotals, TenantBrand } from '@/lib/quotation/types';

export interface PreviewBranch {
  label: string;
  address: string;
  contacts: { name: string; phone: string }[];
  email: string;
  website: string;
  established: string;
}

export interface PreviewCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  branch: string;
}

export interface PreviewProject {
  type: string;
  quoteNo: string;
  date: string;
  validTill: string;
}

/**
 * Print area (#print-area) captured by html2canvas/jsPDF.
 * Header uses tenant branding when the tenant filled its own details,
 * otherwise the branch fallback — identical behaviour to before.
 */
export default function QuotationPreview({
  config,
  departmentLabel,
  items,
  customer,
  project,
  branch,
  tenantBrand,
  logoSrc,
  totals,
  includeGst,
  termsText,
  inclusionsText,
  signer,
  ctaItems,
  categories,
  categoryTotals,
  fallbackTradeKey,
}: {
  config: DepartmentConfig;
  departmentLabel: string;
  items: QuotationItem[];
  customer: PreviewCustomer;
  project: PreviewProject;
  branch: PreviewBranch;
  tenantBrand: TenantBrand | null;
  logoSrc: string | null;
  totals: QuotationTotals;
  includeGst: boolean;
  termsText: string;
  inclusionsText: string;
  signer: string;
  ctaItems: { icon: string; title: string; sub: string }[];
  /** Multi-trade: sections + their subtotals. Absent = legacy single table. */
  categories?: QuotationCategory[] | null;
  categoryTotals?: CategoryTotals[];
  fallbackTradeKey?: string;
}) {
  const companyName = tenantBrand?.name || 'Ananya House of Furniture.';
  const companyAddress = tenantBrand?.address || branch.address;
  const companyEmail = tenantBrand?.email || branch.email;
  const companyWebsite = tenantBrand?.website || branch.website;
  const useTenantContacts = !!(tenantBrand?.phone || tenantBrand?.email);
  const initials = companyName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() || 'AHF';

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const inclusionsList = inclusionsText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="quotation-preview" id="print-area">
      <div className="qp-branch-card">
        <div className="qp-branch-left">
          <div className="qp-logo">
            <div className="qp-logo-img-wrap">
              {logoSrc ? <img src={logoSrc} alt={companyName} /> : <div className="qp-logo-fallback">{initials}</div>}
            </div>
            <h2>{companyName}</h2>
          </div>
          <h3 className="qp-branch-title">{companyName}</h3>
          {companyAddress && (
            <p className="qp-branch-address">
              <i className="fas fa-map-marker-alt"></i> {companyAddress}
            </p>
          )}
          {useTenantContacts ? (
            <>
              {tenantBrand?.phone && (
                <p className="qp-branch-contact" style={{ margin: '2px 0' }}>
                  <i className="fas fa-phone"></i> {tenantBrand.phone}
                </p>
              )}
              {companyEmail && (
                <p className="qp-branch-email">
                  <i className="fas fa-envelope"></i> <span className="qp-lowercase">{companyEmail}</span>
                </p>
              )}
              {companyWebsite && (
                <p className="qp-branch-website">
                  <i className="fas fa-globe"></i> <span className="qp-lowercase">{companyWebsite}</span>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="qp-branch-contact">
                {branch.contacts.map((c, i) => (
                  <p key={`${c.name}-${i}`} style={{ margin: '2px 0' }}>
                    <i className="fas fa-user"></i> {c.name}
                    <span className="qp-branch-phone"> · {c.phone}</span>
                  </p>
                ))}
              </div>
              <p className="qp-branch-email">
                <i className="fas fa-envelope"></i> <span className="qp-lowercase">{companyEmail}</span>
              </p>
              <p className="qp-branch-website">
                <i className="fas fa-globe"></i> <span className="qp-lowercase">{companyWebsite}</span>
              </p>
            </>
          )}
          {tenantBrand?.gstNumber ? (
            <p className="qp-branch-est">GST: {tenantBrand.gstNumber}</p>
          ) : (
            <p className="qp-branch-est">Established: {branch.established}</p>
          )}
          <p className="qp-branch-est">{departmentLabel} Quotation</p>
        </div>
        <div className="qp-branch-right">
          <h1 className="qp-branch-quote-title">QUOTATION</h1>
          <div className="qp-meta-row"><span>Quote No.</span><strong>{project.quoteNo}</strong></div>
          <div className="qp-meta-row"><span>Date</span><strong>{formatDate(project.date)}</strong></div>
          <div className="qp-meta-row"><span>Valid Till</span><strong>{formatDate(project.validTill)}</strong></div>
        </div>
      </div>

      <div className="qp-divider"></div>

      <div className="qp-block">
        <h4>To</h4>
        <p className="qp-name">{customer.name || '—'}</p>
        {customer.phone && <p><i className="fas fa-phone"></i> +91 {customer.phone}</p>}
        {customer.email && <p style={{ textTransform: 'lowercase' }}><i className="fas fa-envelope"></i> {customer.email}</p>}
        {customer.address && <p><i className="fas fa-map-marker-alt"></i> {customer.address}</p>}
        {project.type && (
          <p className="qp-project">
            <strong>Project:</strong> {project.type} &nbsp;•&nbsp; <strong>Branch:</strong> {customer.branch}
          </p>
        )}
      </div>

      {categories && categories.length > 0 ? (
        <>
          {[...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((c) => {
            const fb = fallbackTradeKey || categories[0].key;
            const catItems = items.filter((it) => (it.trade || fb) === c.key);
            if (catItems.length === 0) return null;
            const ct = (categoryTotals || []).find((t) => t.key === c.key);
            return (
              <div key={c.key} style={{ marginBottom: 14 }}>
                <div className="qp-totals-row" style={{ borderBottom: '1px solid #e7dbc4', paddingBottom: 4, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800 }}>{c.label}{c.room ? ` · ${c.room}` : ''}</span>
                </div>
                <DynamicItemsTable config={configOfTrade(c.trade)} items={catItems} variant="print" />
                {ct && (
                  <div className="qp-totals-row" style={{ justifyContent: 'flex-end', gap: 16, fontSize: '0.95em', marginLeft: 'auto', maxWidth: '100%' }}>
                    <span>{c.label} subtotal</span><strong>{formatINR(ct.total)}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <DynamicItemsTable config={config} items={items} variant="print" />
      )}

      <div className="qp-totals">
        <div className="qp-totals-row"><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
        {(totals.totalDiscount || 0) > 0 && (
          <div className="qp-totals-row"><span>Discount</span><strong>−{formatINR(totals.totalDiscount || 0)}</strong></div>
        )}
        {totals.gst > 0 && (
          <div className="qp-totals-row"><span>{includeGst ? 'GST @ 18%' : 'Tax'}</span><strong>{formatINR(totals.gst)}</strong></div>
        )}
        <div className="qp-totals-row qp-total-final"><span>Grand Total</span><strong>{formatINR(totals.total)}</strong></div>
        <p className="qp-words">({numberToWords(Math.round(totals.total))})</p>
      </div>

      {termsText.trim() && (
        <div className="qp-notes">
          <h4>Terms &amp; Conditions</h4>
          <ol className="qp-notes-list">
            {termsText.split('\n').map((line) => line.trim()).filter(Boolean).map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ol>
        </div>
      )}

      {inclusionsList.length > 0 && (
        <div className="qp-inclusions">
          <h4>What&apos;s Included</h4>
          <ul>
            {inclusionsList.map((inc, idx) => (
              <li key={idx}><i className="fas fa-check"></i> {inc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="qp-cta">
        {ctaItems.map((c, i) => (
          <div className="qp-cta-item" key={i}>
            <i className={`fas ${c.icon}`}></i>
            <div>
              <strong>{c.title}</strong>
              <span>{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="qp-signature">
        <div className="qp-sig-block">
          <div className="qp-sig-line"></div>
          <p>Customer Signature</p>
        </div>
        <div className="qp-sig-block">
          <div className="qp-sig-line"></div>
          <p>For {companyName}</p>
          <p className="qp-sig-sub" style={{ fontWeight: 'bold' }}>
            {signer}
          </p>
        </div>
      </div>

      <div className="qp-footer-note">
        Thank you for considering {companyName}. We look forward to bringing your vision to life.
      </div>
      <div className="qp-footer-note" style={{ textAlign: 'center', marginTop: 8, color: '#a27341', fontWeight: 600 }}>
        Designed by Ananya House of Furniture
      </div>
    </div>
  );
}
