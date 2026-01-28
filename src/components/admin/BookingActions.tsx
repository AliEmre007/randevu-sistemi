"use client";

import { updateBookingStatus } from "@/actions/updateStatus";
import { useState } from "react";

export default function BookingActions({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: "confirmed" | "cancelled") => {
    if(!confirm(status === "confirmed" ? "Onaylıyor musun?" : "İptal etmek istediğine emin misin?")) return;
    
    setLoading(true);
    await updateBookingStatus(id, status);
    setLoading(false);
  };

  if (currentStatus === "cancelled") {
    return <span className="text-red-500 text-sm font-bold">İptal Edildi ❌</span>;
  }

  if (currentStatus === "confirmed") {
    return (
        <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-bold">Onaylandı ✅</span>
            <button 
                onClick={() => handleUpdate("cancelled")}
                disabled={loading}
                className="text-xs text-gray-400 underline hover:text-red-500"
            >
                İptal Et
            </button>
        </div>
    );
  }

  // Varsayılan (Bekliyor) durumu
  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleUpdate("confirmed")}
        disabled={loading}
        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Onayla"}
      </button>
      
      <button
        onClick={() => handleUpdate("cancelled")}
        disabled={loading}
        className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        Reddet
      </button>
    </div>
  );
}