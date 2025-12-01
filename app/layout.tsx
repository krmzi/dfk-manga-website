import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper"; 

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap", // تحسين سرعة ظهور الخط
});

// إعدادات المظهر للمتصفحات (خاصة الموبايل)
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

// إعدادات السيو (SEO) والظهور في البحث
export const metadata: Metadata = {
  metadataBase: new URL('https://dfk-team.com'), // استبدله بدومين موقعك الحقيقي مستقبلاً
  title: {
    default: "DFK Team | منصة المانهوا العربية",
    template: "%s | DFK Team", // هذا يجعل العناوين ديناميكية في الصفحات الداخلية
  },
  description: "استمتع بقراءة أحدث فصول المانهوا والمانجا والويب تون مترجمة للغة العربية بأعلى جودة وبشكل مجاني.",
  icons: {
    icon: "/favicon.ico", // تأكد من وجود صورة اللوجو بهذا الاسم في مجلد public
  },
  openGraph: {
    title: "DFK Team",
    description: "منصة قراءة المانهوا الأفضل عربياً",
    type: "website",
    locale: "ar_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-[#050505] text-[#ededed] overflow-x-hidden min-h-screen flex flex-col`}>

        {/* الغلاف الذكي: يتحكم في الناف بار والفوتر حسب الصفحة */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>

      </body>
    </html>
  );
}