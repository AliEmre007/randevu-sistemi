import { db } from "@/db";
import { appointments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BookingActions from "@/components/admin/BookingActions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Şimdilik sayfayı herkes görebilir (Auth eklemedik).
// Gerçek hayatta buraya giriş koruması konur.
export default async function AdminDashboard() {
  
  // 1. Kullanıcıyı getir
  const user = await currentUser();

  // 2. Kullanıcı giriş yapmamışsa, giriş sayfasına at
  if (!user) {
    redirect("/sign-in");
  }

  // 3. YETKİ KONTROLÜ (En Kritik Kısım)
  // Bu e-posta adresi HARİÇ kimse içeri giremez.
  const adminEmail = "ali.guslu@ogr.sakarya.edu.tr"; // 👈 BURAYA KENDİ MAİLİNİ YAZ
  
  // Kullanıcının e-postalarından biri bizim admin maili ile eşleşiyor mu?
  const isAuthorized = user.emailAddresses.some(
    (email) => email.emailAddress === adminEmail
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi! ⛔</h1>
          <p className="text-gray-600 mb-6">
            Bu sayfayı görüntüleme yetkiniz yok. Sadece işletme sahibi girebilir.
          </p>
          <div className="text-xs bg-gray-100 p-2 rounded text-gray-500 font-mono">
            Giriş yapılan hesap: {user.emailAddresses[0].emailAddress}
          </div>
        </div>
      </div>
    );
  }
  // Veritabanından verileri çek (JOIN işlemi)
  // "with: { service: true }" kısmı az önce eklediğimiz relations sayesinde çalışır.
  const bookings = await db.query.appointments.findMany({
    with: {
      service: true, // Hizmet detaylarını da getir (Adı, fiyatı vs.)
    },
    orderBy: [desc(appointments.startTime)], // En yeni randevu en üstte
  });

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Randevu Yönetim Paneli</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Tarih / Saat</th>
                <th className="p-4 font-semibold text-gray-600">Müşteri</th>
                <th className="p-4 font-semibold text-gray-600">Hizmet</th>
                <th className="p-4 font-semibold text-gray-600">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                        {format(booking.startTime, "d MMM yyyy", { locale: tr })}
                    </div>
                    <div className="text-gray-500 text-sm">
                        {format(booking.startTime, "HH:mm")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-gray-500 text-sm">{booking.customerPhone}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {booking.service.name}
                    </span>
                  </td>
                <td className="p-4">
                        <BookingActions id={booking.id} currentStatus={booking.status} />
                </td>
                </tr>
              ))}

              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Henüz hiç randevu yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}