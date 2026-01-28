import { db } from "@/db";
import { appointments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BookingActions from "@/components/admin/BookingActions";

// Şimdilik sayfayı herkes görebilir (Auth eklemedik).
// Gerçek hayatta buraya giriş koruması konur.
export default async function AdminDashboard() {
  
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