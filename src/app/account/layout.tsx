import type { ReactNode } from 'react';
import CustomerShell from '@/components/admin/CustomerShell';
import '@/components/admin/admin.css';

export const metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
