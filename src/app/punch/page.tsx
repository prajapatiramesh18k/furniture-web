import type { Metadata } from 'next';
import PunchClientWrapper from './PunchClientWrapper';

export const metadata: Metadata = {
  title: 'Site Attendance Punch | Ananya House of Furniture',
  description: 'Employee GPS Site Attendance & Work Hours Punch',
};

export default function PunchPage() {
  return <PunchClientWrapper />;
}
