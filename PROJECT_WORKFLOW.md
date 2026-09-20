# Furniture-Next — Complete Project Workflow Guide

## Overview

This document describes the full lifecycle of a project in the **Ananya House of Furniture** platform — from first customer contact to project completion. Every stage creates entries in the database, and each entity is linked to the next in a traceable chain.

**Tenant**: `Pritesh interior Solution`  
**Company**: Ananya House of Furniture  
**Platform**: Next.js 16 + MongoDB + Mongoose

---

## Workflow Stages

```
Lead → Site Visit → Quotation (Draft → Sent → Approved/Rejected) → Project → Completion
```

---

## Stage 1: Lead (Contact)

### What happens
A potential customer contacts the company — via the website form, walk-in, or referral. Their information is recorded as a **Lead** (Contact).

### Database Entry
**Model**: `Contact` (`src/models/Contact.ts`)

| Field | Type | Example |
|-------|------|---------|
| `name` | String | `"Mr. Rajesh Sharma"` |
| `phone` | String | `"9876543210"` |
| `email` | String | `"rajesh@example.com"` |
| `status` | Enum | `"new"` → `"contacted"` → `"site_visit"` → `"proposal"` → `"quotation"` → `"won"` / `"lost"` |
| `projectType` | String | `"Interior"` |
| `source` | String | `"website"`, `"walkin"`, `"referral"` |
| `assignedTo` | ObjectId | Employee ID |
| `followUpAt` | Date | Next contact date |
| `budget` | Number | `250000` |
| `notes` | String | Customer requirements |

### Lead Status Pipeline
```
new → contacted → site_visit → proposal → quotation → won / lost
```

### Admin Page
- **URL**: `/admin/leads`
- **Features**: Filter by status, inline editing, assign employee, set follow-up date
- **Actions**: "New Quotation" button to create a quotation from a lead

---

## Stage 2: Site Visit

### What happens
After initial contact, the sales team visits the customer's property to assess the space, take measurements, and understand requirements.

### Database Entry
**Model**: `SiteVisit` (`src/lib/models/SiteVisit.ts`)

| Field | Type | Example |
|-------|------|---------|
| `customerName` | String | `"Mr. Rajesh Sharma"` |
| `phone` | String | `"9876543210"` |
| `address` | String | `"123, Elm Street, Bangalore"` |
| `visitDate` | Date | `2025-09-20` |
| `status` | Enum | `"scheduled"` → `"completed"` / `"rescheduled"` / `"cancelled"` |
| `requirements` | String | `"Complete interior renovation for 3 BHK"` |
| `notes` | String | Additional notes |
| `assignedTo` | ObjectId | Employee ID |
| `photos` | [String] | Array of photo URLs |

### Site Visit Status Pipeline
```
scheduled → completed | rescheduled → cancelled
```

### Admin Page
- **URL**: `/admin/site-visits`
- **Features**: Schedule visits, filter by status, mark as done/cancelled
- **Action buttons**: "Done", "Re-schedule", "Cancel" (only shown for `scheduled` status)

---

## Stage 3: Quotation

### What happens
Based on the site visit, the designer/draftsman creates a detailed quotation with items, rates, and totals. The quotation starts as `draft`, is sent to the customer as `sent`, and then is either approved or rejected.

### Database Entry
**Model**: `Quotation` (`src/lib/models/Quotation.ts`)

| Field | Type | Example |
|-------|------|---------|
| `customer` | Object | `{ name, phone, email, address, branch }` |
| `project` | Object | `{ type, quoteNo, date, validTill }` |
| `department` | String | `"furniture"` |
| `departmentName` | String | `"Interior"` |
| `items` | [QuotationItem] | Array of items with name, material, quantity, rate |
| `totals` | Object | `{ subtotal, gst, total }` |
| `status` | Enum | `draft` → `sent` → `approved` / `rejected` |
| `decidedAt` | Date | Timestamp of approval/rejection |
| `decidedBy` | String | Email of who approved/rejected |
| `terms` | String | Terms & conditions |
| `inclusions` | String | What's included |

### Quotation Status Pipeline
```
draft → sent → approved → (project auto-created)
              → rejected → (can be re-sent)
```

### Valid Transitions
| From | To |
|------|----|
| `draft` | `sent` |
| `sent` | `draft`, `approved`, `rejected` |
| `approved` | `sent` |
| `rejected` | `sent` |

### Role-Based Access Control
- **owner, admin, super_admin**: Can approve/reject any quotation
- **manager, staff**: Can only update their own quotations (no approve/reject)

### Admin Pages
- **URL**: `/admin/quotations` (list) and `/admin/quotations/new` (create)
- **Features**:
  - Status badges shown in the table (`draft`, `sent`, `approved`, `rejected`)
  - **Approve** button (green) — appears only for `sent`/`draft` quotations
  - **Reject** button (red) — appears only for `sent`/`draft` quotations
  - View modal with full quotation details
  - Download PDF
  - Delete

### Approval Flow (with Example)

1. Sales rep creates quotation for "Mr. Rajesh Sharma" — `Quote No: QTN-2025-001`
2. Status is `draft`
3. Sales rep marks as `sent` → Status becomes `sent`
4. Owner/Admin sees "Approve" and "Reject" buttons on the quotation
5. Owner clicks **Approve** → API PUT `/api/quotations` with `{id, status: 'approved'}`
6. Backend automatically:
   - Sets `decidedAt = Date.now`, `decidedBy = 'owner@email'`
   - Calls `createProjectFromQuotation()` to auto-create a project
7. Status becomes `approved` → **Project is created**
8. If owner clicks **Reject** → Status becomes `rejected` → No project created

---

## Stage 4: Project Creation

### What happens
When a quotation is **approved**, the system automatically creates a Project. This is handled by `src/lib/project-from-quotation.ts`.

### Database Entry
**Model**: `Project` (`src/lib/models/Project.ts`)

| Field | Type | Example |
|-------|------|---------|
| `name` | String | `"Sharma Residence"` |
| `customer` | Object | `{ name, phone, email }` |
| `quotationNo` | String | `"QTN-2025-001"` |
| `projectType` | String | `"Interior (Single-Trade)"` |
| `status` | Enum | `planning` → `design` → `procurement` → `execution` → `finishing` → `completed` |
| `budgetValue` | Number | `250000` |
| `managerId` | ObjectId | Employee ID |
| `supervisorId` | ObjectId | Employee ID |
| `siteId` | ObjectId | Site ID (linked property) |
| `packages` | [Array] | Work packages from multi-trade quotations |
| `startDate` | Date | Project start |
| `expectedEnd` | Date | Project deadline |
| `notes` | String | Additional notes |

### Project Status Pipeline
```
planning → design → procurement → execution → finishing → completed
```
(Also: `planning → on_hold`, `planning → cancelled`)

---

## Stage 5: Site (Property)

### What happens
A physical site/property is created for the project — the location where work will be done.

### Database Entry
**Model**: `Site` (`src/lib/models/Site.ts`)

| Field | Type | Example |
|-------|------|---------|
| `name` | String | `"Sharma Residence - Site"` |
| `clientName` | String | `"Mr. Rajesh Sharma"` |
| `propertyType` | String | `"Residential"` |
| `area` | String | `"1800 sq ft"` |
| `rooms` | String | `"3 BHK"` |
| `address` | String | `"123, Elm Street, Bangalore"` |
| `location` | Object | `{ latitude, longitude }` |
| `projectId` | ObjectId | Links to Project |

---

## Stage 6: Tasks (Execution Checklist)

### What happens
When a project is created, 5 default seed tasks are generated for single-trade quotations:

1. **Site Measurement** — Measure the space
2. **Design Approval** — Get design sign-off from client
3. **Material Selection & Procurement** — Choose and order materials
4. **Execution / Installation** — Install furniture/fixtures
5. **Finishing & Final Inspection** — Final quality check

### Database Entry
**Model**: `Task` (`src/lib/models/Task.ts`)

| Field | Type | Example |
|-------|------|---------|
| `projectId` | ObjectId | Project ID |
| `title` | String | `"Site Measurement"` |
| `category` | String | `"Measurement"` |
| `assignedTo` | ObjectId | Employee ID |
| `status` | Enum | `todo` → `in_progress` → `done` |
| `priority` | Enum | `low`, `medium`, `high` |
| `dueDate` | Date | Task deadline |
| `notes` | String | Task notes |

### Task Assignment Example
| Task | Assigned To |
|------|-------------|
| Site Measurement | Suresh Kumar (PIS-004) |
| Design Approval | Rajesh Verma (PIS-005) |
| Material Selection & Procurement | Pramod Gupta (PIS-006) |
| Execution / Installation | Sanjay Joshi (PIS-007) |
| Finishing & Final Inspection | Manoj Tiwari (PIS-008) |

---

## Stage 7: Progress Updates

### What happens
As work progresses, the site supervisor logs progress updates with photos and notes at each floor/room level.

### Database Entry
**Model**: `ProgressUpdate` (`src/lib/models/ProgressUpdate.ts`)

| Field | Type | Example |
|-------|------|---------|
| `projectId` | ObjectId | Project ID |
| `floor` | String | `"Ground"` |
| `room` | String | `"Living Room"` |
| `category` | String | `"Measurement"`, `"Design"`, `"Execution"` |
| `photos` | [String] | Array of photo URLs |
| `notes` | String | Progress description |
| `updateDate` | Date | When the update was made |

### Progress Update Example
| Date | Category | Floor/Room | Notes |
|------|----------|------------|-------|
| Day 3 | Measurement | Ground / Living Room | Dimensions recorded: 1800 sq ft |
| Day 8 | Design | Ground / Living Room | CAD drawings finalized |
| Day 35 | Execution | Ground / All Rooms | Carpentry and electrical underway |

---

## Stage 8: Expenses

### What happens
Throughout the project, various expenses are recorded — materials, labour, transport, contractors, and misc items.

### Database Entry
**Model**: `Expense` (`src/lib/models/Expense.ts`)

| Field | Type | Example |
|-------|------|---------|
| `projectId` | ObjectId | Project ID |
| `category` | Enum | `material`, `labour`, `transport`, `contractor`, `misc` |
| `materialName` | String | `"Marble Tiles"` |
| `quantity` | Number | `500` |
| `unit` | String | `"sq ft"` |
| `amount` | Number | `45000` |
| `expenseDate` | Date | When expense occurred |
| `employeeId` | ObjectId | Who incurred the expense |
| `notes` | String | Description |
| `bill` | String | Bill reference number |

### Expense Example (Sharma Residence)
| Category | Item | Amount |
|----------|------|--------|
| Material | Marble Tiles | ₹45,000 |
| Material | Wooden Planks | ₹30,000 |
| Labour | Labour Charges | ₹50,000 |
| Transport | Material Transport | ₹12,000 |
| Contractor | Electrical Contractor | ₹35,000 |
| Misc | Paint & Accessories | ₹15,000 |
| **Total** | | **₹187,000** |

---

## Stage 9: Invoice

### What happens
An invoice is generated against the project for billing the client.

### Database Entry
**Model**: `Invoice` (`src/lib/models/Invoice.ts`)

| Field | Type | Example |
|-------|------|---------|
| `projectId` | ObjectId | Project ID |
| `invoiceNo` | String | `"INV-2025-001"` |
| `items` | [InvoiceItem] | Line items with name, quantity, rate, amount |
| `subtotal` | Number | `250000` |
| `gst` | Number | `45000` (18%) |
| `total` | Number | `295000` |
| `paidTotal` | Number | `100000` |
| `status` | Enum | `draft` → `sent` → `partial` → `paid` / `cancelled` |
| `issueDate` | Date | `2025-09-15` |
| `dueDate` | Date | `2025-10-15` |

---

## Stage 10: Payment Received

### What happens
The client makes a payment against the invoice. This can be partial or full.

### Database Entry
**Model**: `ProjectPayment` (`src/lib/models/ProjectPayment.ts`)

| Field | Type | Example |
|-------|------|---------|
| `projectId` | ObjectId | Project ID |
| `invoiceId` | ObjectId | Invoice ID |
| `amount` | Number | `100000` |
| `method` | String | `"UPI"`, `"Cash"`, `"Bank Transfer"`, `"Cheque"`, `"Card"` |
| `paymentDate` | Date | `2025-09-20` |
| `notes` | String | Payment description |

---

## Stage 11: Project Completion

### What happens
The project status is advanced through all stages until `completed`. All tasks should be marked done, all expenses recorded, and final payment received.

### Final Summary Example
```
Project: Sharma Residence
  Status: completed
  Budget: ₹250,000
  Tasks: 5 (all done)
  Progress: 3 updates logged
  Expenses: 6 entries (₹187,000 total)
  Invoice: INV-2025-001 (₹295,000 total)
  Payment: ₹100,000 received (partial)
  Profitability: ₹295,000 - ₹187,000 = ₹108,000 margin
```

---

## Entity Relationship Diagram

```
Contact (Lead)
  │ status: new → contacted → site_visit → proposal → quotation → won/lost
  │
  ├──→ SiteVisit
  │     status: scheduled → completed/rescheduled → cancelled
  │
  ├──→ Quotation
  │     status: draft → sent → approved/rejected
  │     │
  │     └──→ [ON APPROVAL] Project
  │           status: planning → design → procurement → execution → finishing → completed
  │           │
  │           ├──→ Site (property)
  │           │
  │           ├──→ Task (5 seed tasks)
  │           │     status: todo → in_progress → done
  │           │
  │           ├──→ ProgressUpdate (milestone updates)
  │           │
  │           ├──→ Expense (cost tracking)
  │           │
  │           ├──→ Invoice (billing)
  │           │     status: draft → sent → partial → paid
  │           │
  │           └──→ ProjectPayment (received payments)
```

---

## Complete Example: Mr. Sharma's Interior Project

### Step-by-step walkthrough

1. **Lead Created**: `Mr. Rajesh Sharma` contacts via website → Contact status = `new`
2. **Site Visit Scheduled**: Sales team visits at 123 Elm Street → SiteVisit status = `scheduled` → then `completed`
3. **Lead Status Updated**: `new` → `contacted` → `site_visit` → `proposal` → `quotation`
4. **Quotation Created**: `QTN-2025-001` — 3 BHK interior renovation, ₹250,000 → status = `draft` → `sent`
5. **Quotation Approved**: Owner clicks **Approve** → Status = `approved` → **Project auto-created**: "Sharma Residence"
6. **Project Status**: `planning` → manager assigns tasks → status advances through `design` → `procurement` → `execution` → `finishing`
7. **Tasks**: 5 seed tasks created, each assigned to an employee
8. **Progress Updates**: 3 updates logged during execution
9. **Expenses**: 6 expense entries totaling ₹187,000
10. **Invoice**: `INV-2025-001` — ₹295,000 (including 18% GST) → status = `sent` → `partial`
11. **Payment**: ₹100,000 received via UPI
12. **Project Completed**: Status = `completed`

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PUT | `/api/contacts` | Lead/Contact CRUD |
| GET/POST/PUT | `/api/site-visits` | Site Visit CRUD |
| GET/POST/PUT | `/api/quotations` | Quotation CRUD + approve/reject (PUT) |
| POST | `/api/projects/convert` | Manually convert quotation to project |
| GET/POST/PUT | `/api/projects` | Project CRUD |
| GET/POST/PUT/DELETE | `/api/tasks` | Task CRUD |
| GET/POST/DELETE | `/api/progress` | Progress update CRUD |
| GET/POST/DELETE | `/api/expenses` | Expense CRUD |
| GET/POST/PUT | `/api/invoices` | Invoice CRUD |
| GET/POST/DELETE | `/api/project-payments` | Payment CRUD |
| GET/POST | `/api/employees` | Employee CRUD |

---

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `scripts/seed-employees.ts` | `npx tsx scripts/seed-employees.ts` | Create 10 Indian-named employees (idempotent) |
| `scripts/seed-project-workflow.ts` | `npx tsx scripts/seed-project-workflow.ts` | Create complete "Sharma Residence" workflow |

---

## Navigation Structure

The admin sidebar follows this flow:

```
Sales
  ├── Leads (/admin/leads)
  ├── Customers (/admin/customers)
  └── Site Visits (/admin/site-visits)

Quotations
  ├── New Quotation (/admin/quotations/new)
  └── Saved Quotations (/admin/quotations)
    → Approve/Reject buttons visible on quotation cards

Projects
  ├── All Projects (/admin/projects)
  ├── Tasks (/admin/tasks)
  └── Site Progress (/admin/progress)
```

**Removed**: Measurements menu item and `/admin/measurements` page (not required for the core workflow).
