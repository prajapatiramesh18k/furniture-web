/**
 * Centralized payroll and attendance calculation service
 */

import EmployeeAttendance from './models/EmployeeAttendance';
import EmployeePayment from './models/EmployeePayment';

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

  // 1. Get total attendance and calculate total earned days
  const attendanceRecords = await EmployeeAttendance.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate }
  });

  let totalWorkHours = 0;
  let totalEarnedDays = 0;

  for (const record of attendanceRecords) {
    totalWorkHours += record.workHours;
    totalEarnedDays += record.earnedDays;
  }

  const grossAmount = totalEarnedDays * dailyRate;

  // 2. Get total advances/payments made during this month (exclude Settlement records)
  const paymentRecords = await EmployeePayment.find({
    employeeId,
    paymentType: { $ne: 'Settlement' },
    date: { $gte: startDate, $lte: endDate }
  });

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
    balanceAmount
  };
}
