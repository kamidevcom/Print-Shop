"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { OrderPriority, OrderStatus, PaymentMethod } from "@/lib/domain";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransition, ORDER_STATUS_LABELS } from "@/lib/order-state";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

async function nextOrderNumber(tx: Prisma.TransactionClient) {
  const counter = await tx.orderCounter.upsert({
    where: { id: "default" },
    update: { value: { increment: 1 } },
    create: { id: "default", value: 1001 },
  });
  return counter.value;
}

async function logActivity(
  tx: Prisma.TransactionClient,
  orderId: string,
  message: string,
  userId?: string,
  meta?: Record<string, unknown>,
) {
  await tx.orderActivity.create({
    data: {
      orderId,
      message,
      createdBy: userId,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

export async function createOrderAction(formData: FormData) {
  const user = await requireUser();

  const customerId = String(formData.get("customerId") || "");
  const serviceId = String(formData.get("serviceId") || "");
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const description = String(formData.get("description") || "") || null;
  const internalNote = String(formData.get("internalNote") || "") || null;
  const priority = (String(formData.get("priority") || "NORMAL") as OrderPriority) || "NORMAL";
  const totalAmount = Number(formData.get("totalAmount") || 0);
  const discount = Number(formData.get("discount") || 0);
  const expectedAtRaw = String(formData.get("expectedAt") || "");
  const expectedAt = expectedAtRaw ? new Date(expectedAtRaw) : null;
  const createdAtRaw = String(formData.get("createdAt") || "");
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date();
  const initialPaid = Number(formData.get("initialPaid") || 0);
  const paymentMethod = (String(formData.get("paymentMethod") || "CARD") as PaymentMethod) || "CARD";

  if (!customerId || !serviceId) {
    throw new Error("مشتری و خدمت الزامی است");
  }

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await nextOrderNumber(tx);
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        serviceId,
        assigneeId,
        description,
        internalNote,
        priority,
        totalAmount,
        discount,
        expectedAt,
        createdAt,
        status: OrderStatus.NEW,
        statusHistory: {
          create: { fromStatus: null, toStatus: OrderStatus.NEW },
        },
      },
    });

    await logActivity(tx, created.id, "سفارش ایجاد شد", user.id, { orderNumber });

    if (assigneeId) {
      const emp = await tx.employee.findUnique({ where: { id: assigneeId } });
      await logActivity(
        tx,
        created.id,
        `به ${emp?.firstName ?? ""} ${emp?.lastName ?? ""} اختصاص داده شد`,
        user.id,
      );
    }

    if (initialPaid > 0) {
      await tx.orderPayment.create({
        data: {
          orderId: created.id,
          amount: initialPaid,
          method: paymentMethod,
          createdBy: user.id,
        },
      });
      await logActivity(tx, created.id, `بیانه ${initialPaid.toLocaleString("fa-IR")} تومان`, user.id);
    }

    return created;
  });

  revalidatePath("/orders");
  revalidatePath("/");
  redirect(`/orders/${order.id}`);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const user = await requireUser();

  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const description = String(formData.get("description") || "") || null;
  const internalNote = String(formData.get("internalNote") || "") || null;
  const priority = String(formData.get("priority") || "NORMAL") as OrderPriority;
  const totalAmount = Number(formData.get("totalAmount") || 0);
  const discount = Number(formData.get("discount") || 0);
  const expectedAtRaw = String(formData.get("expectedAt") || "");
  const expectedAt = expectedAtRaw ? new Date(expectedAtRaw) : null;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { assignee: true },
  });
  if (!existing) throw new Error("سفارش یافت نشد");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        assigneeId,
        description,
        internalNote,
        priority,
        totalAmount,
        discount,
        expectedAt,
      },
    });

    if (existing.assigneeId !== assigneeId) {
      if (assigneeId) {
        const emp = await tx.employee.findUnique({ where: { id: assigneeId } });
        await logActivity(
          tx,
          orderId,
          `به ${emp?.firstName ?? ""} ${emp?.lastName ?? ""} اختصاص داده شد`,
          user.id,
        );
      } else {
        await logActivity(tx, orderId, "تخصیص کارمند برداشته شد", user.id);
      }
    }

    if (
      existing.totalAmount !== totalAmount ||
      existing.discount !== discount ||
      existing.priority !== priority ||
      existing.description !== description ||
      existing.internalNote !== internalNote
    ) {
      await logActivity(tx, orderId, "اطلاعات سفارش به‌روزرسانی شد", user.id);
    }
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/");
}

export async function changeOrderStatusAction(orderId: string, toStatus: OrderStatus) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("سفارش یافت نشد");
  if (!canTransition(order.status, toStatus)) {
    throw new Error("تغییر وضعیت مجاز نیست");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: toStatus,
        deliveredAt: toStatus === OrderStatus.DELIVERED ? new Date() : order.deliveredAt,
      },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus,
      },
    });
    await logActivity(
      tx,
      orderId,
      `وضعیت → ${ORDER_STATUS_LABELS[toStatus]}`,
      user.id,
      { from: order.status, to: toStatus },
    );
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function addPaymentAction(orderId: string, formData: FormData) {
  const user = await requireUser();
  const amount = Number(formData.get("amount") || 0);
  const method = (String(formData.get("method") || "CASH") as PaymentMethod) || "CASH";
  const notes = String(formData.get("notes") || "") || null;

  if (amount <= 0) throw new Error("مبلغ نامعتبر است");

  await prisma.$transaction(async (tx) => {
    await tx.orderPayment.create({
      data: {
        orderId,
        amount,
        method,
        notes,
        createdBy: user.id,
      },
    });
    await logActivity(
      tx,
      orderId,
      `پرداخت ${amount.toLocaleString("fa-IR")} تومان ثبت شد`,
      user.id,
      { amount, method },
    );
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/customers");
  revalidatePath("/");
}

export async function deleteOrderAction(orderId: string) {
  await requireUser();
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/reports");
  redirect("/orders");
}

export async function addOrderFileMetaAction(
  orderId: string,
  data: {
    fileName: string;
    storedName: string;
    mimeType?: string;
    size?: number;
    notes?: string;
  },
) {
  const user = await requireUser();
  const last = await prisma.orderFile.findFirst({
    where: { orderId },
    orderBy: { version: "desc" },
  });
  const version = (last?.version ?? 0) + 1;

  await prisma.$transaction(async (tx) => {
    await tx.orderFile.create({
      data: {
        orderId,
        fileName: data.fileName,
        storedName: data.storedName,
        mimeType: data.mimeType,
        size: data.size,
        notes: data.notes,
        version,
      },
    });
    await logActivity(tx, orderId, `فایل جدید آپلود شد (نسخه ${version})`, user.id, {
      fileName: data.fileName,
      version,
    });
  });

  revalidatePath(`/orders/${orderId}`);
}
