"use server"; // 👈 BU KOD SADECE SUNUCUDA ÇALIŞIR

import { db } from "@/db";
import { businessHours } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getAvailableSlots(
  date: Date,
  tenantId: string,
  serviceDuration: number
) {
  // 1. Seçilen tarihin hangi gün olduğunu bul (0: Pazar, 1: Ptesi ... 6: Ctesi)
  const dayOfWeek = date.getDay();

  // 2. Veritabanından o günün çalışma saatlerini çek
  const workHours = await db.query.businessHours.findFirst({
    where: and(
      eq(businessHours.tenantId, tenantId),
      eq(businessHours.dayOfWeek, dayOfWeek)
    ),
  });

  // Eğer o gün kayıt yoksa (Tatilse) boş dizi dön
  if (!workHours) {
    return [];
  }

  // 3. Saatleri oluştur (Örn: 09:00, 09:30, 10:00...)
  const slots: string[] = [];
  
  // "09:00:00" -> "09:00" formatına çevirip sayıya dökelim
  // Basitlik için saatleri dakika cinsinden hesaplayacağız
  // Örn: 09:00 -> 540. dakika
  const startMinutes = timeToMinutes(workHours.startTime as string);
  const endMinutes = timeToMinutes(workHours.endTime as string);

  let currentMinutes = startMinutes;

  // Kapanış saatine kadar döngü kur
  while (currentMinutes + serviceDuration <= endMinutes) {
    // Dakikayı tekrar saate çevir (540 -> "09:00")
    slots.push(minutesToTime(currentMinutes));
    
    // Süre kadar ileri git (30 dk ekle)
    currentMinutes += serviceDuration;
  }

  return slots;
}

// --- YARDIMCI MATEMATİK FONKSİYONLARI ---

// "09:30" -> 570 dakika yapar
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// 570 -> "09:30" yapar
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  // PadStart: Tek haneli ise başına 0 ekle (9 -> 09)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}