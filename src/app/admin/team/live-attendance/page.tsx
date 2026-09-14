import TeamPage from '../TeamPage';

export const metadata = { title: 'Live Attendance', robots: { index: false, follow: false } };

export default function AdminTeamAttendance() {
  return <TeamPage tab="live-attendance" />;
}
