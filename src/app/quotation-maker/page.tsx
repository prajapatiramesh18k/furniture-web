'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CloseButton from '@/components/CloseButton';
import ConfirmationModal from '@/components/ConfirmationModal';
import { trackQuotationPdfDownload } from '@/lib/analytics';
import DepartmentSelector from '@/components/quotation/DepartmentSelector';
import DynamicItemForm from '@/components/quotation/DynamicItemForm';
import DynamicItemsTable from '@/components/quotation/DynamicItemsTable';
import QMSelect from '@/components/quotation/QMSelect';
import QuotationPreview from '@/components/quotation/QuotationPreview';
import MultiTradeSections, { AddTradePills, calcOfTrade, newCategoryFor } from '@/components/quotation/MultiTradeSections';
import type { DepartmentId, QuotationCategory, QuotationItem, TenantBrand } from '@/lib/quotation/types';
import {
  DEPARTMENT_CONFIGS,
  getDepartmentConfig,
  joinLines,
  makeEmptyItem,
  packageToItems,
  presetToItem,
  workTypeOf,
} from '@/lib/quotation/departments';
import { configOfTrade, tradeForDepartment } from '@/lib/quotation/trades';
import { multiTotalsOf, totalsOf } from '@/lib/quotation/calculations';

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

type BranchContact = { name: string; phone: string };
type BranchInfo = {
  key: string;
  label: string;
  short: string;
  address: string;
  contacts: BranchContact[];
  email: string;
  website: string;
  established: string;
};

const branches: BranchInfo[] = [
  {
    key: 'mumbai',
    label: 'Mumbai (Head Office)',
    short: 'Mumbai',
    address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra - 400612',
    contacts: [
      { name: 'Mahesh Prajapati', phone: '+91 83187 27813' },
      { name: 'Ramesh Prajapati', phone: '+91 93218 12823' },
    ],
    email: 'ananyahouseoffurniture@gmail.com',
    website: 'www.ananyahouseoffurnite.in',
    established: '2012',
  },
  {
    key: 'ahmedabad',
    label: 'Ahmedabad',
    short: 'Ahmedabad',
    address: 'West Court, 2nd Floor, TRP Mall, Bopal, Ahmedabad, Gujarat - 380059',
    contacts: [
      { name: 'Ramesh Prajapati', phone: '+91 93218 12823' },
    ],
    email: 'ananyahouseoffurniture@gmail.com',
    website: 'www.ananyahouseoffurnite.in',
    established: '2026',
  },
];

const getBranch = (label: string): BranchInfo =>
  branches.find((b) => b.label === label) || branches[0];

const DEFAULT_DEPARTMENT: DepartmentId = 'furniture';

export default function QuotationMakerPage() {
  const [department, setDepartment] = useState<DepartmentId>(DEFAULT_DEPARTMENT);
  const config = DEPARTMENT_CONFIGS[department];

  // Multi-trade (interior package) mode: one quotation, many trade sections.
  // Single mode is byte-for-byte the legacy flow.
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [categories, setCategories] = useState<QuotationCategory[]>([]);
  const [activeCatKey, setActiveCatKey] = useState('');
  const [pendingMode, setPendingMode] = useState<'single' | 'multi' | null>(null);

  const [customer, setCustomer] = useState(initialCustomer);
  const [project, setProject] = useState(initialProject);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<QuotationItem>(() => makeEmptyItem(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT]));
  const [workType, setWorkType] = useState<string>(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT].defaultWorkType);
  const [inclusionsText, setInclusionsText] = useState<string>(
    () => joinLines(workTypeOf(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT], DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT].defaultWorkType).inclusions),
  );
  const [notes, setNotes] = useState<string>(
    () => joinLines(workTypeOf(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT], DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT].defaultWorkType).terms),
  );
  // Baselines for dirty-detection: terms/inclusions are only auto-replaced while pristine.
  const [termsBaseline, setTermsBaseline] = useState<string>(() =>
    joinLines(workTypeOf(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT], DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT].defaultWorkType).terms),
  );
  const [inclusionsBaseline, setInclusionsBaseline] = useState<string>(() =>
    joinLines(workTypeOf(DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT], DEPARTMENT_CONFIGS[DEFAULT_DEPARTMENT].defaultWorkType).inclusions),
  );
  const [includeGst, setIncludeGst] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [tenantBrand, setTenantBrand] = useState<TenantBrand | null>(null);
  // Whoever is logged in signs the quotation — shown under Authorised Signatory.
  const [loginName, setLoginName] = useState('');
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingDept, setPendingDept] = useState<DepartmentId | null>(null);
  const [pendingWorkType, setPendingWorkType] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const router = useRouter();

  type SiteVisitRow = {
    _id: string;
    customerName: string;
    phone?: string;
    email?: string;
    address?: string;
    visitDate: string;
    status?: string;
    quoteStatus?: string;
    requirements?: string;
    notes?: string;
    leadId?: { email?: string; name?: string; phone?: string } | string | null;
  };
  const [linkedVisitId, setLinkedVisitId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const showNotice = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 4000);
  };
  const pathname = usePathname();
  // Inside admin the X should go back to the request list (sidebar stays),
  // not to the public home which unmounts the whole portal.
  const closeHref = pathname?.startsWith('/admin') ? '/admin/quotations/new' : '/';

  useEffect(() => {
    document.title = 'Quotation Maker | Ananya House of Furniture';
    try {
      const raw = sessionStorage.getItem('auth-user');
      const user = raw ? JSON.parse(raw) : null;
      setAuthorized(!!(user && user.isAdmin));
      if (user?.name) setLoginName(String(user.name));
    } catch {
      setAuthorized(false);
    }
    // Source of truth — the session copy can be stale after profile edits.
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.name) setLoginName(String(d.user.name));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const toDataUrl = (url: string): Promise<string> =>
      fetch(url)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );
    const tryLoad = async (primary: string, fallback: string) => {
      try {
        const dataUrl = await toDataUrl(primary);
        if (!cancelled) setLogoSrc(dataUrl);
      } catch {
        try {
          const dataUrl = await toDataUrl(fallback);
          if (!cancelled) setLogoSrc(dataUrl);
        } catch {
          if (!cancelled) setLogoSrc(fallback);
        }
      }
    };
    tryLoad('/images/companylogo-with-bg.png', '/images/company-logo.png');
    return () => {
      cancelled = true;
    };
  }, []);

  // Tenant branding: quotations/PDFs must use the CURRENT tenant's company info,
  // never hardcoded details. Falls back to defaults on the public maker.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/tenant/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const t = data?.tenant;
        if (t) {
          setTenantBrand({
            name: t.name || 'Ananya House of Furniture',
            address: t.address || '',
            phone: t.phone || '',
            email: t.email || '',
            gstNumber: t.gstNumber || '',
            website: t.website || '',
            logo: t.logo || '',
          });
          if (t.logo) setLogoSrc(t.logo);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (authorized !== true) return;
    let cancelled = false;
    fetch('/api/quotation-counter')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.quoteNo) {
          // Don't overwrite quote no when editing an existing quotation.
          const params = new URLSearchParams(window.location.search);
          if (!params.get('edit')) {
            setProject((p) => ({ ...p, quoteNo: data.quoteNo }));
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authorized]);

  // Site-visit requests (source for new quotations) + edit mode (?edit=id).
  useEffect(() => {
    if (authorized !== true) return;
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const eid = params.get('edit');
    const vid = params.get('visit');
    if (eid) setEditId(eid);

    fetch('/api/site-visits', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list = Array.isArray(d?.visits) ? d.visits : [];
        // Autofill when opened from request list (?visit=id).
        if (vid && !eid) {
          const leadEmailOf = (x: SiteVisitRow) =>
            x.email || (x.leadId && typeof x.leadId === 'object' ? x.leadId.email || '' : '');
          const v = list.find((x: SiteVisitRow) => String(x._id) === String(vid));
          if (v) {
            setCustomer((c) => ({
              ...c,
              name: v.customerName || c.name,
              phone: String(v.phone || '').replace(/\D/g, '').slice(-10),
              email: leadEmailOf(v) || c.email,
              address: v.address || c.address,
            }));
            if (v.requirements && v.requirements.trim()) {
              setProject((p) => ({ ...p, type: v.requirements.trim() }));
            }
            setLinkedVisitId(v._id);
            showNotice(`Autofilled from site visit — ${v.customerName}.`, 'success');
          } else {
            // Fallback: fetch single visit directly.
            fetch(`/api/site-visits?id=${encodeURIComponent(vid)}`, { cache: 'no-store' })
              .then((r) => r.json())
              .then((sd) => {
                if (cancelled) return;
                const sv = sd?.visit;
                if (sv) {
                  const em = sv.email || (sv.leadId && typeof sv.leadId === 'object' ? sv.leadId.email || '' : '');
                  setCustomer((c) => ({
                    ...c,
                    name: sv.customerName || c.name,
                    phone: String(sv.phone || '').replace(/\D/g, '').slice(-10),
                    email: em || c.email,
                    address: sv.address || c.address,
                  }));
                  if (sv.requirements && String(sv.requirements).trim()) {
                    setProject((p) => ({ ...p, type: String(sv.requirements).trim() }));
                  }
                  setLinkedVisitId(sv._id);
                  showNotice(`Autofilled from site visit — ${sv.customerName}.`, 'success');
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});

    if (eid) {
      setEditLoading(true);
      fetch(`/api/quotations?id=${encodeURIComponent(eid)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const q = d?.quotation;
          if (!q) {
            showNotice('Quotation to edit not found.', 'error');
            return;
          }
          if (q.department) setDepartment(q.department);
          if (q.mode === 'multi' || q.mode === 'single') {
            setMode(q.mode);
            if (q.mode === 'multi' && Array.isArray(q.categories) && q.categories.length > 0) {
              setCategories(q.categories);
              setActiveCatKey(q.categories[0].key);
            }
          }
          if (q.customer) {
            setCustomer({
              name: q.customer.name || '',
              phone: String(q.customer.phone || ''),
              email: q.customer.email || '',
              address: q.customer.address || '',
              branch: q.customer.branch || 'Mumbai (Head Office)',
            });
          }
          if (q.project) {
            setProject({
              type: q.project.type || '',
              quoteNo: q.project.quoteNo || '',
              date: q.project.date || new Date().toISOString().split('T')[0],
              validTill: q.project.validTill || '',
            });
          }
          if (Array.isArray(q.items)) {
            setItems(q.items.map((it: QuotationItem, idx: number) => ({ ...it, id: Date.now() + idx })));
          }
          if (typeof q.workType === 'string' && q.workType) setWorkType(q.workType);
          const t = typeof q.terms === 'string' ? q.terms : '';
          const inc = typeof q.inclusions === 'string' ? q.inclusions : '';
          if (t) {
            setNotes(t);
            setTermsBaseline(t);
          }
          if (inc) {
            setInclusionsText(inc);
            setInclusionsBaseline(inc);
          }
          if (q.totals && Number(q.totals.gst) > 0) setIncludeGst(true);
          showNotice(`Editing ${q.project?.quoteNo || 'quotation'} — changes will update the same quotation.`, 'info');
        })
        .catch(() => {
          if (!cancelled) showNotice('Failed to load quotation for editing.', 'error');
        })
        .finally(() => {
          if (!cancelled) setEditLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  if (authorized === null) {
    return <div style={{ minHeight: '60vh' }} />;
  }

  if (authorized === false) {
    return (
      <div className="quotation-page">
        <div className="quotation-hero no-print">
          <CloseButton href={closeHref} />
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

  const activeCat = mode === 'multi' ? categories.find((c) => c.key === activeCatKey) || categories[0] : undefined;
  const activeConfig = activeCat ? configOfTrade(activeCat.trade) : config;

  const singleTotals = totalsOf(items, config.calculationType, includeGst);
  const multi = mode === 'multi'
    ? multiTotalsOf(items, categories, calcOfTrade, includeGst)
    : null;
  const subtotal = multi ? multi.subtotal : singleTotals.subtotal;
  const gst = multi ? multi.gst : singleTotals.gst;
  const total = multi ? multi.total : singleTotals.total;
  const totalDiscount = multi ? multi.totalDiscount : 0;
  const categoryTotals = multi ? multi.categoryTotals : undefined;
  const totalsByKey = new Map((categoryTotals || []).map((c) => [c.key, c]));
  const termsDirty = notes !== termsBaseline;
  const inclusionsDirty = inclusionsText !== inclusionsBaseline;

  const updateDraft = (key: string, value: string | number) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleDraftBlur = (key: string) => {
    if (key === 'quantity') {
      setDraft((d) => ({ ...d, quantity: Number(d.quantity) > 0 ? Number(d.quantity) : 1 }));
      return;
    }
    // Preset lookup: typing a known preset name fills its fields.
    if (key === 'name' && activeConfig.presets && draft.name.trim()) {
      const match = activeConfig.presets.find((p) => p.name === draft.name.trim());
      if (match) {
        const filled = presetToItem(match, draft.id);
        setDraft((d) => ({ ...d, ...filled, id: d.id }));
      }
    }
  };

  const submitDraft = () => {
    if (!draft.name.trim()) return;
    const qty = Number(draft.quantity) > 0 ? Number(draft.quantity) : 1;
    const stamped = mode === 'multi' && activeCat ? { ...draft, trade: activeCat.key, quantity: qty } : { ...draft, quantity: qty };
    if (editingId !== null) {
      setItems((list) => list.map((it) => (it.id === editingId ? { ...stamped, id: editingId } : it)));
      setEditingId(null);
    } else {
      setItems((list) => [...list, { ...stamped, id: Date.now() }]);
    }
    setDraft(makeEmptyItem(activeConfig));
  };

  const startEdit = (id: number) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    // Jump the form to the item's trade section in multi mode.
    if (mode === 'multi' && target.trade && target.trade !== activeCatKey) {
      setActiveCatKey(target.trade);
    }
    setDraft({ ...target, quantity: Number(target.quantity) || 1 });
    setEditingId(id);
    setTimeout(() => {
      const el = document.getElementById('line-items-form-anchor');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(makeEmptyItem(activeConfig));
  };

  const removeItem = (id: number) => {
    setItems((list) => list.filter((it) => it.id !== id));
    if (editingId === id) cancelEdit();
  };

  /** Apply a package preset (variant overrides first, e.g. furniture PVC/Plywood rates). */
  const applyPackage = (presetIndex: number, variantKey: string | null) => {
    const pkg = config.packages?.[presetIndex];
    if (!pkg) return;
    const variantFields = variantKey ? config.variants?.find((v) => v.key === variantKey)?.fields : undefined;
    setItems(packageToItems(pkg, variantFields));
    setProject((p) => ({ ...p, type: pkg.projectType }));
    setActiveVariant(variantKey);
    setActivePresetLabel(pkg.label);
  };

  const applyVariantToDraft = (variantKey: string) => {
    const v = config.variants?.find((x) => x.key === variantKey);
    if (!v) return;
    setDraft((d) => ({ ...d, ...v.fields }));
    setActiveVariant(variantKey);
  };

  const loadWorkTypeDefaults = (value: string) => {
    const wt = workTypeOf(config, value);
    const t = joinLines(wt.terms);
    const inc = joinLines(wt.inclusions);
    setWorkType(value);
    setNotes(t);
    setInclusionsText(inc);
    setTermsBaseline(t);
    setInclusionsBaseline(inc);
  };

  const requestWorkType = (next: string) => {
    if (next === workType) return;
    if (termsDirty || inclusionsDirty) setPendingWorkType(next);
    else loadWorkTypeDefaults(next);
  };

  const applyDepartment = (next: DepartmentId) => {
    const nextConfig = getDepartmentConfig(next);
    const wt = workTypeOf(nextConfig, nextConfig.defaultWorkType);
    const t = joinLines(wt.terms);
    const inc = joinLines(wt.inclusions);
    setDepartment(next);
    setItems([]);
    setDraft(makeEmptyItem(nextConfig));
    setEditingId(null);
    setWorkType(nextConfig.defaultWorkType);
    setNotes(t);
    setInclusionsText(inc);
    setTermsBaseline(t);
    setInclusionsBaseline(inc);
    setProject((p) => ({ ...p, type: '' }));
    setActiveVariant(null);
    setActivePresetLabel(null);
  };

  const requestDepartment = (next: DepartmentId) => {
    if (next === department) return;
    if (items.length > 0 || termsDirty || inclusionsDirty) setPendingDept(next);
    else applyDepartment(next);
  };

  /* ---------- multi-trade mode ---------- */

  const applyMode = (next: 'single' | 'multi') => {
    if (next === 'multi') {
      const t = tradeForDepartment(department);
      const cat: QuotationCategory = {
        key: `${t.key}-0-${Date.now().toString(36).slice(-4)}`,
        trade: t.key,
        label: t.label,
        room: '',
        discount: 0,
        taxPct: undefined,
        sortOrder: 0,
      };
      setCategories([cat]);
      setActiveCatKey(cat.key);
      // Existing single-trade items move into the first section untouched.
      setItems((list) => list.map((it) => ({ ...it, trade: cat.key })));
      setDraft(makeEmptyItem(configOfTrade(t.key)));
      // Pristine quotes adopt Interior defaults (project types, terms).
      if (items.length === 0 && !termsDirty && !inclusionsDirty && department !== 'interior') {
        const ic = DEPARTMENT_CONFIGS.interior;
        const wt = workTypeOf(ic, ic.defaultWorkType);
        const wtTerms = joinLines(wt.terms);
        const wtInc = joinLines(wt.inclusions);
        setDepartment('interior');
        setWorkType(ic.defaultWorkType);
        setNotes(wtTerms);
        setInclusionsText(wtInc);
        setTermsBaseline(wtTerms);
        setInclusionsBaseline(wtInc);
      }
    } else {
      setCategories([]);
      setActiveCatKey('');
      setDraft(makeEmptyItem(config));
    }
    setEditingId(null);
    setMode(next);
  };

  const requestMode = (next: 'single' | 'multi') => {
    if (next === mode) return;
    if (items.length > 0 || termsDirty || inclusionsDirty) setPendingMode(next);
    else applyMode(next);
  };

  const addCategory = (tradeKey: string) => {
    const taken = categories.map((c) => c.label);
    const cat = newCategoryFor(tradeKey, taken, categories.length);
    setCategories((list) => [...list, cat]);
    setActiveCatKey(cat.key);
    setEditingId(null);
    setDraft(makeEmptyItem(configOfTrade(cat.trade)));
  };

  const removeCategory = (key: string) => {
    if (categories.length <= 1) return;
    const remaining = categories.filter((c) => c.key !== key);
    const fallback = [...remaining].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0];
    setItems((list) => list.map((it) => ((it.trade || key) === key ? { ...it, trade: fallback.key } : it)));
    setCategories(remaining);
    if (activeCatKey === key) {
      setActiveCatKey(fallback.key);
      setDraft(makeEmptyItem(configOfTrade(fallback.trade)));
    }
    setEditingId(null);
  };

  const patchCategory = (key: string, patch: Partial<QuotationCategory>) => {
    setCategories((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  const handleDownload = async () => {
    if (subtotal === 0) {
      showNotice('Please add at least one item with a rate before downloading.', 'info');
      return;
    }
    const custPhone = customer.phone.replace(/\D/g, '');
    if (custPhone.length !== 10) {
      showNotice('Customer phone must be exactly 10 digits.', 'info');
      document.getElementById('qm-cust-phone')?.focus();
      return;
    }
    const target = document.getElementById('print-area');
    if (!target) return;
    setDownloading(true);

    // Save to database asynchronously (POST for new, PUT fullEdit for ?edit=id)
    const payloadTotals = mode === 'multi'
      ? { subtotal, gst, total, totalDiscount, categoryTotals }
      : { subtotal, gst: includeGst ? subtotal * 0.18 : 0, total: includeGst ? subtotal * 1.18 : subtotal };
    let finalQuoteNo = project.quoteNo;
    if (editId) {
      fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          fullEdit: true,
          department,
          departmentName: mode === 'multi' ? 'Interior (Multi-Trade)' : config.name,
          mode,
          ...(mode === 'multi' ? { categories } : {}),
          customer,
          project,
          items,
          totals: payloadTotals,
          workType,
          terms: notes,
          inclusions: inclusionsText,
          ...(linkedVisitId ? { visitId: linkedVisitId } : {}),
        }),
      })
        .then(() => {
          showNotice('Quotation updated.', 'success');
          if (linkedVisitId) {
            fetch('/api/site-visits', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: linkedVisitId, quoteStatus: 'completed' }),
            }).catch(() => {});
          }
        })
        .catch(console.error);
    } else {
      // Await save so the PDF uses the server-assigned quotation number.
      try {
        const res = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department,
            departmentName: mode === 'multi' ? 'Interior (Multi-Trade)' : config.name,
            mode,
            ...(mode === 'multi' ? { categories } : {}),
            status: 'sent',
            customer,
            project,
            items,
            totals: payloadTotals,
            workType,
            terms: notes,
            inclusions: inclusionsText,
            ...(linkedVisitId ? { visitId: linkedVisitId } : {}),
          }),
        });
        const d = await res.json().catch(() => ({}));
        const assigned = d?.quotation?.project?.quoteNo;
        if (res.ok && assigned) finalQuoteNo = assigned;
        if (res.ok && assigned && assigned !== project.quoteNo) {
          setProject((p) => ({ ...p, quoteNo: assigned }));
          // Let the preview re-render with the assigned number before capture.
          await new Promise((r) => setTimeout(r, 150));
        }
        if (res.ok) {
          showNotice(`Quotation saved — ${assigned || project.quoteNo}.`, 'success');
          if (linkedVisitId) {
            fetch('/api/site-visits', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: linkedVisitId, quoteStatus: 'completed' }),
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    target.classList.add('qp-compact');
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const logoImg = target.querySelector('.qp-logo-img-wrap img') as HTMLImageElement | null;
      if (logoImg && logoSrc && !logoImg.src.startsWith('data:')) {
        logoImg.src = logoSrc;
      }
      await Promise.all(
        Array.from(target.querySelectorAll('img')).map(
          (img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  const onDone = () => resolve();
                  img.addEventListener('load', onDone, { once: true });
                  img.addEventListener('error', onDone, { once: true });
                  setTimeout(onDone, 5000);
                })
        )
      );
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });
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
      const ratio = maxW / canvas.width;
      const renderW = canvas.width * ratio;
      const fullRenderH = canvas.height * ratio;

      const totalPages = Math.ceil(fullRenderH / maxH);
      for (let i = 0; i < totalPages; i++) {
        const srcYCanvas = (i * maxH) / ratio;
        const srcHCanvas = Math.min(maxH / ratio, canvas.height - srcYCanvas);
        if (srcHCanvas <= 0) break;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(srcHCanvas);
        const sctx = sliceCanvas.getContext('2d');
        if (!sctx) break;
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sctx.drawImage(
          canvas as unknown as HTMLCanvasElement,
          0, srcYCanvas, canvas.width, srcHCanvas,
          0, 0, canvas.width, srcHCanvas
        );
        const sliceImg = sliceCanvas.toDataURL('image/png');
        const sliceRenderH = srcHCanvas * ratio;
        if (i > 0) pdf.addPage();
        pdf.addImage(sliceImg, 'PNG', margin, margin, renderW, sliceRenderH, undefined, 'FAST');
      }
      const safeQuote = (finalQuoteNo || 'quotation').replace(/[^\w-]/g, '_');
      pdf.save(`${safeQuote}.pdf`);
      trackQuotationPdfDownload({
        department,
        branch: customer.branch === 'ahmedabad' ? 'ahmedabad' : 'mumbai',
        cta: 'quotation_pdf_download',
        source: 'quotation_maker',
        project_type: project.type,
      });
    } catch (err) {
      console.error('PDF generation failed', err);
      showNotice('PDF generation failed. Please try again or use the browser print dialog.', 'error');
    } finally {
      target.classList.remove('qp-compact');
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const executeReset = () => {
    setIsResetConfirmOpen(false);
    const wt = workTypeOf(config, config.defaultWorkType);
    const t = joinLines(wt.terms);
    const inc = joinLines(wt.inclusions);
    setEditId(null);
    setLinkedVisitId(null);
    setCustomer(initialCustomer);
    setProject({ ...initialProject });
    setItems([]);
    setDraft(makeEmptyItem(config));
    setEditingId(null);
    setMode('single');
    setCategories([]);
    setActiveCatKey('');
    setPendingMode(null);
    setInclusionsText(inc);
    setNotes(t);
    setTermsBaseline(t);
    setInclusionsBaseline(inc);
    setWorkType(config.defaultWorkType);
    setActiveVariant(null);
    setActivePresetLabel(null);
    fetch('/api/quotation-counter')
      .then((r) => r.json())
      .then((data) => {
        if (data?.quoteNo) setProject((p) => ({ ...p, quoteNo: data.quoteNo }));
      })
      .catch(() => {});
  };

  const branch = getBranch(customer.branch);
  // Whoever is logged in signs the quotation. Branch contacts are only the
  // fallback for non-logged-in use — the maker itself requires an admin login.
  const signer =
    loginName ||
    (customer.branch.toLowerCase().includes('mumbai')
      ? 'Mahesh Prajapati'
      : 'Ramesh Prajapati');
  const ctaItems =
    department === 'furniture'
      ? [
          { icon: 'fa-calendar-check', title: 'Next step:', sub: `Book a free site visit Call ${tenantBrand?.phone || '+91 93218 12823'} — we measure on-site at no charge.` },
          { icon: 'fa-cube', title: 'See before you decide', sub: '3D design preview included with every confirmed order.' },
        ]
      : [
          { icon: 'fa-calendar-check', title: 'Next step:', sub: `Call ${tenantBrand?.phone || '+91 93218 12823'} to confirm this quotation.` },
          { icon: 'fa-cube', title: 'Quality checked', sub: 'Every order is inspected before handover.' },
        ];

  return (
    <div className="quotation-page">
      <div className="quotation-hero no-print">
        <CloseButton href={closeHref} />
        <h1>Quotation <span>Maker</span></h1>
        <p>Create a professional quotation for your customer — download as PDF in one click.</p>
      </div>

      <div className="quotation-page-layout no-print">
        {/* EDITOR (left) */}
        <div className="quotation-editor">
          {editId && (
            <div className="quotation-section" style={{ border: '1.5px solid #a27341', background: '#faf3e3' }}>
              <h3 className="quotation-section-title">
                <i className="fas fa-pen"></i> Editing {project.quoteNo || 'quotation'}
                {editLoading && <span className="qm-hint"> — loading…</span>}
              </h3>
              <p className="qm-hint">Changes will update the same quotation. Quote no is kept to preserve identity.</p>
              <button
                type="button"
                className="qm-cancel"
                onClick={() => {
                  setEditId(null);
                  setLinkedVisitId(null);
                  const params = new URLSearchParams(window.location.search);
                  params.delete('edit');
                  const qs = params.toString();
                  router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`);
                  showNotice('Edit mode off — new quotation.', 'info');
                }}
              >
                <i className="fas fa-times"></i> Exit edit mode
              </button>
            </div>
          )}

          <div className="quotation-section">
            <h3 className="quotation-section-title">Quotation type</h3>
            <div className="quotation-package-pills">
              <button
                type="button"
                className={`quotation-package-pill${mode === 'single' ? ' is-active' : ''}`}
                onClick={() => requestMode('single')}
                title="One trade per quotation (current behaviour)"
              >
                <i className="fas fa-hammer"></i> Single trade
              </button>
              <button
                type="button"
                className={`quotation-package-pill${mode === 'multi' ? ' is-active' : ''}`}
                onClick={() => requestMode('multi')}
                title="One quotation with many trades — Furniture, Electrical, Civil, Painting…"
              >
                <i className="fas fa-layer-group"></i> Interior package (multi-trade)
              </button>
            </div>
            {mode === 'multi' && (
              <p className="qm-hint">Add trade sections below. Each section keeps its own rates, room, discount &amp; tax — with section subtotals and one grand total. Approval creates one project with the same packages.</p>
            )}
          </div>

          {mode === 'single' ? (
            <DepartmentSelector
              value={department}
              onChange={requestDepartment}
              branchValue={customer.branch}
              branchOptions={branches.map((b) => b.label)}
              onBranchChange={(b) => setCustomer({ ...customer, branch: b })}
            />
          ) : (
            <div className="quotation-section">
              <h3 className="quotation-section-title">Department & Branch</h3>
              <div className="qm-grid2">
                <div className="qm-field">
                  <label className="qm-label"><i className="fas fa-briefcase"></i> Department</label>
                  <input className="qm-input" value="Interior (Multi-Trade)" disabled aria-label="Department" />
                </div>
                <div className="qm-field">
                  <label className="qm-label" htmlFor="qm-branch-multi"><i className="fas fa-code-branch"></i> Branch</label>
                  <QMSelect label="Select branch" value={customer.branch} options={branches.map((b) => b.label)} onChange={(b) => setCustomer({ ...customer, branch: b })} />
                </div>
              </div>
            </div>
          )}

          <div className="quotation-section">
            <h3 className="quotation-section-title">Customer Details</h3>
            <div className="qm-grid2">
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-cust-name"><i className="fas fa-user"></i> Customer name <span className="qm-req">*</span></label>
                <input
                  id="qm-cust-name"
                  type="text"
                  className="qm-input"
                  placeholder="e.g. Rahul Mehta"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-cust-phone"><i className="fas fa-phone"></i> Phone <span className="qm-req">*</span></label>
                <input
                  id="qm-cust-phone"
                  type="tel"
                  className="qm-input"
                  placeholder="10-digit mobile number"
                  value={customer.phone}
                  aria-invalid={customer.phone.length > 0 && customer.phone.length !== 10}
                  aria-describedby="qm-cust-phone-hint"
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
                <p id="qm-cust-phone-hint" className="qm-hint" style={{ margin: '0.15rem 0 0' }}>
                  {customer.phone.length === 0
                    ? 'Enter the 10-digit mobile number.'
                    : customer.phone.length !== 10
                      ? `Enter ${10 - customer.phone.length} more digit${10 - customer.phone.length === 1 ? '' : 's'} (${customer.phone.length}/10).`
                      : 'Looks good.'}
                </p>
              </div>
            </div>
            <div className="qm-field" style={{ marginBottom: '0.75rem' }}>
              <label className="qm-label" htmlFor="qm-cust-email"><i className="fas fa-envelope"></i> Email <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input
                id="qm-cust-email"
                type="email"
                className="qm-input"
                placeholder="customer@email.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
            <div className="qm-field">
              <label className="qm-label" htmlFor="qm-cust-addr"><i className="fas fa-map-marker-alt"></i> Site address</label>
              <textarea
                id="qm-cust-addr"
                className="qm-input"
                style={{ minHeight: 64 }}
                rows={2}
                placeholder="Flat / plot, road, area, city, PIN"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              />
            </div>
          </div>

          <div className="quotation-section">
            <h3 className="quotation-section-title">Project Info</h3>
            <div className="qm-grid2">
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-quote-no"><i className="fas fa-hashtag"></i> Quote no.</label>
                <input
                  id="qm-quote-no"
                  type="text"
                  className="qm-input"
                  value={project.quoteNo}
                  onChange={(e) => setProject({ ...project, quoteNo: e.target.value })}
                />
              </div>
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-date"><i className="fas fa-calendar"></i> Date</label>
                <input
                  id="qm-date"
                  type="date"
                  className="qm-input"
                  value={project.date}
                  onChange={(e) => setProject({ ...project, date: e.target.value })}
                />
              </div>
            </div>
            <div className="qm-grid2">
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-proj-type"><i className="fas fa-diagram-project"></i> Project type</label>
                <QMSelect
                  label="Project type"
                  value={project.type}
                  options={config.projectTypes}
                  onChange={(t) => setProject({ ...project, type: t })}
                />
              </div>
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-work-type"><i className="fas fa-helmet-safety"></i> Work type</label>
                <QMSelect
                  label="Work type"
                  value={config.workTypes.find((w) => w.value === workType)?.label || workType}
                  options={config.workTypes.map((w) => w.label)}
                  onChange={(label) => {
                    const hit = config.workTypes.find((w) => w.label === label);
                    if (hit) requestWorkType(hit.value);
                  }}
                />
              </div>
            </div>
            <div className="qm-grid2">
              <div className="qm-field">
                <label className="qm-label" htmlFor="qm-valid"><i className="fas fa-hourglass-half"></i> Valid till</label>
                <input
                  id="qm-valid"
                  type="date"
                  className="qm-input"
                  value={project.validTill}
                  onChange={(e) => setProject({ ...project, validTill: e.target.value })}
                />
              </div>
            </div>

            {mode === 'single' && config.quickStart && (
              <div className="quotation-package-pills">
                <span className="quotation-package-label">Quick start:</span>
                {config.quickStart.map((entry) => {
                  const isActive =
                    entry.variantKey !== null &&
                    entry.variantKey !== undefined &&
                    activeVariant === entry.variantKey &&
                    activePresetLabel === config.packages?.[entry.presetIndex]?.label;
                  return (
                    <button
                      type="button"
                      key={entry.label}
                      className={`quotation-package-pill${isActive ? ' is-active' : ''}`}
                      onClick={() => applyPackage(entry.presetIndex, entry.variantKey ?? null)}
                      title={`Fill items for ${entry.label}`}
                    >
                      <i className="fas fa-magic-wand-sparkles"></i> {entry.label}
                    </button>
                  );
                })}
              </div>
            )}
            {mode === 'single' && !config.quickStart && config.packages && (
              <div className="quotation-package-pills">
                <span className="quotation-package-label">Quick start:</span>
                {config.packages.map((pkg, i) => (
                  <button
                    type="button"
                    key={pkg.label}
                    className={`quotation-package-pill${activePresetLabel === pkg.label ? ' is-active' : ''}`}
                    onClick={() => applyPackage(i, null)}
                    title={`Fill items for ${pkg.label}`}
                  >
                    <i className="fas fa-magic-wand-sparkles"></i> {pkg.label}
                  </button>
                ))}
              </div>
            )}
            {mode === 'single' && config.variants && (
              <div className="quotation-package-pills">
                <span className="quotation-package-label">Rate variant:</span>
                {config.variants.map((v) => (
                  <button
                    type="button"
                    key={v.key}
                    className={`quotation-package-pill${activeVariant === v.key && !activePresetLabel ? ' is-active' : ''}`}
                    onClick={() => applyVariantToDraft(v.key)}
                    title={`Set draft to ${v.label}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {mode === 'multi' && (
            <div className="quotation-section">
              <h3 className="quotation-section-title">Add trade</h3>
              <p className="qm-hint">Pick a trade first — the item form below follows the selected section.</p>
              <AddTradePills categories={categories} onAdd={addCategory} />
            </div>
          )}

          <div className="quotation-section" id="line-items-form-anchor">
            <div className="quotation-section-head">
              <h3 className="quotation-section-title">
                {editingId !== null
                  ? 'Edit Item'
                  : mode === 'multi' && activeCat
                    ? `Add item — ${activeCat.label}${activeCat.room ? ` · ${activeCat.room}` : ''}`
                    : config.labels.itemsTitle}
              </h3>
            </div>
            <div className="quotation-items" style={{ border: 'none', background: 'transparent', overflow: 'visible' }}>
              <DynamicItemForm
                config={activeConfig}
                draft={draft}
                onChange={updateDraft}
                onSubmit={submitDraft}
                onBlurField={handleDraftBlur}
                submitLabel={editingId !== null ? 'Save Changes' : 'Submit'}
                datalistOptions={activeConfig.presets?.map((p) => p.name)}
                tradeExtras={mode === 'multi'}
                calcOverride={mode === 'multi' ? calcOfTrade(activeCat?.trade) : undefined}
              />
              {editingId !== null && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button type="button" className="qm-cancel" onClick={cancelEdit}>
                    <i className="fas fa-times"></i> Cancel editing
                  </button>
                </div>
              )}
            </div>

            {mode === 'multi' ? (
              <>
                {categories.length > 0 && (
                  <MultiTradeSections
                    hidePicker
                    categories={categories}
                    activeKey={activeCat?.key || ''}
                    onActive={(k) => {
                      setActiveCatKey(k);
                      setEditingId(null);
                      const cat = categories.find((c) => c.key === k);
                      setDraft(makeEmptyItem(configOfTrade(cat?.trade)));
                    }}
                    onAdd={addCategory}
                    onRemove={removeCategory}
                    onPatch={patchCategory}
                    items={items.filter((it) => it.name.trim() !== '')}
                    totalsByKey={totalsByKey}
                    onEdit={startEdit}
                    onDelete={removeItem}
                  />
                )}
                {items.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 4px 0', fontSize: 15 }}>
                    <strong>Quotation total: {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</strong>
                  </div>
                )}
              </>
            ) : (
              items.filter((it) => it.name.trim() !== '').length > 0 && (
                <DynamicItemsTable
                  config={config}
                  items={items.filter((it) => it.name.trim() !== '')}
                  variant="editor"
                  onEdit={startEdit}
                  onDelete={removeItem}
                />
              )
            )}

            <label className="qm-gst">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
              />
              <span className="qm-switch" aria-hidden="true"></span>
              <span>{mode === 'multi' ? 'Apply 18% GST where section/item tax is not set' : 'Include 18% GST'}</span>
            </label>
          </div>

          <div className="quotation-section">
            <h3 className="quotation-section-title">
              Terms &amp; Conditions
              {termsDirty && <span className="qm-badge"><i className="fas fa-pen"></i> customized</span>}
            </h3>
            <p className="qm-hint">Auto-filled from Work Type — one term per line. Edits are preserved when you change other fields.</p>
            <div className="qm-field">
              <label className="qm-label" htmlFor="qm-terms"><i className="fas fa-file-contract"></i> Terms &amp; conditions</label>
              <textarea
                id="qm-terms"
                className="qm-textarea"
                rows={8}
                placeholder="Payment terms, validity, scope…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="quotation-section">
            <h3 className="quotation-section-title">
              What&apos;s Included
              {inclusionsDirty && <span className="qm-badge"><i className="fas fa-pen"></i> customized</span>}
            </h3>
            <p className="qm-hint">Auto-filled from Work Type — one inclusion per line.</p>
            <div className="qm-field">
              <label className="qm-label" htmlFor="qm-inclusions"><i className="fas fa-list-check"></i> Inclusions</label>
              <textarea
                id="qm-inclusions"
                className="qm-textarea"
                rows={8}
                placeholder="What this quotation covers…"
                value={inclusionsText}
                onChange={(e) => setInclusionsText(e.target.value)}
              />
            </div>
          </div>

          <div className="qm-actions">
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
                  <i className="fas fa-download"></i> {editId ? 'Update & Download PDF' : 'Download PDF'}
                </>
              )}
            </button>
            <button type="button" className="qm-reset" onClick={handleReset}>
              <i className="fas fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        {/* PREVIEW (right) — also the print area */}
        <QuotationPreview
          config={config}
          departmentLabel={mode === 'multi' ? 'Interior (Multi-Trade)' : config.name}
          items={items.filter((it) => it.name.trim() || it.rate > 0)}
          customer={customer}
          project={project}
          branch={branch}
          tenantBrand={tenantBrand}
          logoSrc={logoSrc}
          totals={{ subtotal, gst, total, totalDiscount }}
          includeGst={includeGst}
          termsText={notes}
          inclusionsText={inclusionsText}
          signer={signer}
          ctaItems={ctaItems}
          categories={mode === 'multi' ? categories : null}
          categoryTotals={categoryTotals}
          fallbackTradeKey={activeCat?.key || categories[0]?.key}
        />
      </div>

      {notice && (
        <div
          role="status"
          className="no-print"
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            maxWidth: 'min(92vw, 400px)',
            padding: '1rem 1.3rem',
            borderRadius: '12px',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#fff',
            background: notice.type === 'error' ? '#dc3545' : notice.type === 'success' ? '#25D366' : '#1976D2',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          }}
        >
          <i
            className={`fas ${notice.type === 'error' ? 'fa-circle-exclamation' : notice.type === 'success' ? 'fa-check-circle' : 'fa-circle-info'}`}
            aria-hidden="true"
            style={{ fontSize: '1.25rem' }}
          />
          <span style={{ fontSize: '1.05rem' }}>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        message="Are you sure you want to"
        boldWord="Reset"
        afterBold="all quotation fields?"
        subtext="This will clear customer details, items, specifications, and terms. This action cannot be undone."
        confirmText="Yes, Reset"
        confirmButtonVariant="danger"
        onConfirm={executeReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={pendingDept !== null}
        message={`Switch to ${pendingDept ? DEPARTMENT_CONFIGS[pendingDept].name : ''}?`}
        afterBold="Current items will be cleared."
        subtext="Your edited Terms & Conditions will be replaced with the new department defaults."
        confirmText="Switch Department"
        confirmButtonVariant="primary"
        onConfirm={() => {
          if (pendingDept) applyDepartment(pendingDept);
          setPendingDept(null);
        }}
        onCancel={() => setPendingDept(null)}
      />

      <ConfirmationModal
        isOpen={pendingMode !== null}
        message={pendingMode === 'multi' ? 'Switch to Interior package (multi-trade)?' : 'Switch back to single trade?'}
        afterBold={pendingMode === 'multi' ? 'Items move into the first trade section.' : 'Trade sections are removed (items stay as one list).'}
        subtext="Your edited Terms & Conditions are kept."
        confirmText="Switch"
        confirmButtonVariant="primary"
        onConfirm={() => {
          if (pendingMode) applyMode(pendingMode);
          setPendingMode(null);
        }}
        onCancel={() => setPendingMode(null)}
      />

      <ConfirmationModal
        isOpen={pendingWorkType !== null}
        message="Change work type?"
        afterBold="Terms & Inclusions will reload."
        subtext="Your edited Terms & Conditions will be replaced with the new work-type defaults."
        confirmText="Load Defaults"
        confirmButtonVariant="primary"
        onConfirm={() => {
          if (pendingWorkType) loadWorkTypeDefaults(pendingWorkType);
          setPendingWorkType(null);
        }}
        onCancel={() => setPendingWorkType(null)}
      />
    </div>
  );
}
