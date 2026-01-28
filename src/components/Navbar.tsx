import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"; 

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/ornek-berber" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">
            Berberim
          </span>
        </Link>

        {/* SAĞ TARAF */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/ornek-berber" 
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Randevu Al
          </Link>
          
          {/* Sadece giriş yapmış kişiler Admin linkini görsün */}
          <SignedIn>
            <Link 
                href="/admin" 
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
                Yönetim Paneli
            </Link>
          </SignedIn>

          {/* CLERK KONTROLLERİ */}
          <div className="flex items-center gap-4">
            {/* Giriş yapmamışsa bu görünür */}
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        Giriş Yap
                    </button>
                </SignInButton>
            </SignedOut>

            {/* Giriş yapmışsa Profil Resmi görünür */}
            <SignedIn>
                <UserButton afterSignOutUrl="/ornek-berber" />
            </SignedIn>
          </div>

        </nav>

      </div>
    </header>
  );
}