import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import MobileBottomNav from "./components/MobileBottomNav";
import { ToastProvider } from "@/app/providers/ToastProvider";
import ToastContainer from "./components/ToastContainer";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import NotificationPrompt from "./components/NotificationPrompt";
import QueryProvider from "./providers/QueryProvider";

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
  keywords: ["مانهوا", "مانجا", "ويب تون", "مانهوا مترجمة", "DFK Team", "قراءة مانهوا"],
  authors: [{ name: "DFK Team" }],
  icons: {
    icon: "/favicon.ico", // تأكد من وجود صورة اللوجو بهذا الاسم في مجلد public
  },
  openGraph: {
    title: "DFK Team | منصة المانهوا العربية",
    description: "منصة قراءة المانهوا الأفضل عربياً",
    type: "website",
    locale: "ar_AR",
    siteName: "DFK Team",
  },
  twitter: {
    card: "summary_large_image",
    title: "DFK Team",
    description: "منصة قراءة المانهوا الأفضل عربياً",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${cairo.className} bg-[#050505] text-[#ededed] overflow-x-hidden min-h-screen flex flex-col`}>
        <ToastProvider>
          <QueryProvider>
            {/* الغلاف الذكي: يتحكم في الناف بار والفوتر حسب الصفحة */}
            <LayoutWrapper>
              {children}
              <div className="h-[80px] md:hidden"></div> {/* Spacer for Mobile Nav */}
            </LayoutWrapper>

            <MobileBottomNav />
            <ToastContainer />
            <ServiceWorkerRegistration />
            <NotificationPrompt />
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}