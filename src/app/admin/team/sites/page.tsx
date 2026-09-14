import TeamPage from '../TeamPage';

export const metadata = { title: 'Job Sites', robots: { index: false, follow: false } };

export default function AdminTeamSites() {
  return <TeamPage tab="sites" />;
}
