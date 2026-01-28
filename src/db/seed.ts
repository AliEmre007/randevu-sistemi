import { db } from "./index";
import { tenants, services, businessHours } from "./schema";

async function main() {
  console.log("🌱 Temizlik yapılıyor...");
  // Önce bağlı tabloları, en son ana tabloyu siliyoruz (Foreign Key hatası almamak için)
  await db.delete(businessHours);
  await db.delete(services);
  await db.delete(tenants);

  console.log("🌱 Yeni veriler ekleniyor...");

  // 1. İşletme Ekle
  const newTenant = await db.insert(tenants).values({
    name: "Örnek Berber Salonu",
    slug: "ornek-berber",
    timezone: "Europe/Istanbul"
  }).returning(); 

  const tenantId = newTenant[0].id;
  console.log("✅ İşletme oluşturuldu:", newTenant[0].name);

  // 2. Hizmetleri Ekle
  await db.insert(services).values([
    {
      tenantId: tenantId,
      name: "Saç Kesimi",
      duration: 30, // 30 dk
      price: "200.00",
    },
    {
      tenantId: tenantId,
      name: "Sakal Tıraşı",
      duration: 15, // 15 dk
      price: "100.00",
    },
    {
      tenantId: tenantId,
      name: "Saç + Sakal + Yıkama",
      duration: 60, // 1 saat
      price: "350.00",
    },
  ]);
  console.log("✅ Hizmetler eklendi.");

  // 3. Mesai Saatlerini Ekle (Pazartesi'den Cumartesi'ye)
  // dayOfWeek: 0=Pazar, 1=Pazartesi, ... 6=Cumartesi
  const hours = [];
  
  // Pazartesi(1)'den Cumartesi(6)'ya kadar dön
  for (let i = 1; i <= 6; i++) {
    hours.push({
      tenantId: tenantId,
      dayOfWeek: i,
      startTime: "09:00:00", // Sabah 9
      endTime: "18:00:00",   // Akşam 6
    });
  }

  await db.insert(businessHours).values(hours);
  console.log("✅ Mesai saatleri (Pzt-Cmt: 09:00-18:00) eklendi.");

  console.log("🏁 Seeding başarıyla tamamlandı!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });