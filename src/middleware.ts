import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Hangi sayfalar KORUMALI? (Sadece /admin ve altındakiler)
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Eğer kullanıcı korumalı sayfaya girmeye çalışıyorsa ve giriş yapmamışsa,
  // onu giriş sayfasına yönlendir.
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Next.js'in iç dosyaları (static, image vb.) hariç her şeyi kontrol et
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};