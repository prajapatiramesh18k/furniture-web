const STATUS_CLASS: Record<string, string> = {
  paid: 'ahf-b-paid',
  delivered: 'ahf-b-delivered',
  approved: 'ahf-b-approved',
  active: 'ahf-b-active',
  'in stock': 'ahf-b-instock',
  pending: 'ahf-b-pending',
  'new order': 'ahf-b-new',
  new: 'ahf-b-new',
  processing: 'ahf-b-processing',
  shipped: 'ahf-b-shipped',
  cancelled: 'ahf-b-cancelled',
  rejected: 'ahf-b-rejected',
  'out of stock': 'ahf-b-outofstock',
  draft: 'ahf-b-draft',
};

export default function StatusBadge({ status }: { status: string }) {
  const key = String(status || '').toLowerCase();
  const cls = STATUS_CLASS[key] || 'ahf-b-default';
  return <span className={`ahf-badge ${cls}`}>{status || '—'}</span>;
}
