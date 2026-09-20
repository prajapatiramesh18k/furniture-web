'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import { ModuleShell } from '@/components/admin/ModuleBits';
import { AdminToast } from '@/components/admin/AdminUI';
import ConfirmationModal from '@/components/ConfirmationModal';

interface WorkPackage {
  key: string;
  label: string;
  trade: string;
  room?: string;
  budgetValue: number;
  status?: string;
}

interface Project {
  _id: string;
  name: string;
  packages?: WorkPackage[];
  customer: { name: string; phone: string; email: string };
  siteId?: { _id: string; name: string; address: string } | string | null;
  quotationNo?: string;
  projectType?: string;
  status?: string;
  startDate?: string | null;
  expectedEnd?: string | null;
  budgetValue?: number;
  managerId?: { _id: string; name: string } | string | null;
  supervisorId?: { _id: string; name: string } | string | null;
  notes?: string;
}

interface Task { _id: string; title: string; category: string; status: string; priority: string; dueDate?: string | null; assignedTo?: { name: string } | null }
interface Expense { _id: string; category: string; materialName?: string; quantity?: number; unit?: string; amount: number; expenseDate: string; vendorId?: { company: string } | null; employeeId?: { name: string } | null; notes?: string }
interface Progress { _id: string; floor?: string; room?: string; category: string; photos: string[]; notes?: string; updateDate: string }
interface Invoice { _id: string; invoiceNo: string; total: number; paidTotal: number; status: string; issueDate: string; items: { name: string; quantity: number; rate: number; amount: number }[]; company?: { name: string; address: string; phone: string; email: string; gstNumber: string } }
interface Payment { _id: string; amount: number; method: string; paymentDate: string; notes?: string; invoiceId?: { invoiceNo: string } | null }
interface Emp { _id: string; name: string }
interface Vendor { _id: string; company: string }
interface Site { _id: string; name: string; address: string }
interface Measurement { _id: string; room: string; category: string; length: number; width: number; height: number; area: number; unit: string; notes?: string }

const PROJECT_STATUSES = ['planning', 'design', 'procurement', 'execution', 'finishing', 'completed', 'on_hold', 'cancelled'];
const EXP_CATS = ['material', 'labour', 'transport', 'contractor', 'misc'];
const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const idOf = (v: unknown) => (v && typeof v === 'object' && '_id' in (v as object) ? String((v as { _id: string })._id) : '');

async function api(url: string, opts?: RequestInit) {
  const res = await fetch(url, { cache: 'no-store', ...opts });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || 'Request failed');
  return d;
}

export default function ProjectDetail() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [printInv, setPrintInv] = useState<Invoice | null>(null);
  const [pendingInvoice, setPendingInvoice] = useState<{ inv: Invoice; status: string } | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ url: string; label: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const say = (m: string) => setNotice(m);

  // Forms
  const [ov, setOv] = useState({ status: 'planning', startDate: '', expectedEnd: '', managerId: '', supervisorId: '', siteId: '', notes: '' });
  const [taskF, setTaskF] = useState({ title: '', category: 'General', assignedTo: '', dueDate: '', priority: 'medium' });
  const [expF, setExpF] = useState({ category: 'material', materialName: '', quantity: '1', unit: '', amount: '', expenseDate: '', vendorId: '', employeeId: '', notes: '' });
  const [progF, setProgF] = useState({ floor: '', room: '', category: 'General', notes: '' });
  const [invItems, setInvItems] = useState([{ name: '', quantity: 1, rate: 0 }]);
  const [invF, setInvF] = useState({ discount: '', gst: '', dueDate: '', notes: '' });
  const [payF, setPayF] = useState({ amount: '', method: 'Cash', invoiceId: '', paymentDate: '', notes: '' });
  const [measF, setMeasF] = useState({ room: '', category: 'General', length: '', width: '', height: '', area: '', unit: 'ft', notes: '' });
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [siteF, setSiteF] = useState({ name: '', address: '', propertyType: 'Residence' });

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const load = useCallback(async () => {
    const d = await api(`/api/projects?id=${id}`);
    const p: Project = d.project;
    setProject(p);
    setOv({
      status: String(p.status || 'planning'),
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      expectedEnd: p.expectedEnd ? p.expectedEnd.split('T')[0] : '',
      managerId: idOf(p.managerId),
      supervisorId: idOf(p.supervisorId),
      siteId: idOf(p.siteId),
      notes: p.notes || '',
    });
    const [t, e, pr, iv, pay] = await Promise.all([
      api(`/api/tasks?projectId=${id}`).catch(() => ({ tasks: [] })),
      api(`/api/expenses?projectId=${id}`).catch(() => ({ expenses: [] })),
      api(`/api/progress?projectId=${id}`).catch(() => ({ updates: [] })),
      api(`/api/invoices?projectId=${id}`).catch(() => ({ invoices: [] })),
      api(`/api/project-payments?projectId=${id}`).catch(() => ({ payments: [] })),
    ]);
    setTasks(t.tasks || []);
    setExpenses(e.expenses || []);
    setProgress(pr.updates || []);
    setInvoices(iv.invoices || []);
    setPayments(pay.payments || []);
    const siteId = idOf(p.siteId);
    if (siteId) {
      api(`/api/measurements?siteId=${siteId}`).then((m) => setMeasurements(m.measurements || [])).catch(() => {});
    } else setMeasurements([]);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        flash(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
    api('/api/admin/employees?limit=500').then((d) => setEmps(Array.isArray(d) ? d : [])).catch(() => {});
    api('/api/vendors').then((d) => setVendors(d.vendors || [])).catch(() => {});
    api('/api/admin/sites').then((d) => setSites(Array.isArray(d) ? d : [])).catch(() => {});
  }, [load]);

  const money = useMemo(() => {
    const invoiced = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0);
    const paid = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.paidTotal, 0);
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const byCat: Record<string, number> = {};
    for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    const base = project?.budgetValue || invoiced;
    return { invoiced, paid, pending: invoiced - paid, spent, byCat, profit: invoiced - spent, margin: invoiced > 0 ? ((invoiced - spent) / invoiced) * 100 : 0, base };
  }, [invoices, expenses, project]);

  const taskPct = tasks.length ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100) : 0;

  const saveOverview = async (siteOverride?: string) => {
    setBusy(true);
    try {
      const d = await api('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: ov.status, startDate: ov.startDate || null, expectedEnd: ov.expectedEnd || null, managerId: ov.managerId || null, supervisorId: ov.supervisorId || null, siteId: siteOverride !== undefined ? siteOverride || null : ov.siteId || null, notes: ov.notes }),
      });
      setProject(d.project);
      flash('Project updated');
      load();
    } catch (e) {
      say(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const reloadSites = async () => {
    try {
      const d = await api('/api/admin/sites');
      if (Array.isArray(d)) setSites(d);
    } catch {}
  };

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteF.name.trim() || !siteF.address.trim()) return say('Site name and address are required');
    setBusy(true);
    try {
      // Property creation — GPS optional (geofence can be added later from Job Sites).
      const d = await api('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: siteF.name.trim(), address: siteF.address.trim(), propertyType: siteF.propertyType, clientName: project?.customer?.name || '' }),
      });
      const newId = String(d.site._id);
      await reloadSites();
      setOv((o) => ({ ...o, siteId: newId }));
      setShowSiteForm(false);
      setSiteF({ name: '', address: '', propertyType: 'Residence' });
      await saveOverview(newId);
      flash('Site created and attached');
    } catch (err) {
      say(err instanceof Error ? err.message : 'Site creation failed');
    } finally {
      setBusy(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskF.title.trim()) return;
    await api('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id, ...taskF, assignedTo: taskF.assignedTo || null, dueDate: taskF.dueDate || null }) });
    setTaskF({ title: '', category: 'General', assignedTo: '', dueDate: '', priority: 'medium' });
    load();
    flash('Task added');
  };

  const cycleTask = async (t: Task) => {
    const next = t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
    await api('/api/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t._id, status: next }) });
    load();
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expF.amount) return say('Amount is required');
    await api('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id, ...expF, amount: Number(expF.amount), quantity: Number(expF.quantity) || 1, vendorId: expF.vendorId || null, employeeId: expF.employeeId || null, expenseDate: expF.expenseDate || undefined }) });
    setExpF({ category: 'material', materialName: '', quantity: '1', unit: '', amount: '', expenseDate: '', vendorId: '', employeeId: '', notes: '' });
    load();
    flash('Expense recorded');
  };

  const addProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progF.notes.trim()) return say('Add a note for this update');
    await api('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id, ...progF }) });
    setProgF({ floor: '', room: '', category: 'General', notes: '' });
    load();
    flash('Progress posted');
  };

  const addMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const siteId = idOf(project?.siteId);
    if (!siteId) return say('Attach a site to this project first (Overview)');
    if (!measF.room.trim()) return say('Room is required');
    await api('/api/measurements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId, ...measF }) });
    setMeasF({ room: '', category: 'General', length: '', width: '', height: '', area: '', unit: 'ft', notes: '' });
    load();
    flash('Measurement saved');
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = invItems.filter((i) => i.name.trim() && Number(i.rate) > 0);
    if (!items.length) return say('Add at least one item with a rate');
    try {
      const d = await api('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, quotationId: (project as unknown as { quotationId?: string })?.quotationId || null, items, discount: Number(invF.discount) || 0, gst: Number(invF.gst) || 0, dueDate: invF.dueDate || null, notes: invF.notes }),
      });
      setInvItems([{ name: '', quantity: 1, rate: 0 }]);
      setInvF({ discount: '', gst: '', dueDate: '', notes: '' });
      load();
      flash(`Invoice ${d.invoice.invoiceNo} drafted`);
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  };

  const invoiceStatus = async () => {
    if (!pendingInvoice) return;
    const { inv, status } = pendingInvoice;
    setPendingInvoice(null);
    try {
      await api('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: inv._id, status }) });
      load();
      flash(`Invoice ${inv.invoiceNo} marked ${status}`);
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payF.amount) return say('Amount is required');
    try {
      await api('/api/project-payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id, amount: Number(payF.amount), method: payF.method, invoiceId: payF.invoiceId || null, paymentDate: payF.paymentDate || undefined, notes: payF.notes }) });
      setPayF({ amount: '', method: 'Cash', invoiceId: '', paymentDate: '', notes: '' });
      load();
      flash('Payment recorded');
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  const remove = async () => {
    if (!pendingRemove) return;
    const { url } = pendingRemove;
    setPendingRemove(null);
    try {
      await api(url, { method: 'DELETE' });
      load();
      flash('Deleted');
    } catch (err) {
      say(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Print mode: while the invoice sheet is open, printing outputs only the sheet.
  useEffect(() => {
    if (printInv) document.body.classList.add('ahf-print-invoice');
    else document.body.classList.remove('ahf-print-invoice');
    return () => document.body.classList.remove('ahf-print-invoice');
  }, [printInv]);

  if (loading) return <ModuleShell title="Project" sub="Loading…"><div className="ahf-skel" style={{ height: 200 }} /></ModuleShell>;
  if (!project) return <ModuleShell title="Project" sub="Not found"><div className="ahf-panel"><div className="ahf-panel-body"><Link href="/admin/projects" className="ahf-btn ahf-btn-ghost">Back to projects</Link></div></div></ModuleShell>;

  return (
    <ModuleShell
      title={project.name}
      sub={`${project.customer?.name || ''}${project.quotationNo ? ` · ${project.quotationNo}` : ''}`}
      action={<Link href="/admin/projects" className="ahf-btn ahf-btn-ghost ahf-btn-sm"><i className="fas fa-arrow-left"></i> All projects</Link>}
    >
      <AdminToast message={toast} />

      {/* Money strip */}
      <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', display: 'grid', marginBottom: 16 }}>
        {[
          { l: 'Budget / Quoted', v: inr(money.base) },
          { l: 'Invoiced', v: inr(money.invoiced) },
          { l: 'Collected', v: inr(money.paid) },
          { l: 'Pending', v: inr(money.pending) },
          { l: 'Expenses', v: inr(money.spent) },
          { l: `Profit (${Number(money.margin ?? 0).toFixed(0)}%)`, v: inr(money.profit) },
        ].map((s) => (
          <div className="ahf-stat" key={s.l}>
            <div className="ahf-stat-num" style={{ fontSize: 19 }}>{s.v}</div>
            <div className="ahf-stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Work packages (multi-trade quotations carry their categories over) */}
      {project.packages && project.packages.length > 0 && (
        <div className="ahf-panel" style={{ marginBottom: 16 }}>
          <div className="ahf-panel-head"><div><h3>Work packages ({project.packages.length})</h3><p>Trade-wise budgets from the approved quotation</p></div></div>
          <div className="ahf-panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {project.packages.map((p) => (
              <div key={p.key} style={{ border: '1px solid #eee3cd', borderRadius: 10, padding: '10px 12px', background: '#faf7ef' }}>
                <div style={{ fontWeight: 800 }}>{p.label}</div>
                {p.room && <div style={{ fontSize: 12, color: '#8a7a66' }}>{p.room}</div>}
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{inr(p.budgetValue)}</div>
                <div style={{ fontSize: 12, color: '#8a7a66' }}>{tasks.filter((t) => t.category === p.label && t.status === 'done').length}/{tasks.filter((t) => t.category === p.label).length} tasks done</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Overview</h3><p><StatusBadge status={String(project.status || '').replace('_', ' ')} /> · {taskPct}% tasks done</p></div></div>
        <div className="ahf-panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Status
            <UIDropdown
              label="Project status"
              value={ov.status}
              options={PROJECT_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
              onChange={(v) => setOv({ ...ov, status: v })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Start
            <input type="date" className="ahf-input" value={ov.startDate} onChange={(e) => setOv({ ...ov, startDate: e.target.value })} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Expected end
            <input type="date" className="ahf-input" value={ov.expectedEnd} onChange={(e) => setOv({ ...ov, expectedEnd: e.target.value })} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Site / Property
            <UIDropdown
              label="Site / Property"
              value={ov.siteId}
              placeholder="No site attached"
              options={[{ value: '', label: 'No site attached' }, ...sites.map((s) => ({ value: s._id, label: s.name }))]}
              onChange={(v) => setOv({ ...ov, siteId: v })}
            />
            <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" style={{ marginTop: 6, alignSelf: 'flex-start' }} onClick={() => setShowSiteForm((v) => !v)}>
              <i className={`fas ${showSiteForm ? 'fa-chevron-up' : 'fa-plus'}`}></i> {showSiteForm ? 'Hide' : 'Create new site'}
            </button>
          </label>
          {showSiteForm && (
            <form onSubmit={createSite} style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap', background: '#faf7ef', border: '1px solid #eee3cd', borderRadius: 10, padding: 10 }}>
              <input className="ahf-input" style={{ flex: '2 1 180px' }} value={siteF.name} onChange={(e) => setSiteF({ ...siteF, name: e.target.value })} placeholder="Site name * — e.g. Rahul Residence" />
              <input className="ahf-input" style={{ flex: '2 1 220px' }} value={siteF.address} onChange={(e) => setSiteF({ ...siteF, address: e.target.value })} placeholder="Site address *" />
              <UIDropdown
                label="Property type"
                value={siteF.propertyType}
                style={{ flex: '1 1 130px' }}
                options={['Residence', 'Office', 'Shop', 'Villa', 'Flat', 'Plot', 'Other']}
                onChange={(v) => setSiteF({ ...siteF, propertyType: v })}
              />
              <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={busy}><i className="fas fa-check"></i> {busy ? 'Saving…' : 'Create & attach'}</button>
            </form>
          )}
          {emps.length > 0 && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Manager
                <UIDropdown
                  label="Manager"
                  value={ov.managerId}
                  placeholder="—"
                  options={[{ value: '', label: '—' }, ...emps.map((x) => ({ value: x._id, label: x.name }))]}
                  onChange={(v) => setOv({ ...ov, managerId: v })}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Supervisor
                <UIDropdown
                  label="Supervisor"
                  value={ov.supervisorId}
                  placeholder="—"
                  options={[{ value: '', label: '—' }, ...emps.map((x) => ({ value: x._id, label: x.name }))]}
                  onChange={(v) => setOv({ ...ov, supervisorId: v })}
                />
              </label>
            </>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, gridColumn: '1 / -1' }}>Notes
            <input className="ahf-input" value={ov.notes} onChange={(e) => setOv({ ...ov, notes: e.target.value })} placeholder="Project notes…" />
          </label>
          <div><button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={busy} onClick={() => saveOverview()}><i className="fas fa-check"></i> {busy ? 'Saving…' : 'Save overview'}</button></div>
        </div>
      </div>

      {/* Tasks */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Tasks ({tasks.filter((t) => t.status === 'done').length}/{tasks.length})</h3></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={addTask} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <input className="ahf-input" style={{ flex: '2 1 200px' }} value={taskF.title} onChange={(e) => setTaskF({ ...taskF, title: e.target.value })} placeholder="New task — e.g. False ceiling living room" />
            <input className="ahf-input" style={{ flex: '1 1 130px' }} value={taskF.category} onChange={(e) => setTaskF({ ...taskF, category: e.target.value })} placeholder="Category" />
            <input type="date" className="ahf-input" value={taskF.dueDate} onChange={(e) => setTaskF({ ...taskF, dueDate: e.target.value })} />
            <button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-plus"></i> Add</button>
          </form>
          {tasks.map((t) => (
            <div key={t._id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0e7d4' }}>
              <button onClick={() => cycleTask(t)} title="Advance status" style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #a27341', background: t.status === 'done' ? '#2e7d4f' : t.status === 'in_progress' ? '#e8b23f' : '#fff', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
                {t.status === 'done' ? '✓' : ''}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#8a7a66' }}>{t.category}{t.assignedTo?.name ? ` · ${t.assignedTo.name}` : ''}{t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</div>
              </div>
              <StatusBadge status={t.status.replace('_', ' ')} />
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingRemove({ url: `/api/tasks?id=${t._id}`, label: 'task' })}><i className="fas fa-trash"></i></button>
            </div>
          ))}
          {tasks.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No tasks yet.</p>}
        </div>
      </div>

      {/* Expenses */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Expenses · {inr(money.spent)}</h3><p>{Object.entries(money.byCat).map(([k, v]) => `${k}: ${inr(v)}`).join(' · ') || 'Nothing recorded'}</p></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={addExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 12 }}>
            <UIDropdown
              label="Expense category"
              value={expF.category}
              options={EXP_CATS.map((c) => ({ value: c, label: c }))}
              onChange={(v) => setExpF({ ...expF, category: v })}
            />
            <input className="ahf-input" value={expF.materialName} onChange={(e) => setExpF({ ...expF, materialName: e.target.value })} placeholder="Material / detail" />
            <input className="ahf-input" value={expF.quantity} onChange={(e) => setExpF({ ...expF, quantity: e.target.value })} placeholder="Qty" />
            <input className="ahf-input" value={expF.unit} onChange={(e) => setExpF({ ...expF, unit: e.target.value })} placeholder="Unit (sqft, pcs…)" />
            <input className="ahf-input" required value={expF.amount} onChange={(e) => setExpF({ ...expF, amount: e.target.value })} placeholder="Amount ₹ *" inputMode="decimal" />
            <input type="date" className="ahf-input" value={expF.expenseDate} onChange={(e) => setExpF({ ...expF, expenseDate: e.target.value })} />
            {vendors.length > 0 && (
              <UIDropdown
                label="Vendor"
                value={expF.vendorId}
                placeholder="Vendor (optional)"
                options={[{ value: '', label: 'Vendor (optional)' }, ...vendors.map((v) => ({ value: v._id, label: v.company }))]}
                onChange={(v) => setExpF({ ...expF, vendorId: v })}
              />
            )}
            <input className="ahf-input" value={expF.notes} onChange={(e) => setExpF({ ...expF, notes: e.target.value })} placeholder="Notes" />
            <div><button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-plus"></i> Add expense</button></div>
          </form>
          {expenses.slice(0, 20).map((x) => (
            <div key={x._id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: '1px solid #f0e7d4', fontSize: 13 }}>
              <span style={{ flex: 1 }}><strong style={{ textTransform: 'capitalize' }}>{x.category}</strong> · {x.materialName || '—'}{(x.quantity || 1) > 1 ? ` × ${x.quantity}${x.unit ? ` ${x.unit}` : ''}` : ''}{x.vendorId?.company ? ` · ${x.vendorId.company}` : ''}{x.employeeId?.name ? ` · ${x.employeeId.name}` : ''}</span>
              <strong>{inr(x.amount)}</strong>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingRemove({ url: `/api/expenses?id=${x._id}`, label: 'expense' })}><i className="fas fa-trash"></i></button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Site progress ({progress.length})</h3><p>Before / during / after — room by room</p></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={addProgress} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <input className="ahf-input" style={{ flex: '1 1 110px' }} value={progF.floor} onChange={(e) => setProgF({ ...progF, floor: e.target.value })} placeholder="Floor" />
            <input className="ahf-input" style={{ flex: '1 1 130px' }} value={progF.room} onChange={(e) => setProgF({ ...progF, room: e.target.value })} placeholder="Room" />
            <input className="ahf-input" style={{ flex: '1 1 130px' }} value={progF.category} onChange={(e) => setProgF({ ...progF, category: e.target.value })} placeholder="Work category" />
            <input className="ahf-input" style={{ flex: '2 1 220px' }} value={progF.notes} onChange={(e) => setProgF({ ...progF, notes: e.target.value })} placeholder="What changed on site? *" />
            <button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-camera"></i> Post update</button>
          </form>
          {progress.map((u) => (
            <div key={u._id} style={{ padding: '8px 0', borderTop: '1px solid #f0e7d4', fontSize: 13 }}>
              <div><strong>{[u.floor, u.room].filter(Boolean).join(' · ') || u.category}</strong> <span style={{ color: '#8a7a66' }}>· {new Date(u.updateDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
              {u.notes && <div style={{ marginTop: 2 }}>{u.notes}</div>}
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" style={{ marginTop: 4 }} onClick={() => setPendingRemove({ url: `/api/progress?id=${u._id}`, label: 'update' })}><i className="fas fa-trash"></i></button>
            </div>
          ))}
          {progress.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No updates yet.</p>}
        </div>
      </div>

      {/* Measurements */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Measurements ({measurements.length})</h3><p>{idOf(project.siteId) ? 'From the attached site — reusable for quotations' : 'Attach a site in Overview first'}</p></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={addMeasurement} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <input className="ahf-input" style={{ flex: '1 1 130px' }} value={measF.room} onChange={(e) => setMeasF({ ...measF, room: e.target.value })} placeholder="Room *" />
            <input className="ahf-input" style={{ flex: '1 1 110px' }} value={measF.category} onChange={(e) => setMeasF({ ...measF, category: e.target.value })} placeholder="Category" />
            <input className="ahf-input" style={{ flex: '1 1 70px' }} value={measF.length} onChange={(e) => setMeasF({ ...measF, length: e.target.value })} placeholder="L" inputMode="decimal" />
            <input className="ahf-input" style={{ flex: '1 1 70px' }} value={measF.width} onChange={(e) => setMeasF({ ...measF, width: e.target.value })} placeholder="W" inputMode="decimal" />
            <input className="ahf-input" style={{ flex: '1 1 70px' }} value={measF.height} onChange={(e) => setMeasF({ ...measF, height: e.target.value })} placeholder="H" inputMode="decimal" />
            <input className="ahf-input" style={{ flex: '2 1 150px' }} value={measF.notes} onChange={(e) => setMeasF({ ...measF, notes: e.target.value })} placeholder="Notes" />
            <button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-ruler"></i> Save</button>
          </form>
          {measurements.map((m) => (
            <div key={m._id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: '1px solid #f0e7d4', fontSize: 13 }}>
              <span style={{ flex: 1 }}><strong>{m.room}</strong> · {m.category} · {m.length}×{m.width}{m.height ? `×${m.height}` : ''} {m.unit}{m.area ? ` = ${m.area} sq ${m.unit}` : ''}</span>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingRemove({ url: `/api/measurements?id=${m._id}`, label: 'measurement' })}><i className="fas fa-trash"></i></button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Invoices · {inr(money.invoiced)} billed</h3></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={createInvoice} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invItems.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="ahf-input" style={{ flex: '2 1 160px' }} value={it.name} onChange={(e) => setInvItems(invItems.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Item" />
                <input className="ahf-input" style={{ flex: '1 1 70px' }} value={it.quantity} onChange={(e) => setInvItems(invItems.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) || 1 } : x)))} placeholder="Qty" inputMode="numeric" />
                <input className="ahf-input" style={{ flex: '1 1 90px' }} value={it.rate} onChange={(e) => setInvItems(invItems.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) || 0 } : x)))} placeholder="Rate ₹" inputMode="decimal" />
                {invItems.length > 1 && <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setInvItems(invItems.filter((_, j) => j !== i))}><i className="fas fa-times"></i></button>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setInvItems([...invItems, { name: '', quantity: 1, rate: 0 }])}><i className="fas fa-plus"></i> Item</button>
              <input className="ahf-input" style={{ maxWidth: 120 }} value={invF.discount} onChange={(e) => setInvF({ ...invF, discount: e.target.value })} placeholder="Discount ₹" inputMode="decimal" />
              <input className="ahf-input" style={{ maxWidth: 120 }} value={invF.gst} onChange={(e) => setInvF({ ...invF, gst: e.target.value })} placeholder="GST ₹" inputMode="decimal" />
              <input type="date" className="ahf-input" style={{ maxWidth: 160 }} value={invF.dueDate} onChange={(e) => setInvF({ ...invF, dueDate: e.target.value })} />
              <button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-file-invoice"></i> Create invoice</button>
            </div>
          </form>
          {invoices.map((inv) => (
            <div key={inv._id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0e7d4', fontSize: 13, flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 180px' }}><strong>{inv.invoiceNo}</strong> · {inr(inv.total)} · paid {inr(inv.paidTotal)}</span>
              <StatusBadge status={inv.status} />
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPrintInv(inv)}><i className="fas fa-print"></i> Print</button>
              {inv.status === 'draft' && <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingInvoice({ inv, status: 'sent' })}><i className="fas fa-paper-plane"></i> Send</button>}
              {['sent', 'partial'].includes(inv.status) && <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingInvoice({ inv, status: 'cancelled' })}><i className="fas fa-ban"></i> Cancel</button>}
            </div>
          ))}
          {invoices.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No invoices yet.</p>}
        </div>
      </div>

      {/* Payments */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Payments · {inr(money.paid)} collected</h3></div></div>
        <div className="ahf-panel-body">
          <form onSubmit={addPayment} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <input className="ahf-input" style={{ flex: '1 1 120px' }} required value={payF.amount} onChange={(e) => setPayF({ ...payF, amount: e.target.value })} placeholder="Amount ₹ *" inputMode="decimal" />
            <UIDropdown
              label="Payment method"
              value={payF.method}
              style={{ flex: '1 1 120px' }}
              options={['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card']}
              onChange={(v) => setPayF({ ...payF, method: v })}
            />
            {invoices.length > 0 && (
              <UIDropdown
                label="Against invoice"
                value={payF.invoiceId}
                placeholder="Against invoice…"
                style={{ flex: '1 1 140px' }}
                options={[
                  { value: '', label: 'Against invoice…' },
                  ...invoices.filter((i) => i.status !== 'cancelled').map((i) => ({ value: i._id, label: `${i.invoiceNo} · ${inr(i.total - i.paidTotal)} due` })),
                ]}
                onChange={(v) => setPayF({ ...payF, invoiceId: v })}
              />
            )}
            <input type="date" className="ahf-input" value={payF.paymentDate} onChange={(e) => setPayF({ ...payF, paymentDate: e.target.value })} />
            <input className="ahf-input" style={{ flex: '1 1 140px' }} value={payF.notes} onChange={(e) => setPayF({ ...payF, notes: e.target.value })} placeholder="Notes (advance, stage…)" />
            <button className="ahf-btn ahf-btn-primary ahf-btn-sm"><i className="fas fa-indian-rupee-sign"></i> Record</button>
          </form>
          {payments.map((p) => (
            <div key={p._id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: '1px solid #f0e7d4', fontSize: 13 }}>
              <span style={{ flex: 1 }}><strong>{inr(p.amount)}</strong> · {p.method}{p.invoiceId?.invoiceNo ? ` · ${p.invoiceId.invoiceNo}` : ''} · {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{p.notes ? ` · ${p.notes}` : ''}</span>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingRemove({ url: `/api/project-payments?id=${p._id}`, label: 'payment' })}><i className="fas fa-trash"></i></button>
            </div>
          ))}
          {payments.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No payments recorded.</p>}
        </div>
      </div>

      {printInv && (
        <div className="ahf-panel invoice-sheet">
          <div className="ahf-panel-head">
            <div><h3>{printInv.invoiceNo}</h3><p>Use the browser print dialog → Save as PDF</p></div>
            <span className="no-print" style={{ display: 'flex', gap: 8 }}>
              <button className="ahf-btn ahf-btn-primary ahf-btn-sm" onClick={() => window.print()}><i className="fas fa-print"></i> Print / PDF</button>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPrintInv(null)}><i className="fas fa-times"></i></button>
            </span>
          </div>
          <div className="ahf-panel-body" style={{ background: '#fff', color: '#000' }}>
            <h2 style={{ margin: '0 0 4px' }}>{printInv.company?.name || project.name}</h2>
            <p style={{ margin: 0, fontSize: 13 }}>{[printInv.company?.address, printInv.company?.phone, printInv.company?.email, printInv.company?.gstNumber ? `GST: ${printInv.company.gstNumber}` : ''].filter(Boolean).join(' · ')}</p>
            <hr />
            <p style={{ fontSize: 13 }}><strong>Invoice:</strong> {printInv.invoiceNo} · <strong>Date:</strong> {new Date(printInv.issueDate).toLocaleDateString('en-IN')} · <strong>Bill to:</strong> {project.customer?.name} {project.customer?.phone}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr><th style={{ textAlign: 'left', borderBottom: '1px solid #000' }}>Item</th><th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Qty</th><th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Rate</th><th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Amount</th></tr></thead>
              <tbody>
                {printInv.items.map((it, i) => (
                  <tr key={i}><td>{it.name}</td><td style={{ textAlign: 'right' }}>{it.quantity}</td><td style={{ textAlign: 'right' }}>{inr(it.rate)}</td><td style={{ textAlign: 'right' }}>{inr(it.amount)}</td></tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', fontSize: 14, fontWeight: 800 }}>Total: {inr(printInv.total)} · Paid: {inr(printInv.paidTotal)} · Due: {inr(printInv.total - printInv.paidTotal)}</p>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!pendingInvoice}
        message={pendingInvoice ? `Mark invoice ${pendingInvoice.inv.invoiceNo} as ${pendingInvoice.status}?` : ''}
        confirmText="Yes, Confirm"
        confirmButtonVariant={pendingInvoice?.status === 'cancelled' ? 'danger' : 'primary'}
        onConfirm={invoiceStatus}
        onCancel={() => setPendingInvoice(null)}
      />

      <ConfirmationModal
        isOpen={!!pendingRemove}
        message={pendingRemove ? `Delete this ${pendingRemove.label}? This cannot be undone.` : ''}
        confirmText="Yes, Delete"
        confirmButtonVariant="danger"
        onConfirm={remove}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmationModal
        isOpen={!!notice}
        message={notice || ''}
        confirmText="Got it"
        cancelText="Close"
        confirmButtonVariant="primary"
        onConfirm={() => setNotice(null)}
        onCancel={() => setNotice(null)}
      />
    </ModuleShell>
  );
}
