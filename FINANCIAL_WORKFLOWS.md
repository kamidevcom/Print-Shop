# Financial Workflows & Payment System Documentation

**Project:** سیستم مدیریت سفارش
**Document Type:** Technical Reference & AI Context
**Status:** Current Implementation Analysis
**Last Reviewed:** October 2026

---

## 1. Purpose and Scope

This document describes the current financial and payment implementation of the order management system.

It serves two purposes:

1. Help developers understand the existing financial architecture and business logic.
2. Provide AI coding agents with reliable project context before modifying payment-related features.

This document describes the implementation as analyzed. It does not imply that missing features have been implemented.

**Important:** When working on financial features, always inspect the current source code and Prisma schema. The codebase is the source of truth; this document may become outdated as the project evolves.

---

## 2. System Overview

The application provides internal order management, manual pricing, payment tracking, outstanding balance calculations, and basic financial reporting.

There is currently no online payment gateway integration.

### Current Capabilities

| Feature                               | Status          |
| ------------------------------------- | --------------- |
| Manual order pricing                  | Implemented     |
| Manual order discounts                | Implemented     |
| Initial payment during order creation | Implemented     |
| Multiple payments per order           | Implemented     |
| Payment methods                       | Implemented     |
| Outstanding balance calculation       | Implemented     |
| Order payment history                 | Implemented     |
| Order activity logging                | Implemented     |
| Customer debt calculation             | Implemented     |
| Monthly financial reports             | Implemented     |
| Employee commission calculation       | Implemented     |
| Automatic service-based pricing       | Not implemented |
| Refund processing                     | Not implemented |
| Online payment gateway                | Not implemented |
| Printable official invoice/PDF        | Not implemented |
| Dedicated accounting role             | Not implemented |
| Dedicated financial payment status    | Not implemented |

These statuses reflect the analyzed implementation and should be reverified after significant code changes.

---

## 3. Architecture and Relevant Files

The following files are the primary entry points identified during the analysis.

| File                                          | Responsibility                                                 |
| --------------------------------------------- | -------------------------------------------------------------- |
| `prisma/schema.prisma`                        | Database models and relationships                              |
| `src/lib/domain.ts`                           | Domain enums, including order and payment types                |
| `src/lib/utils.ts`                            | Money formatting and payment calculation utilities             |
| `src/lib/order-state.ts`                      | Order status transitions                                       |
| `src/lib/commission.ts`                       | Employee commission calculation                                |
| `src/lib/authz.ts`                            | Authentication and authorization helpers                       |
| `src/lib/queries/customers.ts`                | Customer financial statistics and debt calculations            |
| `src/lib/queries/employees.ts`                | Employee performance and commission data                       |
| `src/app/actions/orders.ts`                   | Order creation, updates, status changes, and payment recording |
| `src/app/actions/entities.ts`                 | Customer and employee management actions                       |
| `src/app/(dashboard)/orders/new/page.tsx`     | New order page                                                 |
| `src/components/orders/new-order-form.tsx`    | Order creation form and initial payment fields                 |
| `src/app/(dashboard)/orders/[id]/page.tsx`    | Order details and financial information                        |
| `src/components/orders/payment-form.tsx`      | Payment entry form                                             |
| `src/components/orders/order-edit-form.tsx`   | Order amount and discount editing                              |
| `src/app/(dashboard)/reports/page.tsx`        | Monthly financial reporting                                    |
| `src/app/(dashboard)/employees/[id]/page.tsx` | Employee performance and commission                            |
| `src/app/(dashboard)/customers/[id]/page.tsx` | Customer details, debt, and order history                      |
| `src/app/(dashboard)/page.tsx`                | Dashboard summaries                                            |

Before changing a workflow, inspect the current implementation of the relevant files and trace the calls between UI components, server actions, database queries, and Prisma.

---

## 4. Data Model

### 4.1 Core Models

#### Order

Relevant fields:

* `totalAmount`: Original order amount, stored as an integer.
* `discount`: Order discount, stored separately.
* `status`: Operational order status.
* `customerId`: Associated customer.
* `serviceId`: Associated service.
* `assigneeId`: Assigned employee.
* `createdByUserId`: User who created the order.

The order's final payable amount is derived from `totalAmount` and `discount`.

#### OrderPayment

Relevant fields:

* `id`
* `orderId`
* `amount`
* `method`
* `notes`
* `createdBy`
* `createdAt`

Each payment belongs to an order. An order can have multiple payment records.

The payment model represents recorded payment amounts; it does not independently verify that money was actually received by a bank or payment provider.

#### OrderActivity

Relevant fields:

* `id`
* `orderId`
* `message`
* `meta`
* `createdBy`
* `createdAt`

This model records order-related activity, including payment events.

It provides an activity history but should not automatically be treated as a complete, immutable accounting ledger.

#### Customer

Relevant relationships and attributes include customer type and associated orders.

Customer types identified in the current implementation:

* `NORMAL`
* `STUDENT`
* `BUSINESS`

Customer debt is derived from the customer's orders and their payment records.

#### Employee and User

`Employee` is associated with orders and may be linked to a `User` account.

`Order.createdByUserId` records the user who created an order and is relevant to employee order permissions.

#### Service

`Service.basePrice` is optional.

The current order creation workflow uses a manually entered amount rather than automatically calculating the order price from the service's base price.

### 4.2 Relationships

The analyzed schema includes the following relationships:

* `Order` → `OrderPayment`: One-to-many.
* `Order` → `OrderActivity`: One-to-many.
* `Order` → `Customer`: Many-to-one.
* `Order` → `Employee`: Many-to-one through assignment.
* `Order` → `User`: Optional creator relationship.
* `User` → `OrderPayment`: Payment creator relationship.

The analyzed schema uses cascade deletion for payment and activity records associated with an order. Verify the current Prisma schema before relying on this behavior.

**Accounting implication:** Deleting an order may also delete its associated payment history. This is a significant data-retention and auditability concern.

---

## 5. Payment Methods

The current payment method enum is:

```ts
enum PaymentMethod {
  CASH
  CARD
  CARD_TO_CARD
  TRANSFER
  OTHER
}
```

| Value          | Meaning               |
| -------------- | --------------------- |
| `CASH`         | Cash payment          |
| `CARD`         | Card payment          |
| `CARD_TO_CARD` | Card-to-card transfer |
| `TRANSFER`     | Bank transfer         |
| `OTHER`        | Other payment method  |

Default methods identified in the analyzed code:

* Initial payment during order creation: `CARD`.
* Subsequent payment recording: `CASH`.

These defaults are inconsistent and should be reviewed for user experience and reporting accuracy.

All methods are currently recorded manually. No online payment gateway was identified in the analyzed workflow.

---

## 6. Financial Calculation Rules

### 6.1 Final Order Amount

The final payable amount is calculated as:

```ts
finalAmount = totalAmount - discount;
```

The original amount and discount are stored separately in the database.

The final amount is derived when needed rather than stored as a separate authoritative field, according to the analyzed implementation.

### 6.2 Total Paid

The total paid amount is calculated by summing the order's payment records:

```ts
paidAmount = payments.reduce(
  (sum, payment) => sum + payment.amount,
  0
);
```

Conceptually:

$$
\text{Paid Amount} = \sum_{i=1}^{n} \text{Payment}_i
$$

Each payment contributes to the total, regardless of its payment method.

### 6.3 Outstanding Balance

The utility identified in `src/lib/utils.ts` calculates the remaining balance using this rule:

```ts
remainingAmount = Math.max(
  0,
  totalAmount - discount - paidAmount
);
```

Mathematically:

$$
\text{Remaining} =
\max(0,\text{Total}-\text{Discount}-\text{Paid})
$$

This prevents the displayed balance from becoming negative. However, it does not prevent an order from being overpaid.

### 6.4 Customer Debt

Customer debt is derived from the outstanding balances of the customer's non-cancelled orders:

$$
\text{Customer Debt} =
\sum_{\text{eligible orders}} \text{Remaining Amount}
$$

The exact eligibility rules should be verified in `src/lib/queries/customers.ts` before modifying customer financial reporting.

### 6.5 Monthly Financial Reporting

The analyzed monthly report uses these concepts:

**Monthly sales**

Sum of the final amounts of non-cancelled orders created in the reporting month:

$$
\text{Monthly Sales} =
\sum_{\text{eligible orders}}
(\text{Total}-\text{Discount})
$$

**Monthly collections**

Sum of payment records associated with orders in the reporting month:

$$
\text{Monthly Collections} =
\sum_{\text{payments of eligible orders}} \text{Amount}
$$

**Monthly outstanding balance**

Sum of the remaining balances for orders included in the reporting month:

$$
\text{Monthly Outstanding} =
\sum_{\text{eligible orders}} \text{Remaining Amount}
$$

**Important reporting limitation:** Collections grouped by an order's creation month are not the same as cash received during that calendar month. A payment made in October against a September order may not appear in an order-month-based report for October.

Before modifying financial reports, verify which date field each report filters by. A proper cash-flow report should generally use payment transaction dates.

---

## 7. Order Creation and Initial Payment

Primary entry point identified: `createOrderAction` in `src/app/actions/orders.ts`.

### Current Workflow

1. The user submits the order creation form.
2. Required customer and service identifiers are provided.
3. The order amount is entered manually.
4. The discount is entered manually, defaulting to zero.
5. An optional initial payment can be provided.
6. If the initial payment is greater than zero, an `OrderPayment` record is created.
7. The order, initial payment, and activity record are created within a Prisma transaction, according to the analyzed implementation.
8. An order number is assigned through the order counter mechanism.

### Important Rules

* `totalAmount` must be positive according to the analyzed validation.
* The initial payment is optional.
* No automatic calculation based on quantity, dimensions, or service base price was identified.
* Initial payment recording is part of the order creation workflow.
* The order creation form's validation must not be treated as a substitute for server-side validation.

**For future development:** Verify that the server action validates all monetary inputs, including discount limits and initial payment amounts, independently of client-side validation.

---

## 8. Subsequent Payment Workflow

Primary entry point identified: `addPaymentAction` in `src/app/actions/orders.ts`.

### Current Workflow

1. The user submits a payment from the order details interface.
2. Authentication is required through `requireUser()`.
3. The submitted amount, method, and optional notes are processed.
4. The server rejects amounts less than or equal to zero.
5. An `OrderPayment` record is created.
6. An `OrderActivity` record is created to record the payment event.
7. The database writes are grouped in a Prisma transaction, according to the analyzed implementation.
8. Relevant application routes are revalidated so updated financial data can be displayed.

### Partial Payments

An order can have multiple payment records.

For example:

| Transaction             |  Amount |
| ----------------------- | ------: |
| Initial cash payment    | 300,000 |
| Subsequent card payment | 200,000 |
| Subsequent transfer     | 100,000 |
| Total paid              | 600,000 |

Partial payments are represented as multiple `OrderPayment` records rather than a separate partial-payment status.

### Current Limitations

* No refund workflow was identified.
* No dedicated reversal or void transaction was identified.
* No idempotency mechanism was identified in the analyzed workflow.
* The server-side validation described above does not by itself establish whether overpayments are permitted or rejected. Verify the actual behavior before changing it.
* Payment recording is not equivalent to bank reconciliation or independent verification of receipt.

---

## 9. Example Financial Scenario

Consider two orders.

### Order #1001

| Field             |    Amount |
| ----------------- | --------: |
| Original amount   | 1,000,000 |
| Discount          |   100,000 |
| Final amount      |   900,000 |
| Payment 1         |   300,000 |
| Payment 2         |   200,000 |
| Total paid        |   500,000 |
| Remaining balance |   400,000 |

### Order #1002

| Field             |  Amount |
| ----------------- | ------: |
| Original amount   | 500,000 |
| Discount          |       0 |
| Final amount      | 500,000 |
| Payment 1         | 500,000 |
| Total paid        | 500,000 |
| Remaining balance |       0 |

### Combined Figures

| Metric                    | Calculation       |    Result |
| ------------------------- | ----------------- | --------: |
| Total final order amounts | 900,000 + 500,000 | 1,400,000 |
| Total payments recorded   | 500,000 + 500,000 | 1,000,000 |
| Total outstanding balance | 400,000 + 0       |   400,000 |

These figures assume both orders are included in the same reporting period and satisfy the relevant report filters.

---

## 10. Order Status vs. Financial Status

The system has operational order statuses, including the following states identified in the analyzed implementation:

```text
NEW
  → REVIEWING
  → IN_PROGRESS
  → READY
  → DELIVERED
```

Additional states include:

* `ON_HOLD`
* `NEEDS_REVISION`
* `CANCELLED`

The exact transition rules are defined in `src/lib/order-state.ts`.

### Current Behavior

* Operational order status and payment balance are separate concepts.
* No dedicated financial status enum such as `UNPAID`, `PARTIALLY_PAID`, or `PAID` was identified.
* An order can reportedly be marked as delivered without being fully paid.
* Payment recording is not inherently tied to a particular operational status.
* Reports derive balances from monetary amounts and payments rather than relying solely on order status.

### Recommended Principle

Do not conflate production progress with payment collection.

If the business requires financial statuses, derive them from the order's final amount and recorded payments rather than allowing users to update a financial status independently.

For example:

```ts
if (paidAmount <= 0) {
  financialStatus = "UNPAID";
} else if (paidAmount < finalAmount) {
  financialStatus = "PARTIAL_PAID";
} else {
  financialStatus = "PAID";
}
```

This is illustrative logic, not a claim that these statuses already exist in the project.

Before adopting it, define the business rules for zero-value orders, overpayments, refunds, cancelled orders, and changes to the order amount.

---

## 11. Employee Commission

Primary file identified: `src/lib/commission.ts`.

The analyzed implementation uses a tiered commission rate based on the employee's monthly eligible order total.

| Monthly eligible total               | Commission rate |
| ------------------------------------ | --------------: |
| Below 100,000,000                    |              3% |
| From 100,000,000 through 200,000,000 |              5% |
| Above 200,000,000                    |              7% |

The commission is calculated using the applicable rate and rounded down to an integer.

Conceptually:

```ts
commission = Math.floor(monthlyTotal * rate);
```

The analyzed workflow calculates commission from eligible delivered orders.

**Important:** Confirm the current threshold comparison operators and the exact date filters in `src/lib/commission.ts` before changing commission rules. The commission reporting period was identified as a limitation because it is not freely configurable in the current workflow.

---

## 12. Authorization and Permissions

The project has two primary roles:

* `ADMIN`
* `STAFF`

Relevant authorization code is located in `src/lib/authz.ts` and `src/app/actions/orders.ts`.

The analyzed implementation includes:

* Authentication checks for server-side actions.
* Manager-specific authorization helpers.
* Order ownership checks for employees.
* `createdByUserId` assignment during order creation.
* Restrictions on employee access to order operations and administrative features.

### Financial Security Requirements

Before adding or changing any financial feature, verify that:

1. Authentication is enforced on the server.
2. Role and ownership permissions are checked in server actions or other trusted server-side code.
3. Users cannot bypass restrictions by directly invoking an action.
4. Sensitive financial information is returned only to authorized users.
5. Payment creator information is recorded where required.
6. All amount and discount validation is performed on the server.

Do not assume that hiding a button in the UI provides authorization.

The exact permissions for each financial operation should be verified against the current implementation rather than inferred from the role names.

---

## 13. Confirmed Issues and Potential Risks

The following issues were reported during the code analysis. Recheck the source before treating this section as a definitive current-state audit.

### 13.1 Confirmed or Reported Implementation Gaps

| Priority | Issue                                                   | Impact                                                                                                    |
| -------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| High     | Manual order pricing                                    | Service prices do not automatically determine the order amount                                            |
| High     | No dedicated financial status                           | Payment state must be inferred from monetary calculations                                                 |
| High     | Order amount can reportedly change after payments exist | Historical payment amounts may no longer align with the final amount                                      |
| High     | No refund workflow identified                           | Returned or reversed payments cannot be properly represented through the standard positive-payment action |
| High     | Cascade deletion of financial records                   | Deleting an order may destroy associated payment history                                                  |
| High     | No dedicated accounting role                            | Financial access is not separated into a dedicated role                                                   |
| Medium   | Payment creator is nullable in the analyzed schema      | Some records may lack clear user attribution                                                              |
| Medium   | No online gateway integration identified                | Online payment processing and gateway reconciliation are unavailable                                      |
| Medium   | No printable invoice/PDF identified                     | Formal document generation is unavailable                                                                 |
| Medium   | Commission period is not freely configurable            | Commission reporting has limited flexibility                                                              |

### 13.2 Potential Data Integrity Risks

**Overpayment and amount changes**

If payments exceed the final order amount, the remaining balance calculation returns zero. It does not indicate that an overpayment occurred.

If the order amount or discount changes after payments have been recorded, the system may produce a financial state that does not reflect the original agreement.

**Duplicate payment submission**

If a payment action is submitted twice, duplicate records may be created unless additional protections exist. Verify whether the UI and backend implement any duplicate-submission or idempotency controls.

**Historical records**

Cascade deletion may remove financial evidence. Consider whether orders with payments should be archived or soft-deleted rather than permanently deleted.

**Integer limits**

The analyzed schema stores monetary values as integers. Confirm the database provider, column type, Prisma type, maximum business amounts, and arithmetic behavior before changing the representation.

A switch to `BigInt` is not automatically sufficient: JavaScript serialization, Prisma operations, API responses, and formatting utilities may also need changes.

**Auditability**

An activity log is useful, but it is not necessarily an immutable accounting ledger. Verify whether records can be edited or deleted and whether the activity log captures all financial changes.

**Reporting periods**

Order creation dates and payment dates answer different questions. Financial reports must use the appropriate date depending on whether they measure sales, collections, or outstanding debt.

---

## 14. Recommended Improvement Roadmap

Recommendations are proposals and must not be treated as existing requirements until approved.

### P0 — Financial Data Integrity

1. Define how order totals and discounts may be changed after payments exist.
2. Prevent unauthorized or inconsistent changes to paid orders.
3. Review deletion behavior for orders with financial records.
4. Ensure all financial inputs are validated server-side.
5. Verify that every financial write is authorized and correctly attributed.
6. Review duplicate payment submission risks and implement appropriate protection if needed.

### P1 — Financial State and Reporting

1. Define financial statuses derived from payment records and the final order amount.
2. Clearly distinguish order-month sales from payment-date collections.
3. Review behavior for overpayments, cancelled orders, and amount changes.
4. Improve financial reporting consistency and document each metric's definition.

### P2 — Operational Accounting Features

1. Add a refund or payment-reversal workflow with explicit transaction types and history.
2. Introduce service-based pricing if required by business operations.
3. Add a dedicated accounting role if financial responsibilities need separation.
4. Add printable invoices or receipts if required.
5. Make commission reporting periods configurable if needed.

### P3 — Advanced Features

1. Integrate an online payment gateway if required.
2. Add gateway transaction identifiers, callback validation, and reconciliation.
3. Add cash-flow and aging reports.
4. Consider multi-currency support only if the business requires it.

### Monetary Representation

Review the current monetary type before deciding whether to migrate from `Int` to `BigInt` or another representation.

Any migration must account for:

* Database column types.
* Prisma schema and queries.
* Arithmetic and validation.
* JSON serialization.
* UI formatting.
* Existing records and migration safety.

Do not perform a financial schema migration without reviewing the complete impact and obtaining approval.

---

## 15. Rules for AI Coding Agents

When modifying financial or payment-related code, follow these rules.

### Before Implementation

1. Read this document.
2. Inspect the current Prisma schema and relevant source files.
3. Trace the complete data flow from UI to server action to database.
4. Identify all affected calculations, reports, and authorization checks.
5. Create a TODO checklist.
6. Explain the proposed changes and identify potential data migrations before implementing risky changes.

### During Implementation

* Preserve existing project architecture and coding conventions.
* Reuse existing financial utilities where appropriate.
* Avoid duplicating calculation logic across pages and components.
* Keep financial validation on the server.
* Enforce authorization on every protected server-side operation.
* Use database transactions when related financial writes must succeed or fail together.
* Do not silently alter established business rules.
* Do not introduce new payment methods, statuses, or roles without an explicit requirement.
* Do not delete or rewrite historical payment records as an incidental side effect.
* Do not treat UI validation as a security boundary.
* Avoid unrelated refactoring.

### Verification

Where applicable, verify:

* Order creation with and without an initial payment.
* Multiple payments against one order.
* Fully paid, partially paid, and unpaid orders.
* Overpayment behavior.
* Discount and amount changes after payments exist.
* Cancelled orders and their effect on reports.
* Payment creation under different roles.
* Duplicate submissions.
* Monthly reporting boundaries.
* Database transaction and migration behavior.

Run the relevant available checks, such as TypeScript validation, linting, builds, and tests. Clearly distinguish checks that passed from checks that were not run.

### After Implementation

Report:

1. Files changed.
2. Business rules changed.
3. Database changes and migration requirements.
4. Security and authorization changes.
5. Tests and verification results.
6. Known limitations and unresolved risks.
7. Whether this documentation needs updating.

Never claim a test passed unless it was actually executed and its result was inspected.

---

## 16. Maintenance

Update this document whenever a change affects:

* Financial models or relationships.
* Order pricing and discount rules.
* Payment recording or payment methods.
* Refunds, reversals, or overpayment behavior.
* Financial statuses.
* Commission calculation.
* Financial reporting definitions.
* Financial permissions.
* Historical data retention.

Keep descriptions of current behavior separate from proposed future behavior.

**Source of truth:** The current codebase, database schema, and approved business requirements take precedence over this document.
