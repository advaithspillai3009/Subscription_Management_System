export type UserRole = "admin" | "staff" | "customer";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  customerId?: string | null;
}

export type BillingFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type SubscriptionStatus =
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "paused"
  | "closed";

export type InvoiceStatus =
  | "draft"
  | "confirmed"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export type PaymentMethod =
  | "upi"
  | "net_banking"
  | "card"
  | "bank_transfer"
  | "cheque"
  | "cash";

export interface TelemetrySummary {
  activeSubscriptions: number;
  activeSubscriptionsGrowth: number;
  contractedMRR: number;
  contractedMRRGrowth: number;
  contractedARR: number;
  totalCustomers: number;
  pendingSettlementsAmount: number;
  pendingSettlementsCount: number;
  overdueInvoicesAmount: number;
  overdueInvoicesCount: number;
  totalCashCollected: number;
}
