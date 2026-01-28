"use server";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Durumu güncelleyen fonksiyon
export async function updateBookingStatus(appointmentId: string, newStatus: "confirmed" | "cancelled") {
  
  // 1. Veritabanında güncelle
  await db
    .update(appointments)
    .set({ status: newStatus })
    .where(eq(appointments.id, appointmentId));

  // 2. Admin sayfasını yenile (Yeni durum görünsün diye)
  revalidatePath("/admin");
}