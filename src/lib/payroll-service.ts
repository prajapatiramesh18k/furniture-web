/**
 * Centralized payroll and attendance calculation service
 */

import EmployeeAttendance from './models/EmployeeAttendance';
import EmployeePayment from './models/EmployeePayment';
import Employee from './models/Employee';

/**
 * Calculate earned days from work hours based on the business rule:
 * 8 hours -> 1 day
 * 10 hours -> 1.5 days
 * 12 hours -> 2 days (assuming proportional beyond 10, or max 2)
 *
 * Configurable based on standardHours, but defaulting to the strict rule if 8 is used.
 */
export function calculateEarnedDays(workHours: number, standardHours: number = 8): number {
  if (workHours <= 0) return 0;
  
  // Base case: exactly standard hours
  if (workHours === standardHours) return 1;

  // The specific business rule
  if (standardHours === 8) {
    if (workHours <= 8) {
      return workHours / 8; // e.g., 4 hours = 0.5 days
    } else if (workHours <= 10) {
      // 8 to 10 hours maps to 1 to 1.5 days
      return 1 + ((workHours - 8) / 2) * 0.5;
    } else {
      // > 10 hours. Assuming 12 -> 2. So every 2 hours is 0.5 days.
      return 1.5 + ((workHours - 10) / 2) * 0.5;
    }
  }

  // Fallback linear calculation if standardHours is different
  return workHours / standardHours;
}

/**
 * Calculates the monthly payroll summary for an employee dynamically.
 * This is used to preview the settlement before actually saving it.
 */
export async function calculateMonthlyPayroll(employeeId: string, dailyRate: number, month: number, year: number) {
  // Construct date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Fetch employee, attendance records, and payments in parallel (lean + projected)
  const [employee, attendanceRecords, paymentRecords] = await Promise.all([
    Employee.findById(employeeId).select('standardHours').lean(),
    EmployeeAttendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).select('workHours earnedDays status punchIn').lean(),
    EmployeePayment.find({
      employeeId,
      paymentType: { $ne: 'Settlement' },
      date: { $gte: startDate, $lte: endDate }
    }).select('amount').lean()
  ]);

  const standardHours = employee?.standardHours || 8;

  let totalWorkHours = 0;
  let totalEarnedDays = 0;
  let hasActiveShift = false;
  let activeShiftHours = 0;

  for (const record of attendanceRecords) {
    let hours = record.workHours || 0;
    let days = record.earnedDays || 0;

    // If currently working on-site (punched in, not yet punched out), dynamically include live elapsed hours
    if (record.status === 'punched_in' && record.punchIn && hours === 0) {
      const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(record.punchIn).getTime()) / (1000 * 60)));
      hours = Math.round((elapsedMinutes / 60) * 100) / 100;
      days = Number(calculateEarnedDays(hours, standardHours).toFixed(2));
      hasActiveShift = true;
      activeShiftHours = hours;
    }

    totalWorkHours += hours;
    totalEarnedDays += days;
  }

  totalWorkHours = Math.round(totalWorkHours * 100) / 100;
  totalEarnedDays = Math.round(totalEarnedDays * 100) / 100;

  const grossAmount = Math.round(totalEarnedDays * dailyRate);

  let totalPaid = 0;
  for (const payment of paymentRecords) {
    totalPaid += payment.amount;
  }

  const balanceAmount = grossAmount - totalPaid;

  return {
    month,
    year,
    totalWorkHours,
    totalEarnedDays,
    dailyRate,
    grossAmount,
    totalPaid,
    balanceAmount,
    hasActiveShift,
    activeShiftHours,
  };
}
