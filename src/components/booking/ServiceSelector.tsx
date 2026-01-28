"use client";

import { useState, useEffect } from "react";
import DateSelector from "./DateSelector";
import { getAvailableSlots } from "@/actions/getSlots"; // 👈 Server Action
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createBooking } from "@/actions/createBooking";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: string;
  tenantId: string; // 👈 Bunu ekledik, action için lazım
}

export default function ServiceSelector({ services }: { services: Service[] }) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();
  // YENİ STATE'LER
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // SEÇİLEN HİZMETİ BUL
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // TARİH VEYA HİZMET DEĞİŞTİĞİNDE ÇALIŞIR
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedService) return;

      setLoading(true);
      setTimeSlots([]); // Önce temizle
      setSelectedTime(null);

      // Server Action'ı çağır
      const slots = await getAvailableSlots(
        selectedDate,
        selectedService.tenantId,
        selectedService.duration
      );

      setTimeSlots(slots);
      setLoading(false);
    }

    fetchSlots();
  }, [selectedDate, selectedService]); // Bu ikisi değişince tekrar çalış

  const handleServiceSelect = (id: string) => {
    if (selectedServiceId === id) {
        setSelectedServiceId(null);
        setSelectedDate(null);
    } else {
        setSelectedServiceId(id);
        setSelectedDate(null);
    }
    setSelectedTime(null);
  };

  return (
    <div>
      {/* 1. HİZMETLER LİSTESİ */}
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className={`
              flex justify-between items-center p-4 border rounded-lg cursor-pointer transition-all
              ${selectedServiceId === service.id ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200" : "border-gray-100 hover:border-indigo-300 hover:bg-gray-50"}
            `}
          >
            <div>
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.duration} dakika</p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-gray-900">{service.price} ₺</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. TARİH SEÇİMİ */}
      {selectedServiceId && (
        <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
      )}

      {/* 3. SAAT SEÇİMİ (YENİ BÖLÜM) */}
      {selectedDate && (
        <div className="mt-6 animate-in fade-in">
          <h3 className="font-semibold text-gray-900 mb-3">Saat Seçin</h3>
          
          {loading ? (
            <div className="text-sm text-gray-500">Saatler yükleniyor...</div>
          ) : timeSlots.length === 0 ? (
            <div className="p-4 bg-orange-50 text-orange-700 rounded-lg text-sm">
              Bugün için uygun saat bulunamadı veya iş yeri kapalı.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`
                    py-2 rounded-md text-sm font-medium transition-colors
                    ${selectedTime === time 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600"}
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MÜŞTERİ BİLGİLERİ VE ONAY */}
      {selectedTime && selectedService && selectedDate && (
        <div className="mt-8 pt-4 border-t border-gray-100 animate-in slide-in-from-bottom-2">
            
            {/* Özet Kutusu */}
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100">
                <span className="block text-xs uppercase tracking-wide text-indigo-500 font-bold mb-1">Randevu Özeti</span>
                <div className="font-semibold text-gray-900 text-lg">
                    {selectedService.name}
                </div>
                <div className="text-gray-600 mt-1 flex items-center gap-2">
                    📅 {format(selectedDate, "d MMMM yyyy", { locale: tr })} 
                    ⏰ {selectedTime}
                </div>
                <div className="text-gray-600 mt-1">
                    💰 {selectedService.price} ₺
                </div>
            </div>

            {/* Müşteri Formu (GÜNCELLENMİŞ HALİ) */}
            <form action={async (formData) => {
                const name = formData.get("name") as string;
                const phone = formData.get("phone") as string;
                
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const fullDateTime = `${dateStr} ${selectedTime}`;

                // 1. Sonucu değişkene al (Artık körü körüne gitmiyoruz)
                const result = await createBooking({
                    tenantId: selectedService.tenantId,
                    serviceId: selectedService.id,
                    startTime: fullDateTime,
                    customerName: name,
                    customerPhone: phone
                });

                // 2. Kontrol et: Başarılı mı?
                if (result.success) {
                    const formattedDate = format(selectedDate, "d MMMM yyyy", { locale: tr });
                    // URL Parametrelerini güvenli oluşturma yöntemi:
                    const params = new URLSearchParams();
                    params.set("date", formattedDate);
                    params.set("time", selectedTime);
                    router.push(`/success?${params.toString()}`);
                } else {
                    // BAŞARISIZ! (Çakışma var)
                    alert(result.message); // "Üzgünüz, bu saat dolu!"
                    // Sayfayı yenilemiyoruz, böylece kullanıcı başka saat seçebilir.
                }

            }} className="space-y-4">
                
                {/* ... inputlar ve buton aynı ... */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
                    <input 
                        name="name"
                        required 
                        type="text" 
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numaranız</label>
                    <input 
                        name="phone"
                        required 
                        type="tel" 
                        placeholder="0555 123 45 67"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-100 mt-4"
                >
                    Randevuyu Onayla ✓
                </button>
            </form>
        </div>
      )}
    </div>
  );
}