import TeamPage from '../TeamPage';

export const metadata = { title: 'Payroll & Settlement', robots: { index: false, follow: false } };

export default function AdminTeamPayroll() {
  return <TeamPage tab="payroll" />;
}
