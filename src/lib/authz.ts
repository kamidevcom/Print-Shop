import { auth } from "@/lib/auth";
import { Role } from "@/lib/domain";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function isManager(user: { role?: string } | null): boolean {
  return user?.role === Role.ADMIN;
}

export function isEmployee(user: { role?: string } | null): boolean {
  return user?.role === Role.STAFF;
}

export async function requireManager() {
  const user = await requireAuth();
  if (!isManager(user)) {
    throw new Error("Forbidden: Manager access required");
  }
  return user;
}

export async function requireEmployeeOrManager() {
  const user = await requireAuth();
  if (!isManager(user) && !isEmployee(user)) {
    throw new Error("Forbidden: Employee or Manager access required");
  }
  return user;
}

export async function checkOrderOwnership(orderId: string, userId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { createdByUserId: true },
  });
  return order?.createdByUserId === userId;
}

export async function checkOrderAccess(orderId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === Role.ADMIN) return true;
  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { createdByUserId: true },
  });
  return order?.createdByUserId === userId;
}

export function canAccessAdminPanel(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canManageCustomers(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canManageEmployees(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canManageServices(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canViewAllOrders(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canViewAllReports(userRole: string): boolean {
  return userRole === Role.ADMIN;
}

export function canCreateOrder(userRole: string): boolean {
  return userRole === Role.ADMIN || userRole === Role.STAFF;
}

export function canViewDashboard(userRole: string): boolean {
  return userRole === Role.ADMIN || userRole === Role.STAFF;
}

export function getOrderWhereClause(userId: string, userRole: string, baseWhere: Record<string, unknown> = {}) {
  if (userRole === Role.ADMIN) {
    return baseWhere;
  }
  return {
    ...baseWhere,
    createdByUserId: userId,
  };
}

export function getReportWhereClause(userId: string, userRole: string, baseWhere: Record<string, unknown> = {}) {
  if (userRole === Role.ADMIN) {
    return baseWhere;
  }
  return {
    ...baseWhere,
    createdByUserId: userId,
  };
}