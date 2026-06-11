'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloseButton from '@/components/CloseButton';

type LineItem = { id: number; name: string; qty: number; rate: number };

const initialCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  branch: 'Mumbai (Head Office)',
};

const initialProject = {
  type: '',
  quoteNo: 'Q-' + Date.now().toString().slice(-6),
  date: new Date().toISOString().split('T')[0],
  validTill: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  })(),
};

const initialItems: LineItem[] = [{ id: 1, name: '', qty: 1, rate: 0 }];

const branches = ['Mumbai (Head Office)', 'Ahmedabad'];
const projectTypes = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK / Villa',
  'Office',
  'Shop / Retail',
  'Restaurant',
  'Showroom',
  'Modular Kitchen',
  'Custom Furniture',
  'Other',
];

const formatINR = (n: number) =>
  '₹' +
  n.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const two = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };

  const three = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h ? ones[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : '');
  };

  let result = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore) result += three(crore) + ' Crore ';
  if (lakh) result += two(lakh) + ' Lakh ';
  if (thousand) result += two(thousand) + ' Thousand ';
  if (hundred) result += three(hundred);

  return result.trim() + ' Rupees Only';
};

export default function QuotationMakerPage() {
  const [customer, setCustomer] = useState(initialCustomer);
  const [project, setProject] = useState(initialProject);
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [notes, setNotes] = useState(
    '50% advance with order, balance before delivery. Quotation valid for 15 days from date of issue. Materials and finishes as per sample approved at our showroom.'
  );
  const [includeGst, setIncludeGst] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Quotation Maker | Ananya House of Furniture';
    try {
      const raw = sessionStorage.getItem('auth-user');
      const user = raw ? JSON.parse(raw) : null;
      setAuthorized(!!(user && user.isAdmin));
    } catch {
      setAuthorized(false);
    }
  }, []);

  if (authorized === null) {
    return <div style={{ minHeight: '60vh' }} />;
  }

  if (authorized === false) {
    return (
      <div className="quotation-page">
        <div className="quotation-hero no-print">
          <CloseButton href="/" />
          <h1>Admin <span>Access</span></h1>
          <p>This page is restricted to administrators.</p>
        </div>
        <div className="quotation-locked">
          <i className="fas fa-lock"></i>
          <h2>Login required</h2>
          <p>You need an admin account to use the Quotation Maker.</p>
          <button type="button" className="cpf-submit" onClick={() => router.push('/login')}>
            <i className="fas fa-arrow-right"></i> Go to Login
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const gst = includeGst ? subtotal * 0.18 : 0;
  const total = subtotal + gst;

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, rate: 0 }]);
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handleDownload = async () => {
    if (subtotal === 0) {
      alert('Please add at least one item with a rate before downloading.');
      return;
    }
    const target = document.getElementById('print-area');
    if (!target) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, jspdfMod] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const jsPDF = (jspdfMod as unknown as { jsPDF: new (opts: object) => { internal: { pageSize: { getWidth: () => number; getHeight: () => number } }; addImage: (...args: unknown[]) => void; addPage: () => void; save: (name: string) => void } }).jsPDF;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      const safeQuote = (project.quoteNo || 'quotation').replace(/[^\w-]/g, '_');
      pdf.save(`${safeQuote}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('PDF generation failed. Please try again or use the browser print dialog.');
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      setCustomer(initialCustomer);
      setProject({
        ...initialProject,
        quoteNo: 'Q-' + Date.now().toString().slice(-6),
      });
      setItems(initialItems);
      setNotes(
        '50% advance with order, balance before delivery. Quotation valid for 15 days from date of issue.'
      );
    }
  };

  const isActive = (key: string) => focused === key;

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="quotation-page">
      <div className="quotation-hero no-print">
        <CloseButton href="/" />
        <h1>Quotation <span>Maker</span></h1>
        <p>Create a professional quotation for your customer — download as PDF in one click.</p>
      </div>

      <div className="quotation-page-layout no-print">
        {/* EDITOR (left) */}
        <div className="quotation-editor">
          <div className="quotation-section">
            <h3 className="quotation-section-title">Customer Details</h3>
            <div className="quotation-grid-2">
              <div className="floating-field">
                <input
                  type="text"
                  className="cpf-input"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  onFocus={() => setFocused('c-name')}
                  onBlur={() => setFocused(null)}
                />
                <label className="floating-label">Customer Name</label>
              </div>
              <div className="floating-field">
                <input
                  type="tel"
                  className="cpf-input"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  onFocus={() => setFocused('c-phone')}
                  onBlur={() => setFocused(null)}
                />
                <label className="floating-label">Phone</label>
              </div>
            </div>
            <div className="floating-field">
              <input
                type="email"
                className="cpf-input"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                onFocus={() => setFocused('c-email')}
                onBlur={() => setFocused(null)}
              />
              <label className="floating-label">Email (optional)</label>
            </div>
            <div className="floating-field">
              <textarea
                className="cpf-input cpf-textarea-short"
                rows={2}
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                onFocus={() => setFocused('c-address')}
                onBlur={() => setFocused(null)}
              />
              <label className="floating-label">Site Address</label>
            </div>
            <div className="floating-field">
              <select
                className="cpf-input cpf-select"
                value={customer.branch}
                onChange={(e) => setCustomer({ ...customer, branch: e.target.value })}
                onFocus={() => setFocused('c-branch')}
                onBlur={() => setFocused(null)}
              >
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <label className="floating-label">Branch</label>
            </div>
          </div>

          <div className="quotation-section">
            <h3 className="quotation-section-title">Project Info</h3>
            <div className="quotation-grid-2">
              <div className="floating-field">
                <input
                  type="text"
                  className="cpf-input"
                  value={project.quoteNo}
                  onChange={(e) => setProject({ ...project, quoteNo: e.target.value })}
                  onFocus={() => setFocused('p-qno')}
                  onBlur={() => setFocused(null)}
                />
                <label className="floating-label">Quote No.</label>
              </div>
              <div className="floating-field">
                <input
                  type="date"
                  className="cpf-input cpf-date"
                  value={project.date}
                  onChange={(e) => setProject({ ...project, date: e.target.value })}
                  onFocus={() => setFocused('p-date')}
                  onBlur={() => setFocused(null)}
                />
                <label className="floating-label">Date</label>
              </div>
            </div>
            <div className="quotation-grid-2">
              <div className="floating-field">
                <select
                  className="cpf-input cpf-select"
                  value={project.type}
                  onChange={(e) => setProject({ ...project, type: e.target.value })}
                  onFocus={() => setFocused('p-type')}
                  onBlur={() => setFocused(null)}
                >
                  <option value=""></option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label className="floating-label">Project Type</label>
              </div>
              <div className="floating-field">
                <input
                  type="date"
                  className="cpf-input cpf-date"
                  value={project.validTill}
                  onChange={(e) => setProject({ ...project, validTill: e.target.value })}
                  onFocus={() => setFocused('p-valid')}
                  onBlur={() => setFocused(null)}
                />
                <label className="floating-label">Valid Till</label>
              </div>
            </div>
          </div>

          <div className="quotation-section">
            <div className="quotation-section-head">
              <h3 className="quotation-section-title">Line Items</h3>
              <button type="button" className="quotation-add-btn" onClick={addItem}>
                <i className="fas fa-plus"></i> Add Item
              </button>
            </div>
            <div className="quotation-items">
              <div className="quotation-items-header">
                <span>Item Description</span>
                <span>Qty</span>
                <span>Rate (₹)</span>
                <span>Amount</span>
                <span></span>
              </div>
              {items.map((it) => (
                <div className="quotation-item-row" key={it.id}>
                  <input
                    type="text"
                    className="quotation-item-name"
                    placeholder="e.g. Modular kitchen — L-shaped"
                    value={it.name}
                    onChange={(e) => updateItem(it.id, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    min={0}
                    className="quotation-item-qty"
                    value={it.qty}
                    onChange={(e) => updateItem(it.id, 'qty', Number(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    min={0}
                    className="quotation-item-rate"
                    value={it.rate}
                    onChange={(e) => updateItem(it.id, 'rate', Number(e.target.value) || 0)}
                  />
                  <span className="quotation-item-amount">
                    {formatINR((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                  </span>
                  <button
                    type="button"
                    className="quotation-item-remove"
                    onClick={() => removeItem(it.id)}
                    disabled={items.length === 1}
                    title="Remove item"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <label className="quotation-gst-toggle">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
              />
              <span>Include 18% GST</span>
            </label>
          </div>

          <div className="quotation-section">
            <h3 className="quotation-section-title">Terms &amp; Notes</h3>
            <div className="floating-field">
              <textarea
                className="cpf-input cpf-textarea"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={() => setFocused('notes')}
                onBlur={() => setFocused(null)}
              />
              <label className="floating-label floating-label-textarea">Notes</label>
            </div>
          </div>

          <div className="quotation-actions">
            <button
              type="button"
              className="cpf-submit quotation-print-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="cpf-spinner"></span> Generating PDF...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i> Download PDF
                </>
              )}
            </button>
            <button type="button" className="quotation-reset-btn" onClick={handleReset}>
              <i className="fas fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        {/* PREVIEW (right) — also the print area */}
        <div className="quotation-preview" id="print-area">
          <div className="qp-letterhead">
            <div className="qp-logo">
              <img src="/images/contact.png" alt="Ananya" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <h2>Ananya House of Furniture Pvt Ltd</h2>
                <p>Khardipada, Diva-Shil Road, Thane, Maharashtra 400612</p>
                <p>+91 93218 12823 &nbsp;|&nbsp; ananyahouseoffurniture@gmail.com</p>
              </div>
            </div>
            <div className="qp-meta">
              <h1>QUOTATION</h1>
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
            {customer.email && <p><i className="fas fa-envelope"></i> {customer.email}</p>}
            {customer.address && <p><i className="fas fa-map-marker-alt"></i> {customer.address}</p>}
            {project.type && <p className="qp-project"><strong>Project:</strong> {project.type} &nbsp;•&nbsp; <strong>Branch:</strong> {customer.branch}</p>}
          </div>

          <table className="qp-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th>Item Description</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '15%' }}>Rate</th>
                <th style={{ width: '18%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((it) => it.name.trim() || it.rate > 0).map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.name || '—'}</td>
                  <td>{it.qty}</td>
                  <td>{formatINR(it.rate)}</td>
                  <td>{formatINR((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="qp-totals">
            <div className="qp-totals-row"><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div>
            {includeGst && (
              <div className="qp-totals-row"><span>GST @ 18%</span><strong>{formatINR(gst)}</strong></div>
            )}
            <div className="qp-totals-row qp-total-final"><span>Grand Total</span><strong>{formatINR(total)}</strong></div>
            <p className="qp-words">({numberToWords(Math.round(total))})</p>
          </div>

          {notes && (
            <div className="qp-notes">
              <h4>Terms &amp; Conditions</h4>
              <p>{notes}</p>
            </div>
          )}

          <div className="qp-signature">
            <div className="qp-sig-block">
              <div className="qp-sig-line"></div>
              <p>Customer Signature</p>
            </div>
            <div className="qp-sig-block">
              <div className="qp-sig-line"></div>
              <p>For Ananya House of Furniture</p>
              <p className="qp-sig-sub">Authorised Signatory</p>
            </div>
          </div>

          <div className="qp-footer-note">
            Thank you for considering Ananya House of Furniture. We look forward to bringing your vision to life.
          </div>
        </div>
      </div>
    </div>
  );
}
