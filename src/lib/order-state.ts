import { OrderStatus } from "@/lib/domain";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "جدید",
  REVIEWING: "در حال بررسی",
  IN_PROGRESS: "در حال انجام",
  READY: "آماده تحویل",
  DELIVERED: "تحویل شد",
  CANCELLED: "لغو شد",
  ON_HOLD: "متوقف شد",
  NEEDS_REVISION: "نیازمند اصلاح",
};

export const PRIORITY_LABELS = {
  NORMAL: "عادی",
  URGENT: "فوری",
  VERY_URGENT: "خیلی فوری",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقد",
  CARD: "کارت",
  CARD_TO_CARD: "کارت به کارت",
  TRANSFER: "انتقال",
  OTHER: "سایر",
};

const MAIN_FLOW: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.REVIEWING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
];

const SIDE_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.ON_HOLD,
  OrderStatus.NEEDS_REVISION,
];

export function getAllowedTransitions(current: OrderStatus): OrderStatus[] {
  if (current === OrderStatus.DELIVERED || current === OrderStatus.CANCELLED) {
    return [];
  }

  const allowed = new Set<OrderStatus>();

  if (SIDE_STATUSES.includes(current)) {
    allowed.add(OrderStatus.REVIEWING);
    allowed.add(OrderStatus.IN_PROGRESS);
    allowed.add(OrderStatus.CANCELLED);
    return Array.from(allowed);
  }

  const idx = MAIN_FLOW.indexOf(current);
  if (idx >= 0 && idx < MAIN_FLOW.length - 1) {
    allowed.add(MAIN_FLOW[idx + 1]!);
  }

  if (idx > 0) {
    allowed.add(OrderStatus.NEEDS_REVISION);
  }

  allowed.add(OrderStatus.ON_HOLD);
  allowed.add(OrderStatus.CANCELLED);

  return Array.from(allowed);
}

export function canTransition(from: OrderStatus | string, to: OrderStatus | string): boolean {
  if (from === to) return false;
  return getAllowedTransitions(from as OrderStatus).includes(to as OrderStatus);
}

export const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.REVIEWING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.ON_HOLD,
  OrderStatus.NEEDS_REVISION,
];

export const IN_PROGRESS_STATUSES: OrderStatus[] = [
  OrderStatus.REVIEWING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.NEEDS_REVISION,
];

export function statusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}
