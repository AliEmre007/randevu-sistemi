import { pgTable, text, timestamp, uuid, integer, boolean, decimal, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; 

// Tenants (İşletmeler) Tablosu
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(), // UUID ve Primary Key
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(), // URL'de kullanmak için (örn: randevu.com/kuafor-ali)
  timezone: text("timezone").default("Europe/Istanbul").notNull(), // Kritik Timezone alanı
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Typescript tiplerini buradan türetiyoruz (Infer)
// Böylece frontend'de "name" string mi number mı diye düşünmeyeceksin.
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;


export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id) // İŞTE BU! "Bu hizmet, şu işletmeye aittir" diyoruz.
    .notNull(),
  name: text("name").notNull(),
  duration: integer("duration_min").notNull(), // Dakika cinsinden (Örn: 45)
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Para birimi (10.2 formatında)
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tipleri de dışarı aktaralım
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export const businessHours = pgTable("business_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id) // Hangi işletmenin saati?
    .notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Pazar, 1=Pazartesi... 6=Cumartesi
  startTime: time("start_time").notNull(), // Örn: 09:00:00
  endTime: time("end_time").notNull(), // Örn: 18:00:00
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tipleri dışarı aktaralım
export type BusinessHour = typeof businessHours.$inferSelect;
export type NewBusinessHour = typeof businessHours.$inferInsert;


// --- MEVCUT KODLARININ ALTINA EKLE ---

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Hangi dükkan?
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
    
  // Hangi hizmet?
  serviceId: uuid("service_id")
    .references(() => services.id)
    .notNull(),
    
  // Ne zaman? (Tarih + Saat bilgisi timestamp olarak tutulur)
  startTime: timestamp("start_time").notNull(),
  
  // Kim?
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  
  // Durum nedir? (pending: onay bekliyor, confirmed: onaylandı, cancelled: iptal)
  status: text("status").default("pending").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tipleri dışarı aktaralım
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

// --- İLİŞKİLER (RELATIONS) ---
// Bu kod veritabanını değiştirmez, sadece kod yazarken "Join" yapmamızı kolaylaştırır.

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  }),
}));