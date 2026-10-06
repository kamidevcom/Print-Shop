import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/lib/domain";
import { calculateCommission } from "@/lib/commission";
import { monthRange } from "@/lib/jalali";

export async function getEmployeePerformance(employeeId: string, year: number, month: number) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return null;

  const orders = await prisma.order.findMany({
    where: { assigneeId: employeeId },
    include: {
      service: { include: { category: true } },
      customer: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = orders.length;
  const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
  const inProgress = orders.filter((o) =>
    (
      [
        OrderStatus.NEW,
        OrderStatus.REVIEWING,
        OrderStatus.IN_PROGRESS,
        OrderStatus.READY,
        OrderStatus.NEEDS_REVISION,
        OrderStatus.ON_HOLD,
      ] as string[]
    ).includes(o.status),
  ).length;
  const cancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;
  const assignedTotalAmount = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.totalAmount - o.discount, 0);

  const { start, end } = monthRange(year, month);
  const monthDelivered = orders.filter(
    (o) =>
      o.status === OrderStatus.DELIVERED &&
      o.deliveredAt &&
      o.deliveredAt >= start &&
      o.deliveredAt < end,
  );
  const monthlyTotal = monthDelivered.reduce((sum, o) => sum + o.totalAmount - o.discount, 0);
  const commission = calculateCommission(monthlyTotal);

  return {
    employee,
    stats: { total, delivered, inProgress, cancelled, assignedTotalAmount },
    commission,
    monthDeliveredCount: monthDelivered.length,
    orders,
  };
}
