// Central model registration - imports all models to register them with Mongoose
// Import this file in API routes that use .populate() to ensure referenced models are registered

import '@/lib/models/Tenant';
import '@/lib/models/User';
import '@/lib/models/Project';
import '@/lib/models/Site';
import '@/models/Contact';
import '@/lib/models/Employee';
import '@/lib/models/Vendor';
import '@/lib/models/Quotation';
import '@/lib/models/Invoice';
import '@/lib/models/Expense';
import '@/lib/models/Task';
import '@/lib/models/SiteVisit';
import '@/lib/models/ProjectPayment';
import '@/lib/models/Counter';
import '@/lib/models/EmployeePayment';
import '@/lib/models/EmployeeSettlement';
import '@/lib/models/EmployeeAttendance';
import '@/lib/models/AuditLog';
import '@/lib/models/ProgressUpdate';
import '@/lib/models/Measurement';
import '@/lib/models/Order';
import '@/lib/models/Review';
import '@/lib/models/GalleryImage';
import '@/lib/models/TenantModule';