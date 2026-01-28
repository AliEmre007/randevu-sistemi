"use client";

import { addDays, format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale"; // Türkçe tarih formatı için

interface DateSelectorProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  // Bugünden itibaren önümüzdeki 5 günü bir diziye atalım
  // Örn: [Bugün, Yarın, ..., 5. Gün]
  const days = Array.from({ length: 5 }).map((_, i) => addDays(new Date(), i));

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="font-semibold text-gray-900 mb-3">Tarih Seçin</h3>
      
      {/* Yatay kaydırılabilir alan */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((date, index) => {
          // Bu kart seçili mi?
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <button
              key={index}
              onClick={() => onSelect(date)}
              className={`
                flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all
                ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }
              `}
            >
              {/* Gün İsmi (Pzt, Sal) */}
              <span className="text-xs font-medium uppercase">
                {format(date, "EEE", { locale: tr })}
              </span>
              {/* Gün Numarası (27, 28) */}
              <span className={`text-xl font-bold mt-1 ${isSelected ? "text-white" : "text-gray-900"}`}>
                {format(date, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}