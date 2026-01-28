import { db } from "@/db";
import { tenants, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ServiceSelector from "@/components/booking/ServiceSelector"; // 👈 Yeni import

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Veritabanı işlemleri (Server-Side)
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });

  if (!tenant) {
    notFound();
  }

  // Veriyi çekiyoruz
  const tenantServices = await db.query.services.findMany({
    where: eq(services.tenantId, tenant.id),
    orderBy: (services, { asc }) => [asc(services.price)],
  });

  return (
    <main className="min-h-screen bg-slate-50 p-10 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header kısmı hala Server Side Rendered (Hızlı) */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
          <p className="text-indigo-200 text-sm mt-1">Online Randevu</p>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hizmet Seçin</h2>
          
          {/* Veriyi Server'da çektik, Client Component'e "Props" olarak geçiyoruz.
              Burası artık interaktif! 
          */}
          <ServiceSelector services={tenantServices} />
          
        </div>
      </div>
    </main>
  );
}