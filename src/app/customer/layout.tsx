import type { ReactNode } from 'react';
import CustomerShell from '@/components/admin/CustomerShell';
import '@/components/admin/admin.css';

export const metadata = {
  title: 'Customer Settings',
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
