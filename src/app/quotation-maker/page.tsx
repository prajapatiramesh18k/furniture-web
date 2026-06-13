'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloseButton from '@/components/CloseButton';

type LineItem = { id: number; name: string; material: string; height: number; width: number; rate: number };

const materialOptions = [
  '',
  'BWR Plywood',
  'BWP Plywood',
  'Plywood',
  'PVC',
  'HDHMR',
  'MDF',
  'Particle Board',
  'Solid Wood (Teak)',
  'Solid Wood (Sheesham)',
  'Acrylic Finish',
  'PU Finish',
  'Laminate (Matte)',
  'Laminate (Glossy)',
  'Membrane',
  'Veneer (Natural)',
  'Veneer (Engineered)',
];

const VARIANT_MATERIAL: Record<'pvc' | 'plywood', { material: string; rate: number }> = {
  pvc: { material: 'PVC', rate: 850 },
  plywood: { material: 'Plywood', rate: 1000 },
};

const itemPresets: { name: string; material: string; height: number; width: number; rate: number }[] = [
  { name: 'King Bed with Storage (6x6.5 ft)', material: 'Plywood', height: 6, width: 6.5, rate: 1800 },
  { name: 'Queen Bed with Storage (5x6.5 ft)', material: 'BWR Plywood', height: 5, width: 6.5, rate: 1800 },
  { name: 'Single Bed (3x6.5 ft)', material: 'BWR Plywood', height: 3, width: 6.5, rate: 1800 },
  { name: '3-Door Wardrobe (7x7 ft)', material: 'BWR Plywood', height: 7, width: 7, rate: 1900 },
  { name: '4-Door Sliding Wardrobe (8x7 ft)', material: 'BWR Plywood', height: 7, width: 8, rate: 2000 },
  { name: 'Modular Kitchen — L-Shape', material: 'BWR Plywood', height: 3, width: 10, rate: 2200 },
  { name: 'Modular Kitchen — U-Shape', material: 'BWR Plywood', height: 3, width: 12, rate: 2200 },
  { name: 'Modular Kitchen — Parallel', material: 'BWR Plywood', height: 3, width: 8, rate: 2200 },
  { name: 'TV Unit with Storage', material: 'HDHMR', height: 2, width: 6, rate: 1600 },
  { name: 'Shoe Rack with Drawers', material: 'BWR Plywood', height: 4, width: 3, rate: 1700 },
  { name: 'Dining Table (6-Seater)', material: 'Solid Wood (Sheesham)', height: 3, width: 6, rate: 3500 },
  { name: 'Dining Table (4-Seater)', material: 'Solid Wood (Sheesham)', height: 3, width: 4, rate: 3500 },
  { name: 'Crockery Unit', material: 'HDHMR', height: 7, width: 4, rate: 1800 },
  { name: 'Bookshelf with Shutters', material: 'BWR Plywood', height: 7, width: 3, rate: 1700 },
  { name: 'Study Desk with Hutch', material: 'BWR Plywood', height: 3, width: 4, rate: 1700 },
  { name: 'Pooja Unit', material: 'BWR Plywood', height: 6, width: 3, rate: 2000 },
  { name: 'Bar Cabinet', material: 'HDHMR', height: 4, width: 5, rate: 1900 },
  { name: 'Sofa (3+1+1) with Frame', material: 'Solid Wood (Teak)', height: 3, width: 7, rate: 2800 },
  { name: 'False Ceiling — POP', material: '', height: 0, width: 0, rate: 0 },
  { name: 'Custom Loft / Overhead Storage', material: 'BWR Plywood', height: 2, width: 8, rate: 1500 },
];

const packagePresets: { label: string; projectType: string; items: { name: string; material: string; height: number; width: number; rate: number }[] }[] = [
  {
    label: '1 BHK Starter',
    projectType: '1 BHK',
    items: [
      { name: 'Kitchen', material: 'BWR Plywood', height: 10, width: 8, rate: 900 },
      { name: 'Kitchen Loft', material: 'BWR Plywood', height: 10, width: 2, rate: 900 },
      { name: 'Wardrobe with Loft', material: 'BWR Plywood', height: 8, width: 7, rate: 900 },
      { name: 'Bed with Storage', material: 'BWR Plywood', height: 6, width: 6, rate: 900 },
      { name: 'TV Unit', material: 'HDHMR', height: 4, width: 6, rate: 900 },
      { name: 'Shoe Rack', material: 'BWR Plywood', height: 4, width: 3, rate: 900 },
      { name: 'Study Unit', material: 'BWR Plywood', height: 4, width: 2, rate: 900 },
      { name: 'Pooja Unit', material: 'BWR Plywood', height: 4, width: 5, rate: 900 },
      { name: 'Bathroom Vanity with Mirror', material: 'BWR Plywood', height: 3, width: 3, rate: 900 },
      { name: 'Dining Table (4-Seater)', material: 'Solid Wood (Sheesham)', height: 4, width: 3, rate: 900 },
      { name: 'Sofa Set (3-Seater)', material: 'BWR Plywood', height: 3, width: 6, rate: 900 },
     // { name: 'Centre Table', material: 'BWR Plywood', height: 4, width: 2, rate: 900 },
    ],
  },
  {
    label: '2 BHK Family',
    projectType: '2 BHK',
    items: [
      { name: 'Kitchen', material: 'BWR Plywood', height: 10, width: 8, rate: 850 },
      { name: 'Kitchen Loft', material: 'BWR Plywood', height: 10, width: 2, rate: 850 },
      { name: 'Master Wardrobe', material: 'BWR Plywood', height: 8, width: 7, rate: 850 },
      { name: 'Master Wardrobe Loft', material: 'BWR Plywood', height: 8, width: 2, rate: 850 },
      { name: 'Bedroom Wardrobe', material: 'BWR Plywood', height: 7, width: 7, rate: 850 },
      { name: 'Bedroom Wardrobe Loft', material: 'BWR Plywood', height: 7, width: 2, rate: 850 },
      { name: 'King Bed with Storage', material: 'BWR Plywood', height: 6, width: 6.5, rate: 850 },
      { name: 'Queen Bed with Storage', material: 'BWR Plywood', height: 6, width: 6, rate: 850 },
      { name: 'TV Unit', material: 'HDHMR', height: 4, width: 7, rate: 850 },
      { name: 'Shoe Rack', material: 'BWR Plywood', height: 5, width: 3, rate: 850 },
      { name: 'Pooja Unit', material: 'BWR Plywood', height: 7, width: 4, rate: 850 },
      { name: 'Crockery Unit', material: 'HDHMR', height: 5, width: 7, rate: 850 },
      { name: 'Study Unit', material: 'BWR Plywood', height: 5, width: 2, rate: 850 },
      { name: 'Bathroom Vanity with Mirror', material: 'BWR Plywood', height: 3, width: 3, rate: 850 },
      { name: 'Bathroom Vanity with Mirror', material: 'BWR Plywood', height: 3, width: 3, rate: 850 },
      { name: 'Dining Table (4-Seater)', material: 'Solid Wood (Sheesham)', height: 4, width: 3, rate: 850 },
      { name: 'Sofa Set (3+1)', material: 'BWR Plywood', height: 3, width: 7.33, rate: 850 },
      { name: 'Centre Table', material: 'BWR Plywood', height: 4, width: 2, rate: 850 },
    ],
  },
  {
    label: '3 BHK Premium',
    projectType: '3 BHK',
    items: [
      { name: 'Modular Kitchen', material: 'PVC', height: 10, width: 8, rate: 850 },
      { name: 'Kitchen Loft', material: 'PVC', height: 10, width: 2, rate: 850 },
      { name: 'Master Wardrobe', material: 'PVC', height: 8, width: 7, rate: 850 },
      { name: 'Master Wardrobe Loft', material: 'PVC', height: 8, width: 2, rate: 850 },
      { name: 'Bedroom Wardrobe', material: 'PVC', height: 7, width: 7, rate: 850 },
      { name: 'Bedroom Wardrobe', material: 'PVC', height: 7, width: 7, rate: 850 },
      { name: 'Bedroom Wardrobe Loft', material: 'PVC', height: 7, width: 2, rate: 850 },
      { name: 'Bedroom Wardrobe Loft', material: 'PVC', height: 7, width: 2, rate: 850 },
      { name: 'King Bed with Storage', material: 'PVC', height: 6, width: 6.5, rate: 850 },
      { name: 'Queen Bed with Storage', material: 'PVC', height: 6, width: 6.5, rate: 850 },
      { name: 'Queen Bed with Storage', material: 'PVC', height: 6, width: 6.5, rate: 850 },
      { name: 'TV Unit', material: 'HDHMR', height: 5, width: 7, rate: 850 },
      { name: 'Shoe Rack', material: 'PVC', height: 5, width: 3, rate: 850 },
      { name: 'Pooja Unit', material: 'PVC', height: 7, width: 5, rate: 850 },
      { name: 'Crockery Unit', material: 'HDHMR', height: 5, width: 7, rate: 850 },
      { name: 'Bar Cabinet', material: 'HDHMR', height: 3, width: 7, rate: 850 },
      { name: 'Study Unit', material: 'PVC', height: 5, width: 2, rate: 850 },
      { name: 'Bathroom Vanity with Mirror', material: 'PVC', height: 3, width: 3, rate: 850 },
      { name: 'Bathroom Vanity with Mirror', material: 'PVC', height: 3, width: 3, rate: 850 },
      { name: 'Bathroom Vanity with Mirror', material: 'PVC', height: 3, width: 3, rate: 850 },
      { name: 'Dining Table (6-Seater)', material: 'Solid Wood (Sheesham)', height: 5, width: 3, rate: 850 },
      { name: 'Sofa Set (3+1+1)', material: 'PVC', height: 3, width: 8.33, rate: 850 },
      { name: 'Centre Table', material: 'PVC', height: 4, width: 2, rate: 850 },
    ],
  },
  {
    label: 'Custom Single Item',
    projectType: 'Custom Furniture',
    items: [
      { name: '', material: 'BWR Plywood', height: 0, width: 0, rate: 0 },
    ],
  },
];

const standardInclusions = [
  'Soft-close hinges (Hettich / Ebco) on all doors and drawers',
  'Premium-quality hardware, handles, channels, screws, and fittings',
  'High-quality laminate finish as per selected design',
  'Standard internal shelves and hanging provisions',
  'Professional installation and on-site fitting',
  'Free site measurement and consultation',
  'Basic customization as per site dimensions',
  'Thorough quality check before handover',
  'Site cleaning after installation',
  '1-year workmanship warranty on all furniture',
];

const initialCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  branch: 'Mumbai (Head Office)',
};

const initialProject = {
  type: '',
  quoteNo: 'Q-000001',
  date: new Date().toISOString().split('T')[0],
  validTill: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })(),
};

type BranchInfo = {
  key: string;
  label: string;
  short: string;
  address: string;
  phones: string[];
  email: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  established: string;
};

const branches: BranchInfo[] = [
  {
    key: 'mumbai',
    label: 'Mumbai (Head Office)',
    short: 'Mumbai',
    address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra - 400612',
    phones: ['+91 93218 12823'],
    email: 'ananyahouseoffurniture@gmail.com',
    website: 'www.ananyahouseoffurnite.in',
    contactPerson: 'Mahesh Prajapati',
    contactPhone: '+91 83187 27813',
    established: '2012',
  },
  {
    key: 'ahmedabad',
    label: 'Ahmedabad',
    short: 'Ahmedabad',
    address: 'West Court, 2nd Floor, TRP Mall, Bopal, Ahmedabad, Gujarat - 380059',
    phones: ['+91 93218 12823'],
    email: 'ananyahouseoffurniture@gmail.com',
    website: 'www.ananyahouseoffurnite.in',
    contactPerson: 'Dhruvil Patel',
    contactPhone: '+91 93169 92909',
    established: '2026',
  },
];

const getBranch = (label: string): BranchInfo =>
  branches.find((b) => b.label === label) || branches[0];
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
  const [items, setItems] = useState<LineItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<LineItem>({
    id: -1,
    name: '',
    material: '',
    height: 0,
    width: 0,
    rate: 0,
  });
  const [inclusionsText, setInclusionsText] = useState<string>('');
  const [notes, setNotes] = useState(
    '50% advance with order, balance before delivery.\nQuotation valid for 15 days from date of issue.\nMaterials and finishes as per sample approved at our showroom.'
  );
  const [includeGst, setIncludeGst] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<'pvc' | 'plywood' | null>(null);
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setLogoSrc('/images/logo-circle.svg');
    };
    img.onerror = () => {
      if (!cancelled) setLogoSrc(null);
    };
    img.src = '/images/logo-circle.svg';
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authorized !== true) return;
    let cancelled = false;
    fetch('/api/quotation-counter')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.quoteNo) {
          setProject((p) => ({ ...p, quoteNo: data.quoteNo }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authorized]);

  useEffect(() => {
    if (!activeVariant) return;
    const { material, rate } = VARIANT_MATERIAL[activeVariant];
    setDraft((d) => ({ ...d, material, rate }));
  }, [activeVariant]);

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

  const subtotal = items.reduce(
    (s, i) =>
      s +
      (Number(i.height) || 0) *
        (Number(i.width) || 0) *
        (Number(i.rate) || 0),
    0
  );
  const gst = includeGst ? subtotal * 0.18 : 0;
  const total = subtotal + gst;

  const addItem = () => {
    if (!draft.name.trim()) return;
    const newItem: LineItem = { ...draft, id: Date.now() };
    setItems([...items, newItem]);
    setDraft({ id: -1, name: '', material: '', height: 0, width: 0, rate: 0 });
    setEditingId(null);
  };

  const startEdit = (id: number) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    setDraft({ ...target });
    setEditingId(id);
    setTimeout(() => {
      const el = document.getElementById('line-items-form-anchor');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ id: -1, name: '', material: '', height: 0, width: 0, rate: 0 });
  };

  const updateDraft = (field: keyof LineItem, value: string | number) => {
    setDraft({ ...draft, [field]: value });
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    if (editingId === id) {
      setDraft({ ...draft, [field]: value });
      return;
    }
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const removeItem = (id: number) => {
    setItems(items.filter((it) => it.id !== id));
    if (editingId === id) cancelEdit();
  };

  const applyPackage = (
    preset: (typeof packagePresets)[number],
    variant: 'pvc' | 'plywood' | null
  ) => {
    const override = variant ? VARIANT_MATERIAL[variant] : null;
    const newItems: LineItem[] = preset.items.map((it, i) => ({
      id: Date.now() + i,
      name: it.name,
      material: override ? override.material : it.material,
      height: it.height,
      width: it.width,
      rate: override ? override.rate : it.rate,
    }));
    setItems(newItems);
    setProject((p) => ({ ...p, type: preset.projectType }));
    setActiveVariant(variant);
    setActivePresetLabel(variant ? preset.label : null);
  };

  const customInclusionsList = inclusionsText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const formMaterialOptions = materialOptions;

  const inclusionsList = Array.from(new Set([...standardInclusions, ...customInclusionsList]));

  const handleDownload = async () => {
    if (subtotal === 0) {
      alert('Please add at least one item with a rate before downloading.');
      return;
    }
    const target = document.getElementById('print-area');
    if (!target) return;
    setDownloading(true);
    target.classList.add('qp-compact');
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
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
      const margin = 4;
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const renderW = canvas.width * ratio;
      const renderH = canvas.height * ratio;
      const offsetX = (pageWidth - renderW) / 2;
      const offsetY = margin;
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
      const safeQuote = (project.quoteNo || 'quotation').replace(/[^\w-]/g, '_');
      pdf.save(`${safeQuote}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('PDF generation failed. Please try again or use the browser print dialog.');
    } finally {
      target.classList.remove('qp-compact');
      setDownloading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      setCustomer(initialCustomer);
      setProject({ ...initialProject });
      setItems([]);
      setInclusionsText('');
      setNotes(
        '50% advance with order, balance before delivery. Quotation valid for 15 days from date of issue.'
      );
      fetch('/api/quotation-counter')
        .then((r) => r.json())
        .then((data) => {
          if (data?.quoteNo) setProject((p) => ({ ...p, quoteNo: data.quoteNo }));
        })
        .catch(() => {});
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
                  <option key={b.key} value={b.label}>{b.label}</option>
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

            <div className="quotation-package-pills">
              <span className="quotation-package-label">Quick start:</span>
              {([
                { preset: packagePresets[0], variant: 'pvc' as const, label: '1 BHK PVC (₹850)' },
                { preset: packagePresets[0], variant: 'plywood' as const, label: '1 BHK Plywood (₹1000)' },
                { preset: packagePresets[1], variant: 'pvc' as const, label: '2 BHK PVC (₹850)' },
                { preset: packagePresets[1], variant: 'plywood' as const, label: '2 BHK Plywood (₹1000)' },
                { preset: packagePresets[2], variant: 'pvc' as const, label: '3 BHK PVC (₹850)' },
                { preset: packagePresets[2], variant: 'plywood' as const, label: '3 BHK Plywood (₹1000)' },
                { preset: packagePresets[3], variant: null, label: 'Custom Single Item' },
              ]).map((entry) => {
                const isActive =
                  entry.variant !== null &&
                  activeVariant === entry.variant &&
                  activePresetLabel === entry.preset.label;
                return (
                  <button
                    type="button"
                    key={entry.label}
                    className={`quotation-package-pill${isActive ? ' is-active' : ''}`}
                    onClick={() => applyPackage(entry.preset, entry.variant)}
                    title={`Fill items for ${entry.label}`}
                  >
                    <i className="fas fa-magic-wand-sparkles"></i> {entry.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quotation-section" id="line-items-form-anchor">
            <div className="quotation-section-head">
              <h3 className="quotation-section-title">
                {editingId !== null ? 'Edit Item' : 'Add New Item'}
              </h3>
            </div>
            <div className="quotation-items">
              <div className="quotation-items-header">
                <span>Item Description</span>
                <span>Height (ft)</span>
                <span>Width (ft)</span>
                <span>Rate (₹/sqft)</span>
                <span>Amount</span>
                <span></span>
              </div>
              <div className={`quotation-item-card${editingId !== null ? ' is-editing' : ''}`}>
                <div className="quotation-item-row">
                  <input
                    type="text"
                    className="quotation-item-name"
                    list="preset-list-draft"
                    placeholder="e.g. Modular kitchen — L-shaped"
                    value={draft.name}
                    onChange={(e) => updateDraft('name', e.target.value)}
                    onBlur={(e) => {
                      const match = itemPresets.find((p) => p.name === e.target.value.trim());
                      if (match) {
                        setDraft({
                          ...draft,
                          name: match.name,
                          material: match.material,
                          height: match.height,
                          width: match.width,
                          rate: match.rate,
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addItem();
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="quotation-item-qty"
                    value={draft.height || ''}
                    onChange={(e) => updateDraft('height', Number(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="quotation-item-qty"
                    value={draft.width || ''}
                    onChange={(e) => updateDraft('width', Number(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    min={0}
                    className="quotation-item-rate"
                    value={draft.rate || ''}
                    onChange={(e) => updateDraft('rate', Number(e.target.value) || 0)}
                  />
                  <span className="quotation-item-amount">
                    {formatINR(
                      (Number(draft.height) || 0) *
                        (Number(draft.width) || 0) *
                        (Number(draft.rate) || 0)
                    )}
                  </span>
                  <span></span>
                </div>
                <datalist id="preset-list-draft">
                  {itemPresets.map((p) => (
                    <option key={p.name} value={p.name} />
                  ))}
                </datalist>
                <div className="quotation-item-meta">
                  <label className="quotation-item-material">
                    <i className="fas fa-layer-group"></i>
                    <span>Material / Finish:</span>
                    <select
                      value={draft.material}
                      onChange={(e) => updateDraft('material', e.target.value)}
                    >
                      {formMaterialOptions.map((m) => (
                        <option key={m} value={m}>{m || '— Select —'}</option>
                      ))}
                    </select>
                  </label>
                  {editingId === null && (
                    <button
                      type="button"
                      className="quotation-item-submit"
                      onClick={addItem}
                      disabled={!draft.name.trim()}
                    >
                      <i className="fas fa-paper-plane"></i> Submit
                    </button>
                  )}
                  {editingId !== null && (
                    <div className="quotation-item-actions">
                      <button
                        type="button"
                        className="quotation-item-cancel"
                        onClick={cancelEdit}
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                      <button
                        type="button"
                        className="quotation-item-submit"
                        onClick={() => {
                          if (!draft.name.trim()) return;
                          setItems(items.map((it) => (it.id === editingId ? { ...draft, id: editingId } : it)));
                          cancelEdit();
                        }}
                      >
                        <i className="fas fa-check"></i> Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {items.filter((it) => it.name.trim() !== '').length > 0 && (
              <div className="quotation-items-list">
                <div className="quotation-items-list-head">
                  <i className="fas fa-list-check"></i>
                  <span>Added Items ({items.filter((it) => it.name.trim() !== '').length})</span>
                </div>
                <div className="quotation-items-list-header">
                  <span>Item Description</span>
                  <span>Material</span>
                  <span>Height (ft)</span>
                  <span>Width (ft)</span>
                  <span>Rate (₹/sqft)</span>
                  <span>Amount</span>
                  <span>Update</span>
                  <span>Delete</span>
                </div>
                {items
                  .filter((it) => it.name.trim() !== '')
                  .map((it) => {
                    const amount = (Number(it.height) || 0) * (Number(it.width) || 0) * (Number(it.rate) || 0);
                    return (
                      <div className="quotation-items-list-row" key={it.id}>
                        <div className="quotation-items-list-name-cell">
                          <div className="quotation-items-list-name">{it.name}</div>
                        </div>
                        <div className="quotation-items-list-material-cell">
                          {it.material ? (
                            <span><i className="fas fa-layer-group"></i> {it.material}</span>
                          ) : (
                            <span className="quotation-items-list-empty">—</span>
                          )}
                        </div>
                        <div className="quotation-items-list-num">{it.height || 0}</div>
                        <div className="quotation-items-list-num">{it.width || 0}</div>
                        <div className="quotation-items-list-num">{formatINR(Number(it.rate) || 0)}</div>
                        <div className="quotation-items-list-num quotation-items-list-amt">{formatINR(amount)}</div>
                        <div className="quotation-items-list-action-cell">
                          <button
                            type="button"
                            className="quotation-list-btn quotation-list-btn-update"
                            onClick={() => startEdit(it.id)}
                            title="Edit this item"
                          >
                            <i className="fas fa-pen"></i> Update
                          </button>
                        </div>
                        <div className="quotation-items-list-action-cell">
                          <button
                            type="button"
                            className="quotation-list-btn quotation-list-btn-delete"
                            onClick={() => removeItem(it.id)}
                            title="Delete this item"
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

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

          <div className="quotation-section">
            <h3 className="quotation-section-title">What's Included</h3>
            <p className="quotation-section-hint">
              Six standard inclusions are always printed on the PDF. Add any extras below, one per line.
            </p>
            <div className="quotation-inclusions-add">
              <input
                type="text"
                value={inclusionsText}
                onChange={(e) => setInclusionsText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = inclusionsText.trim();
                    if (v) {
                      setInclusionsText((cur) => (cur.trim() ? cur + '\n' + v : v));
                    }
                  }
                }}
                placeholder="Type one extra inclusion and press Enter to add"
              />
              <button
                type="button"
                onClick={() => {
                  const v = inclusionsText.trim();
                  if (!v) return;
                  setInclusionsText((cur) => (cur.trim() ? cur + '\n' + v : v));
                }}
                className="quotation-inclusions-add-btn"
              >
                <i className="fas fa-plus"></i> Add Line
              </button>
            </div>
            {customInclusionsList.length > 0 && (
              <div className="quotation-inclusions-custom-list">
                {customInclusionsList.map((inc, idx) => (
                  <div className="quotation-inclusions-custom-row" key={idx}>
                    <i className="fas fa-check"></i> {inc}
                    <button
                      type="button"
                      onClick={() => {
                        const next = customInclusionsList.filter((_, i) => i !== idx);
                        setInclusionsText(next.join('\n'));
                      }}
                      title="Remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
          <div className="qp-branch-card">
            <div className="qp-branch-left">
              <div className="qp-logo">
                <div className="qp-logo-img-wrap">
                  {logoSrc ? (
                    <img src={logoSrc} alt="Ananya" />
                  ) : (
                    <div className="qp-logo-fallback">A</div>
                  )}
                </div>
                <h2>Ananya House of Furniture Pvt Ltd.</h2>
              </div>
              <h3 className="qp-branch-title">{getBranch(customer.branch).label}</h3>
              <p className="qp-branch-address">
                <i className="fas fa-map-marker-alt"></i> {getBranch(customer.branch).address}
              </p>
              <p className="qp-branch-contact">
                <i className="fas fa-user"></i> {getBranch(customer.branch).contactPerson}
                <span className="qp-branch-phone"> · {getBranch(customer.branch).contactPhone}</span>
              </p>
              <p className="qp-branch-phones">
                <i className="fas fa-phone"></i> {getBranch(customer.branch).phones.join(' | ')}
              </p>
              <p className="qp-branch-email">
                <i className="fas fa-envelope"></i> <span className="qp-lowercase">{getBranch(customer.branch).email}</span>
              </p>
              <p className="qp-branch-website">
                <i className="fas fa-globe"></i> <span className="qp-lowercase">{getBranch(customer.branch).website}</span>
              </p>
              <p className="qp-branch-est">Established: {getBranch(customer.branch).established}</p>
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
            {customer.email && <p><i className="fas fa-envelope"></i> {customer.email}</p>}
            {customer.address && <p><i className="fas fa-map-marker-alt"></i> {customer.address}</p>}
            {project.type && <p className="qp-project"><strong>Project:</strong> {project.type} &nbsp;•&nbsp; <strong>Branch:</strong> {customer.branch}</p>}
          </div>

          <table className="qp-table">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th>Item Description &amp; Material</th>
                <th style={{ width: '11%' }}>H × W (ft)</th>
                <th style={{ width: '8%' }}>Sqft</th>
                <th style={{ width: '12%' }}>Rate (₹/sqft)</th>
                <th style={{ width: '16%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((it) => it.name.trim() || it.rate > 0 || it.height > 0 || it.width > 0).map((it, idx) => {
                const sqft = (Number(it.height) || 0) * (Number(it.width) || 0);
                const amount = sqft * (Number(it.rate) || 0);
                return (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="qp-item-name">{it.name || '—'}</div>
                      {it.material && <div className="qp-item-material">{it.material}</div>}
                    </td>
                    <td>
                      {Number(it.height) || 0} × {Number(it.width) || 0}
                    </td>
                    <td>{sqft.toLocaleString('en-IN')}</td>
                    <td>{formatINR(it.rate)}</td>
                    <td>{formatINR(amount)}</td>
                  </tr>
                );
              })}
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

          {inclusionsList.length > 0 && (
            <div className="qp-inclusions">
              <h4>What's Included</h4>
              <ul>
                {inclusionsList.map((inc, idx) => (
                  <li key={idx}><i className="fas fa-check"></i> {inc}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="qp-cta">
            <div className="qp-cta-item">
              <i className="fas fa-calendar-check"></i>
              <div>
                <strong>Next step:</strong> Book a free site visit
                <span>Call +91 93218 12823 — we measure on-site at no charge.</span>
              </div>
            </div>
            <div className="qp-cta-item">
              <i className="fas fa-cube"></i>
              <div>
                <strong>See before you decide</strong>
                <span>3D design preview included with every confirmed order.</span>
              </div>
            </div>
          </div>

          <div className="qp-signature">
            <div className="qp-sig-block">
              <div className="qp-sig-line"></div>
              <p>Customer Signature</p>
            </div>
            <div className="qp-sig-block">
              <div className="qp-sig-line"></div>
              <p>For Ananya House of Furniture</p>
              <p className="qp-sig-sub">{(() => { const b = getBranch(customer.branch); return `${b.contactPerson} (${b.short})`; })()}</p>
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
