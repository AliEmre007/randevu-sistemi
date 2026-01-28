"use server";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm"; // 👈 and ve eq eklendi

interface BookingData {
  tenantId: string;
  serviceId: string;
  startTime: string; 
  customerName: string;
  customerPhone: string;
}

export async function createBooking(data: BookingData) {
  const newAppointmentDate = new Date(data.startTime);

  // 1. BEKÇİ KONTROLÜ: Bu dükkanda, bu saatte başka randevu var mı?
  const existingBooking = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.tenantId, data.tenantId), // Aynı dükkan
      eq(appointments.startTime, newAppointmentDate), // Aynı saat
      // İpucu: İptal edilmiş randevuları saymamalıyız.
      // Şimdilik basit tutalım, ileride "status != cancelled" da ekleriz.
    ),
  });

  // Eğer randevu varsa, işlemi durdur ve hata dön
  if (existingBooking) {
    return { success: false, message: "Üzgünüz, bu saat az önce başkası tarafından alındı! 😔" };
  }

  // 2. Sorun yoksa kaydet
  await db.insert(appointments).values({
    tenantId: data.tenantId,
    serviceId: data.serviceId,
    startTime: newAppointmentDate,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    status: "pending",
  });

  revalidatePath("/admin"); 
  revalidatePath("/admin/appointments");

  return { success: true, message: "Randevunuz başarıyla oluşturuldu!" };
}