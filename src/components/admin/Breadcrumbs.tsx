import Link from 'next/link';

export default function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {trail.map((t, i) => (
        <span key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {i > 0 && <span style={{ color: '#aab4cc' }}>/</span>}
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span style={{ color: 'var(--ahf-ink)', fontWeight: 600 }}>{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}
