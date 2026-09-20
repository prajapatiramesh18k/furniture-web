import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import AdminShell from '@/components/admin/AdminShell';
import '@/components/admin/admin.css';

export const metadata = {
  title: 'Super Admin',
  robots: { index: false, follow: false },
};

/**
 * Platform administration — super admins only, never tenant owners.
 * Uses the SAME fixed navbar + fixed left sidebar shell as /admin
 * (no layout switch). Content area alone changes.
 */
export default async function SuperLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const token = jar.get('auth-token')?.value;
  if (!token) redirect('/login?next=/super');
  const decoded = verifyToken(token);
  if (!decoded) redirect('/login?next=/super');
  await dbConnect();
  const user = await User.findById(decoded.userId).select('role isSuperAdmin active').lean();
  const isSuper = user && user.active !== false && (user.isSuperAdmin === true || user.role === 'super_admin');
  if (!isSuper) redirect('/access-denied');

  return <AdminShell>{children}</AdminShell>;
}
