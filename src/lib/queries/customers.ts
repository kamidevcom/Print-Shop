import { prisma } from "@/lib/prisma";
import { remainingAmount } from "@/lib/utils";
import { OrderStatus } from "@/lib/domain";

export async function getCustomerStats(customerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      customerId,
      status: { not: OrderStatus.CANCELLED },
    },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  const orderCount = orders.length;
  const totalPurchase = orders.reduce((sum, o) => sum + o.totalAmount - o.discount, 0);
  const debt = orders.reduce((sum, o) => {
    const paid = o.payments.reduce((p, pay) => p + pay.amount, 0);
    return sum + remainingAmount(o.totalAmount, o.discount, paid);
  }, 0);
  const lastOrder = orders[0] ?? null;

  return { orderCount, totalPurchase, debt, lastOrder };
}

export async function listCustomersWithStats(search?: string) {
  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { mobile: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { status: { not: OrderStatus.CANCELLED } },
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return customers.map((c) => {
    const orderCount = c.orders.length;
    const totalPurchase = c.orders.reduce((sum, o) => sum + o.totalAmount - o.discount, 0);
    const debt = c.orders.reduce((sum, o) => {
      const paid = o.payments.reduce((p, pay) => p + pay.amount, 0);
      return sum + remainingAmount(o.totalAmount, o.discount, paid);
    }, 0);
    const lastOrder = c.orders[0] ?? null;
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      mobile: c.mobile,
      type: c.type,
      address: c.address,
      notes: c.notes,
      isActive: c.isActive,
      isDefault: c.isDefault,
      createdAt: c.createdAt,
      orderCount,
      totalPurchase,
      debt,
      lastOrderAt: lastOrder?.createdAt ?? null,
      lastOrderNumber: lastOrder?.orderNumber ?? null,
    };
  });
}

export function paidFromPayments(payments: { amount: number }[]) {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}
