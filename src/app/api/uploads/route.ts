import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { addOrderFileMetaAction } from "@/app/actions/orders";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const orderId = String(formData.get("orderId") || "");
  const notes = String(formData.get("notes") || "") || undefined;
  const file = formData.get("file");

  if (!orderId || !(file instanceof File)) {
    return NextResponse.json({ error: "داده‌ها ناقص است" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const storedName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads", orderId);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storedName), bytes);

  await addOrderFileMetaAction(orderId, {
    fileName: file.name,
    storedName,
    mimeType: file.type,
    size: file.size,
    notes,
  });

  return NextResponse.json({ ok: true });
}
