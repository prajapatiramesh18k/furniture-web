import TeamPage from '../TeamPage';

export const metadata = { title: 'Employee List', robots: { index: false, follow: false } };

export default function AdminTeamEmployees() {
  return <TeamPage tab="employees" />;
}
