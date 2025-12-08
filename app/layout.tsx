import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import MobileBottomNav from "./components/MobileBottomNav";
import { ToastProvider } from "@/app/providers/ToastProvider";
import ToastContainer from "./components/ToastContainer";
import NotificationPrompt from "./components/NotificationPrompt";
import QueryProvider from "./providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  metadataBase: new URL('https://www.dfk-team.site'),
  title: {
    default: "DFK Team | منصة المانهوا العربية",
    template: "%s | DFK Team",
  },
  description: "استمتع بقراءة أحدث فصول المانهوا والمانجا والويب تون مترجمة للغة العربية بأعلى جودة وبشكل مجاني.",
  keywords: ["مانهوا", "مانجا", "ويب تون", "مانهوا مترجمة", "DFK Team", "قراءة مانهوا", "manhwa", "manga", "webtoon", "مانهوا عربي"],
  authors: [{ name: "DFK Team" }],
  creator: "DFK Team",
  publisher: "DFK Team",
  category: "entertainment",
  classification: "Manga Reading Platform",

  // Verification codes (أضفها بعد التسجيل في Google Search Console)
  verification: {
    google: '35cef677015455a4', // Google Search Console
    // yandex: 'YOUR_YANDEX_CODE',
    // bing: 'YOUR_BING_CODE',
  },

  // Next.js automatically uses icon.png from /app folder
  // icons: {
  //   icon: "/icon.png",
  //   apple: "/icons/icon-192x192.png",
  // },

  manifest: "/manifest.json",

  openGraph: {
    title: "DFK Team | منصة المانهوا العربية",
    description: "منصة قراءة المانهوا الأفضل عربياً",
    type: "website",
    locale: "ar_AR",
    siteName: "DFK Team",
    url: "https://www.dfk-team.site",
    images: [
      {
        url: "/og-image.png", // أضف صورة OG (1200x630)
        width: 1200,
        height: 630,
        alt: "DFK Team - منصة المانهوا العربية"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "DFK Team",
    description: "منصة قراءة المانهوا الأفضل عربياً",
    images: ["/og-image.png"],
    // creator: "@dfkteam",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: "https://www.dfk-team.site",
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
            <NotificationPrompt />
          </QueryProvider>
        </ToastProvider>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
