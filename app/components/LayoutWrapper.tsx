"use client"; 
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // تأكد أن pathname موجود لتجنب أخطاء Hydration نادرة
  if (!pathname) return <>{children}</>;
  
  // 1. التحقق من وضع القراءة (يخفي القوائم للتركيز)
  const isReadingMode = pathname.includes("/chapter/");

  // 2. التحقق من لوحة التحكم (يخفي القوائم لأن للأدمن واجهته الخاصة)
  const isAdminPage = pathname.startsWith("/admin");
  
  // 3. التحقق من صفحات الدخول (اختياري: لجعل صفحة الدخول نظيفة)
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // المتغير النهائي: هل نخفي الواجهة العامة؟
  const shouldHideUI = isReadingMode || isAdminPage || isAuthPage;

  return (
    <>
      {/* إظهار الناف بار فقط إذا لم نكن في الحالات المستثناة */}
      {!shouldHideUI && <Navbar />}
      
      {/* 
          إذا كانت القوائم ظاهرة، نضيف Padding علوي (pt-72px) لكي لا يغطي الناف بار المحتوى 
          إذا كانت مخفية، نترك المحتوى يأخذ راحته
      */}
      <main className={!shouldHideUI ? "pt-[72px] min-h-screen" : "min-h-screen"}>
        {children}
      </main>

      {/* إظهار الفوتر فقط إذا لم نكن في الحالات المستثناة */}
      {!shouldHideUI && <Footer />}
    </>
  );
}