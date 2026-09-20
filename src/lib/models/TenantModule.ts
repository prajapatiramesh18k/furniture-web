import mongoose, { Schema, Document } from 'mongoose';

/**
 * Sellable modules. Stored per-tenant in TenantModule.
 * Keep keys stable — they are persisted in the DB.
 */
export const MODULE_KEYS = ['QUOTATION', 'EMPLOYEE_MANAGEMENT', 'INVENTORY', 'ACCOUNTING'] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  QUOTATION: 'Quotation Maker',
  EMPLOYEE_MANAGEMENT: 'Employee Management',
  INVENTORY: 'Inventory',
  ACCOUNTING: 'Accounting',
};

/** Admin UI module id -> sellable module key. `null` = always available (not gated by sale). */
export const ADMIN_MODULE_TO_SALES_MODULE: Record<string, ModuleKey | null> = {
  dashboard: null,
  quotations: 'QUOTATION',
  projects: null,
  team: 'EMPLOYEE_MANAGEMENT',
  staff: null,
  customers: null,
  settings: null,
  products: 'INVENTORY',
  inventory: 'INVENTORY',
  categories: 'INVENTORY',
  // Storefront / catalogue features need the Inventory/listing purchase.
  // Otherwise a QUOTATION+EMPLOYEE-only company still sees Orders, Collections,
  // Offers, Shipping, Reviews — which is the reported bug.
  collections: 'INVENTORY',
  orders: 'INVENTORY',
  offers: 'INVENTORY',
  payments: 'ACCOUNTING',
  reports: 'ACCOUNTING',
  shipping: 'INVENTORY',
  reviews: 'INVENTORY',
};

export interface ITenantModule extends Document {
  tenantId: mongoose.Types.ObjectId;
  moduleKey: ModuleKey;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantModuleSchema = new Schema<ITenantModule>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    moduleKey: { type: String, enum: MODULE_KEYS, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

TenantModuleSchema.index({ tenantId: 1, moduleKey: 1 }, { unique: true });

export async function getEnabledModules(tenantId: string): Promise<Set<string>> {
  const TenantModule =
    mongoose.models.TenantModule || mongoose.model('TenantModule', TenantModuleSchema);
  const rows = await TenantModule.find({ tenantId, enabled: true }).select('moduleKey').lean();
  return new Set(rows.map((r: { moduleKey: string }) => String(r.moduleKey)));
}

const TenantModule =
  mongoose.models.TenantModule || mongoose.model<ITenantModule>('TenantModule', TenantModuleSchema);

export default TenantModule;
