import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "مدیر سیستم",
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const categories = [
    {
      name: "طراحی",
      sortOrder: 1,
      services: ["طراحی کارت ویزیت", "طراحی تراکت", "طراحی بنر"],
    },
    {
      name: "چاپ",
      sortOrder: 2,
      services: ["کارت ویزیت", "تراکت", "بنر", "بروشور", "پوستر"],
    },
    {
      name: "تایپ",
      sortOrder: 3,
      services: ["تایپ فارسی", "تایپ انگلیسی"],
    },
    {
      name: "صحافی",
      sortOrder: 4,
      services: ["فنری", "چسب گرم", "منگنه"],
    },
    {
      name: "سایر",
      sortOrder: 5,
      services: ["خدمات متفرقه"],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: { sortOrder: cat.sortOrder, isActive: true },
      create: {
        name: cat.name,
        sortOrder: cat.sortOrder,
      },
    });

    for (const serviceName of cat.services) {
      await prisma.service.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: serviceName,
          },
        },
        update: { isActive: true },
        create: {
          name: serviceName,
          categoryId: category.id,
        },
      });
    }
  }

  await prisma.orderCounter.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", value: 1000 },
  });

  const employees = [
    { firstName: "محمد", lastName: "کریمی", title: "اپراتور چاپ", phone: "09121111111" },
    { firstName: "سارا", lastName: "احمدی", title: "طراح", phone: "09122222222" },
    { firstName: "رضا", lastName: "موسوی", title: "صحافی", phone: "09123333333" },
  ];

  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({
      where: { firstName: emp.firstName, lastName: emp.lastName },
    });
    if (!existing) {
      await prisma.employee.create({ data: emp });
    }
  }

  const defaultEmp = await prisma.employee.findFirst({
    where: { firstName: "محمد", lastName: "کریمی" },
  });
  if (defaultEmp && !defaultEmp.isDefaultAssignee) {
    await prisma.employee.updateMany({ data: { isDefaultAssignee: false } });
    await prisma.employee.update({
      where: { id: defaultEmp.id },
      data: { isDefaultAssignee: true },
    });
  }

  const sampleCustomer = await prisma.customer.findFirst({
    where: { mobile: "09121234567" },
  });
  if (!sampleCustomer) {
    await prisma.customer.create({
      data: {
        firstName: "علی",
        lastName: "رضایی",
        mobile: "09121234567",
        type: "NORMAL",
        address: "تهران، خیابان ولیعصر",
        notes: "مشتری نمونه",
      },
    });
  }

  console.log("Seed completed. Admin login: admin / admin123");
  console.log("Admin user id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
