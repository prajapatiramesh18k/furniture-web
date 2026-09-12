import Employee from '@/lib/models/Employee';

/**
 * Parses the numeric part of an Employee ID (e.g. "AHF-005" -> 5)
 */
export function parseEmployeeIdNumber(idStr: string | null | undefined): number | null {
  if (!idStr) return null;
  const match = idStr.match(/^AHF-(\d+)$/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Formats a number into standard Employee ID (e.g. 1 -> "AHF-001", 12 -> "AHF-012", 120 -> "AHF-120")
 */
export function formatEmployeeId(num: number): string {
  return `AHF-${String(num).padStart(3, '0')}`;
}

/**
 * Computes the next unique AHF Employee ID from the database
 */
export async function generateNextEmployeeId(): Promise<string> {
  const employees = await Employee.find({ employeeId: { $exists: true, $ne: null } })
    .select('employeeId')
    .lean();

  let maxNum = 0;
  for (const emp of employees) {
    const num = parseEmployeeIdNumber(emp.employeeId);
    if (num !== null && num > maxNum) {
      maxNum = num;
    }
  }

  return formatEmployeeId(maxNum + 1);
}

/**
 * Non-destructive migration routine:
 * Safely ensures all existing employees have a unique sequential Employee ID
 * based on their creation/joining date, without duplicate collisions.
 */
export async function ensureAllEmployeesHaveIds(): Promise<void> {
  const allEmployees = await Employee.find({})
    .sort({ createdAt: 1, joiningDate: 1, _id: 1 })
    .select('_id employeeId createdAt joiningDate')
    .lean();

  const usedNumbers = new Set<number>();
  const missingEmployees: any[] = [];

  for (const emp of allEmployees) {
    const num = parseEmployeeIdNumber(emp.employeeId);
    if (num !== null) {
      usedNumbers.add(num);
    } else {
      missingEmployees.push(emp);
    }
  }

  if (missingEmployees.length === 0) return;

  let currentCandidate = 1;
  for (const emp of missingEmployees) {
    while (usedNumbers.has(currentCandidate)) {
      currentCandidate++;
    }
    const newId = formatEmployeeId(currentCandidate);
    usedNumbers.add(currentCandidate);

    await Employee.updateOne(
      { _id: emp._id },
      { $set: { employeeId: newId } }
    );
  }
}
