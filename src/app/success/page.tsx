import Link from "next/link";

// Next.js 15 Uyumlu Hali
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; time?: string }>; // Tip artık Promise
}) {
  // ÖNCE params'ı await ediyoruz (Next.js 15 kuralı)
  const params = await searchParams;
  
  const date = params.date || "Belirtilmedi";
  const time = params.time || "Belirtilmedi";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        
        {/* Yeşil Tik Animasyonu */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Randevunuz Alındı! 🎉</h1>
        <p className="text-gray-600 mb-8">
          Berberimiz bu saat için yerini ayırdı. Seni görmek için sabırsızlanıyoruz.
        </p>

        {/* Özet Kutusu */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">Tarih:</span>
            <span className="font-semibold text-gray-900">{date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Saat:</span>
            <span className="font-semibold text-gray-900">{time}</span>
          </div>
        </div>

        {/* Ana Sayfaya Dön Butonu */}
        <Link 
          href="/ornek-berber"
          className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Yeni Randevu Al
        </Link>
      </div>
    </main>
  );
}