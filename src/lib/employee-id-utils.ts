import Employee from '@/lib/models/Employee';

/**
 * Derive a short company prefix from the company name.
 * "Ananya House of Furniture" -> "AHF", "Pritesh Interior Solution" -> "PIS",
 * single word "Pritesh" -> "PRI".
 */
export function companyPrefixFor(name: string | null | undefined): string {
  const clean = String(name || '').trim();
  if (!clean) return 'AHF';
  const words = clean.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (words.length >= 2) {
    const initials = words
      .slice(0, 4)
      .map((w) => w[0]!.toUpperCase())
      .join('');
    if (initials.length >= 2) return initials;
  }
  const alnum = clean.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return (alnum.slice(0, 3) || 'AHF').padEnd(2, 'X');
}

export function normalizeEmployeePrefix(raw: string | null | undefined, fallbackName?: string | null): string {
  const clean = String(raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
  if (clean.length >= 2) return clean;
  return companyPrefixFor(fallbackName);
}

/**
 * Parses the numeric part of an Employee ID.
 * Accepts any company prefix: "AHF-005" -> 5, "PIS-12" -> 12 (legacy + new).
 */
export function parseEmployeeIdNumber(idStr: string | null | undefined): number | null {
  if (!idStr) return null;
  const match = String(idStr).trim().match(/^[A-Z0-9]{2,5}-(\d+)$/i);
  return match ? parseInt(match[1], 10) : null;
}

export function parseEmployeeIdParts(idStr: string | null | undefined): { prefix: string; num: number } | null {
  if (!idStr) return null;
  const match = String(idStr).trim().match(/^([A-Z0-9]{2,5})-(\d+)$/i);
  if (!match) return null;
  return { prefix: match[1].toUpperCase(), num: parseInt(match[2], 10) };
}

/**
 * Formats a number into a company-wise Employee ID (e.g. 1 -> "PIS-001").
 */
export function formatEmployeeId(num: number, prefix = 'AHF'): string {
  const p = normalizeEmployeePrefix(prefix);
  return `${p}-${String(num).padStart(3, '0')}`;
}

/** Resolve the effective employee prefix for a tenant (stored value or derived). */
export async function getTenantEmployeePrefix(tenantId?: string | null): Promise<string> {
  if (!tenantId) return 'AHF';
  try {
    const Tenant = (await import('@/lib/models/Tenant')).default;
    const t = await Tenant.findById(tenantId).select('name employeePrefix').lean() as unknown as { name?: string; employeePrefix?: string } | null;
    if (t?.employeePrefix) return normalizeEmployeePrefix(t.employeePrefix, t?.name);
    return companyPrefixFor(t?.name);
  } catch {
    return 'AHF';
  }
}

/**
 * Computes the next unique company-wise Employee ID.
 * Sequence is per-tenant (multi-tenancy): numbering continues across prefix
 * changes so IDs never collide within a company.
 */
export async function generateNextEmployeeId(tenantId?: string | null): Promise<string> {
  const prefix = await getTenantEmployeePrefix(tenantId);
  const filter = tenantId
    ? { tenantId, employeeId: { $exists: true, $ne: null } }
    : { employeeId: { $exists: true, $ne: null } };
  const employees = await Employee.find(filter)
    .select('employeeId')
    .lean();

  let maxNum = 0;
  for (const emp of employees) {
    const num = parseEmployeeIdNumber((emp as { employeeId?: string }).employeeId);
    if (num !== null && num > maxNum) {
      maxNum = num;
    }
  }

  // Guard against stale/custom IDs already taken (e.g. manual edits).
  let candidate = maxNum + 1;
  for (let i = 0; i < 50; i++) {
    const id = formatEmployeeId(candidate, prefix);
    const exists = await Employee.findOne(
      tenantId ? { tenantId, employeeId: id } : { employeeId: id },
    )
      .select('_id')
      .lean();
    if (!exists) return id;
    candidate++;
  }
  return formatEmployeeId(candidate, prefix);
}

/**
 * Non-destructive migration routine:
 * Safely ensures all existing employees have a unique sequential Employee ID
 * based on their creation/joining date, without duplicate collisions.
 * NOTE: per-tenant — callers should scope this when used.
 */
export async function ensureAllEmployeesHaveIds(): Promise<void> {
  const allEmployees = await Employee.find({})
    .sort({ createdAt: 1, joiningDate: 1, _id: 1 })
    .select('_id tenantId employeeId createdAt joiningDate')
    .lean();

  // Group by tenant so each company keeps its own sequence + prefix.
  const byTenant = new Map<string, typeof allEmployees>();
  for (const emp of allEmployees) {
    const key = String((emp as { tenantId?: unknown }).tenantId || 'global');
    if (!byTenant.has(key)) byTenant.set(key, []);
    byTenant.get(key)!.push(emp);
  }

  const { default: Tenant } = await import('@/lib/models/Tenant');
  for (const [key, list] of byTenant) {
    let prefix = 'AHF';
    if (key !== 'global') {
      try {
        const t = await Tenant.findById(key).select('name employeePrefix').lean() as unknown as { name?: string; employeePrefix?: string } | null;
        prefix = t?.employeePrefix
          ? normalizeEmployeePrefix(t.employeePrefix, t?.name)
          : companyPrefixFor(t?.name);
      } catch {}
    }
    const usedNumbers = new Set<number>();
    const missing: typeof list = [];
    for (const emp of list) {
      const num = parseEmployeeIdNumber((emp as { employeeId?: string }).employeeId);
      if (num !== null) usedNumbers.add(num);
      else missing.push(emp);
    }
    if (missing.length === 0) continue;
    let candidate = 1;
    for (const emp of missing) {
      while (usedNumbers.has(candidate)) candidate++;
      usedNumbers.add(candidate);
      await Employee.updateOne(
        { _id: (emp as { _id: unknown })._id },
        { $set: { employeeId: formatEmployeeId(candidate, prefix) } },
      );
      candidate++;
    }
  }
}
