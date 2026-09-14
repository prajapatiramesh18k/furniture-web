import { redirect } from 'next/navigation';

export default function AdminTeamIndex() {
  redirect('/admin/team/employees');
}
