"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerType } from "@/lib/domain";

function parseCustomerType(raw: FormDataEntryValue | null) {
  const value = String(raw || CustomerType.NORMAL);
  if (value === CustomerType.STUDENT || value === CustomerType.BUSINESS) return value;
  return CustomerType.NORMAL;
}

export async function createCustomerAction(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const type = parseCustomerType(formData.get("type"));
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!firstName || !lastName || !mobile) {
    throw new Error("نام، نام خانوادگی و موبایل الزامی است");
  }

  const customer = await prisma.customer.create({
    data: { firstName, lastName, mobile, type, address, notes },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function createCustomerQuickAction(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const type = parseCustomerType(formData.get("type"));
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!firstName || !lastName || !mobile) {
    return { error: "نام، نام خانوادگی و موبایل الزامی است" };
  }

  const customer = await prisma.customer.create({
    data: { firstName, lastName, mobile, type, address, notes },
  });

  revalidatePath("/customers");
  revalidatePath("/orders/new");

  return {
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      mobile: customer.mobile,
      type: customer.type,
    },
  };
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const type = parseCustomerType(formData.get("type"));
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const isActive = String(formData.get("isActive") || "true") === "true";

  await prisma.customer.update({
    where: { id },
    data: { firstName, lastName, mobile, type, address, notes, isActive },
  });

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
}

export async function createEmployeeAction(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const title = String(formData.get("title") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const isDefaultAssignee = String(formData.get("isDefaultAssignee") || "") === "true";
  const startedAtRaw = String(formData.get("startedAt") || "");
  const startedAt = startedAtRaw ? new Date(startedAtRaw) : new Date();

  if (!firstName || !lastName) throw new Error("نام و نام خانوادگی الزامی است");

  const employee = await prisma.$transaction(async (tx) => {
    if (isDefaultAssignee) {
      await tx.employee.updateMany({ data: { isDefaultAssignee: false } });
    }
    return tx.employee.create({
      data: { firstName, lastName, phone, title, notes, startedAt, isDefaultAssignee },
    });
  });

  revalidatePath("/employees");
  redirect(`/employees/${employee.id}`);
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const title = String(formData.get("title") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const isActive = String(formData.get("isActive") || "true") === "true";
  const isDefaultAssignee = String(formData.get("isDefaultAssignee") || "") === "true";
  const startedAtRaw = String(formData.get("startedAt") || "");
  const startedAt = startedAtRaw ? new Date(startedAtRaw) : undefined;

  await prisma.$transaction(async (tx) => {
    if (isDefaultAssignee) {
      await tx.employee.updateMany({
        where: { NOT: { id } },
        data: { isDefaultAssignee: false },
      });
    }
    await tx.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        title,
        notes,
        isActive,
        isDefaultAssignee,
        ...(startedAt ? { startedAt } : {}),
      },
    });
  });

  revalidatePath(`/employees/${id}`);
  revalidatePath("/employees");
  revalidatePath("/orders/new");
}

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("نام دسته الزامی است");
  await prisma.serviceCategory.create({ data: { name } });
  revalidatePath("/services");
}

export async function createServiceAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const basePriceRaw = String(formData.get("basePrice") || "");
  const basePrice = basePriceRaw ? Number(basePriceRaw) : null;
  if (!name || !categoryId) throw new Error("نام خدمت و دسته الزامی است");

  await prisma.service.create({
    data: { name, categoryId, basePrice },
  });
  revalidatePath("/services");
}

export async function toggleServiceAction(id: string, isActive: boolean) {
  await prisma.service.update({ where: { id }, data: { isActive } });
  revalidatePath("/services");
}

export async function toggleCategoryAction(id: string, isActive: boolean) {
  await prisma.serviceCategory.update({ where: { id }, data: { isActive } });
  revalidatePath("/services");
}

export async function deleteCustomerAction(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteEmployeeAction(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/employees");
  redirect("/employees");
}
