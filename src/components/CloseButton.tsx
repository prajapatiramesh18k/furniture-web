'use client';

export default function CloseButton({ href }: { href: string }) {
  return (
    <a href={href} className="close-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </a>
  );
}
