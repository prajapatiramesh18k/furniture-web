import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import EmployeeSettlement from '@/lib/models/EmployeeSettlement';
import EmployeePayment from '@/lib/models/EmployeePayment';
import { calculateMonthlyPayroll } from '@/lib/payroll-service';
import ReceiptClientView from './ReceiptClientView';
import type { Viewport, Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 0.5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Payment Receipt | Ananya House of Furniture',
  description: 'Employee Payment Receipt & Salary Settlement Statement',
};

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; month?: string; year?: string }>;
}) {
  const { employeeId, month: monthStr, year: yearStr } = await searchParams;

  if (!employeeId) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', color: '#dc2626', marginBottom: '1.2rem' }}>
          <i className="fas fa-file-invoice"></i>
        </div>
        <h2 style={{ fontSize: '2.2rem', color: '#1e293b', marginBottom: '0.8rem' }}>Invalid Receipt Link</h2>
        <p style={{ fontSize: '1.4rem', color: '#64748b', maxWidth: '450px', marginBottom: '2rem' }}>
          This payment receipt link is missing required employee information. Please request a new receipt link from your supervisor or admin.
        </p>
        <Link href="/" style={{ backgroundColor: '#a27341', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '1.3rem' }}>
          Go to Homepage
        </Link>
      </div>
    );
  }

  const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
  const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

  let employeeData: any = null;
  let previewData: any = null;
  let paymentsData: any[] = [];
  let loadError = '';

  try {
    await dbConnect();
    const employee = await Employee.findById(employeeId).lean();

    if (!employee) {
      return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', color: '#dc2626', marginBottom: '1.2rem' }}>
            <i className="fas fa-user-slash"></i>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#1e293b', marginBottom: '0.8rem' }}>Employee Not Found</h2>
          <p style={{ fontSize: '1.4rem', color: '#64748b', maxWidth: '450px', marginBottom: '2rem' }}>
            The employee record associated with this receipt could not be found.
          </p>
          <Link href="/" style={{ backgroundColor: '#a27341', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '1.3rem' }}>
            Go to Homepage
          </Link>
        </div>
      );
    }

    const settlement = await EmployeeSettlement.findOne({ employeeId, month, year }).lean();
    if (settlement) {
      previewData = { ...settlement, isPreview: false };
    } else {
      const calc = await calculateMonthlyPayroll(employeeId, (employee as any).dailyRate || 0, month, year);
      previewData = { ...calc, isPreview: true };
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const rawPayments = await EmployeePayment.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }).lean();

    employeeData = JSON.parse(JSON.stringify(employee));
    previewData = JSON.parse(JSON.stringify(previewData));
    paymentsData = JSON.parse(JSON.stringify(rawPayments));
  } catch (err: any) {
    console.error('Receipt server error:', err);
    loadError = err?.message || 'An error occurred while loading this payment receipt. Please try again later.';
  }

  if (loadError) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', color: '#dc2626', marginBottom: '1.2rem' }}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style={{ fontSize: '2.2rem', color: '#1e293b', marginBottom: '0.8rem' }}>Error Loading Receipt</h2>
        <p style={{ fontSize: '1.4rem', color: '#64748b', maxWidth: '450px', marginBottom: '2rem' }}>
          {loadError}
        </p>
        <Link href="/" style={{ backgroundColor: '#a27341', color: '#fff', padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '1.3rem' }}>
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <ReceiptClientView
      employee={employeeData}
      preview={previewData}
      payments={paymentsData}
      month={month}
      year={year}
    />
  );
}
