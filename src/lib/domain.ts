export const Role = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const CustomerType = {
  NORMAL: "NORMAL",
  STUDENT: "STUDENT",
  BUSINESS: "BUSINESS",
} as const;
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  NORMAL: "عادی",
  STUDENT: "دانش‌آموز",
  BUSINESS: "صاحب کسب‌وکار",
};

export const OrderStatus = {
  NEW: "NEW",
  REVIEWING: "REVIEWING",
  IN_PROGRESS: "IN_PROGRESS",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  ON_HOLD: "ON_HOLD",
  NEEDS_REVISION: "NEEDS_REVISION",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderPriority = {
  NORMAL: "NORMAL",
  URGENT: "URGENT",
  VERY_URGENT: "VERY_URGENT",
} as const;
export type OrderPriority = (typeof OrderPriority)[keyof typeof OrderPriority];

export const PaymentMethod = {
  CASH: "CASH",
  CARD: "CARD",
  CARD_TO_CARD: "CARD_TO_CARD",
  TRANSFER: "TRANSFER",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
