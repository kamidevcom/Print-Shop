import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function remainingAmount(total: number, discount: number, paid: number): number {
  return Math.max(0, total - discount - paid);
}
