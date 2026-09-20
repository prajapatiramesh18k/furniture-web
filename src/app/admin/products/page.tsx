'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminField, AdminFormGrid, AdminModalFooter } from '@/components/admin/AdminUI';
import UIDropdown from '@/components/UIDropdown';
import { SuggestInput } from '@/components/quotation/DynamicItemForm';
import ConfirmationModal from '@/components/ConfirmationModal';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
  image: string;
  sku?: string;
  stock?: number;
  status?: string;
}

const EMPTY_FORM = { name: '', price: '', originalPrice: '', rating: '4.0', category: '', description: '', sku: '', stock: '10', status: 'active' };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(), [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.sku || ''} ${p.category}`.toLowerCase().includes(q)) return false;
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      const stock = p.stock ?? 10;
      if (stockFilter === 'in' && stock <= 0) return false;
      if (stockFilter === 'low' && (stock <= 0 || stock > 5)) return false;
      if (stockFilter === 'out' && stock > 0) return false;
      if (priceFilter === 'u10k' && p.price >= 10000) return false;
      if (priceFilter === '10to25' && (p.price < 10000 || p.price > 25000)) return false;
      if (priceFilter === 'ab25k' && p.price <= 25000) return false;
      return true;
    });
  }, [products, search, catFilter, stockFilter, priceFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(filtered, 10, [search, catFilter, stockFilter, priceFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || 'pooja-units' });
    setImage('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice),
      rating: String(p.rating), category: p.category, description: p.description || '',
      sku: p.sku || '', stock: String(p.stock ?? 10), status: p.status || 'active',
    });
    setImage(p.image);
    setShowForm(true);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { alert('Image must be under 4MB'); return; }
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) { alert('Please select a product image'); return; }
    if (!form.category.trim()) { alert('Please enter a category'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name, price: Number(form.price), originalPrice: Number(form.originalPrice) || Number(form.price),
        rating: Number(form.rating), category: form.category, description: form.description,
        image, sku: form.sku, stock: Number(form.stock) || 0, status: form.status,
      };
      if (editing) body.id = editing._id;
      const res = await fetch('/api/admin/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Save failed');
      setShowForm(false);
      load();
      flash(editing ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string) => {
    setConfirm({
      msg: 'Are you sure you want to delete this product? This cannot be undone.',
      action: async () => {
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        load();
        flash('Product deleted successfully!');
      },
    });
  };

  const stockLabel = (s: number) => (s <= 0 ? 'Out of Stock' : s <= 5 ? 'Low Stock' : 'In Stock');

  return (
    <ModuleShell
      title="Product Management"
      sub={`${products.length} products in catalog`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <AdminToast message={toast} />

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Category filter"
              value={catFilter}
              options={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c.replace(/-/g, ' ') }))]}
              onChange={setCatFilter}
            />
            <UIDropdown
              label="Stock filter"
              value={stockFilter}
              options={[
                { value: 'all', label: 'All Stock' },
                { value: 'in', label: 'In Stock' },
                { value: 'low', label: 'Low Stock (≤ 5)' },
                { value: 'out', label: 'Out of Stock' },
              ]}
              onChange={setStockFilter}
            />
            <UIDropdown
              label="Price filter"
              value={priceFilter}
              options={[
                { value: 'all', label: 'All Prices' },
                { value: 'u10k', label: 'Under ₹10,000' },
                { value: '10to25', label: '₹10k – ₹25k' },
                { value: 'ab25k', label: 'Above ₹25,000' },
              ]}
              onChange={setPriceFilter}
            />
            <button
              className="ahf-btn ahf-btn-primary ahf-btn-sm"
              onClick={openAdd}
              style={{ marginLeft: 'auto' }}
            >
              <i className="fas fa-plus"></i> Create
            </button>
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Products ({filtered.length})</h3></div>
        </div>
        <DataTable
          columns={[
            {
              key: 'prod', header: 'Product',
              render: (p) => (
                <div className="ahf-prod-cell">
                  <img src={p.image} alt={p.name} />
                  <div><strong>{p.name}</strong><div style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>SKU: {p.sku || '—'}</div></div>
                </div>
              ),
            },
            { key: 'cat', header: 'Category', render: (p) => <span style={{ textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</span> },
            { key: 'price', header: 'Price', render: (p) => <span className="ahf-amt">₹{Number(p.price).toLocaleString('en-IN')}</span> },
            { key: 'stock', header: 'Stock', render: (p) => <StatusBadge status={stockLabel(p.stock ?? 10)} /> },
            { key: 'status', header: 'Status', render: (p) => <StatusBadge status={(p.status || 'active') === 'active' ? 'Active' : p.status!} /> },
            {
              key: 'actions', header: 'Actions',
              render: (p) => (
                <div className="ahf-row-actions">
                  <button className="ahf-mini-btn" title="View" onClick={() => setViewing(p)}><i className="fas fa-eye"></i></button>
                  <button className="ahf-mini-btn" title="Edit" onClick={() => openEdit(p)}><i className="fas fa-pen"></i></button>
                  <button className="ahf-mini-btn danger" title="Delete" onClick={() => remove(p._id)}><i className="fas fa-trash"></i></button>
                </div>
              ),
            },
          ]}
          rows={loading ? [] : paged}
          emptyText="No products match your filters."
          minWidth={820}
          loading={loading}
        />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={filtered.length} onPage={setPage} />
        )}
      </div>

      {showForm && (
        <AdminModal
          eyebrow={editing ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
          title={editing ? 'Edit Product' : 'Add New Product'}
          subtitle={editing ? 'Update details — changes go live on save' : 'Appears in the catalog on save'}
          onClose={() => !saving && setShowForm(false)}
          busy={saving}
          width={720}
        >
          <form onSubmit={save}>
            <AdminFormGrid>
              <AdminField label="Product name *">
                <input className="ahf-input" placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </AdminField>
              <AdminField label="SKU">
                <input className="ahf-input" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </AdminField>
              <AdminField label="Price (₹) *">
                <input className="ahf-input" type="number" min={0} placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </AdminField>
              <AdminField label="Original price (₹)">
                <input className="ahf-input" type="number" min={0} placeholder="Original price (₹)" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
              </AdminField>
              <AdminField label="Stock">
                <input className="ahf-input" type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </AdminField>
              <AdminField label="Category *">
                <SuggestInput
                  label="Category"
                  value={form.category}
                  suggestions={categories}
                  placeholder="Category *"
                  inputClassName="ahf-input"
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </AdminField>
              <AdminField label="Status">
                <UIDropdown
                  label="Product status"
                  value={form.status}
                  options={[{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }]}
                  onChange={(v) => setForm({ ...form, status: v })}
                />
              </AdminField>
              <AdminField label="Rating">
                <input className="ahf-input" type="number" min={0} max={5} step={0.1} placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </AdminField>
            </AdminFormGrid>
            <AdminField label="Description" style={{ marginBottom: 16 }}>
              <textarea className="ahf-input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </AdminField>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <label className="ahf-btn ahf-btn-ghost ahf-btn-sm" style={{ cursor: 'pointer' }}>
                <i className="fas fa-image"></i> {image ? 'Change Image' : 'Select Image'}
                <input type="file" accept="image/*" hidden onChange={onFile} />
              </label>
              {image && <img src={image} alt="preview" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover' }} />}
            </div>
            <AdminModalFooter>
              <button type="button" className="ahf-btn ahf-btn-ghost" disabled={saving} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="ahf-btn ahf-btn-primary" disabled={saving}>
                <i className="fas fa-check"></i> {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </AdminModalFooter>
          </form>
        </AdminModal>
      )}

      {viewing && (
        <AdminModal
          eyebrow="PRODUCT"
          title={viewing.name}
          subtitle={viewing.sku ? `SKU: ${viewing.sku}` : undefined}
          onClose={() => setViewing(null)}
          width={640}
        >
          <img src={viewing.image} alt={viewing.name} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />
          <p style={{ color: 'var(--ahf-muted)', fontSize: 13, margin: '0 0 12px' }}>{viewing.description || 'No description.'}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <StatusBadge status={viewing.category} />
            <StatusBadge status={stockLabel(viewing.stock ?? 10)} />
            <span className="ahf-amt">₹{Number(viewing.price).toLocaleString('en-IN')}</span>
          </div>
          <AdminModalFooter>
            <button className="ahf-btn ahf-btn-ghost" onClick={() => setViewing(null)}>Close</button>
            <button className="ahf-btn ahf-btn-primary" onClick={() => { openEdit(viewing); setViewing(null); }}>Edit</button>
          </AdminModalFooter>
        </AdminModal>
      )}

      <ConfirmationModal
        isOpen={!!confirm}
        message={confirm?.msg || ''}
        confirmText="Yes, Delete"
        confirmButtonVariant="danger"
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </ModuleShell>
  );
}
