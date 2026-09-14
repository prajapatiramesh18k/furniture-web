import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/components/admin/admin.css';

export const metadata = {
  title: 'Admin Portal',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
