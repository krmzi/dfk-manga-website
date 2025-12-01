"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Parallax, EffectFade } from 'swiper/modules';
import { Play, Info, Star, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import Link from 'next/link';

// استيراد الأنماط
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// ✅ إضافة slug
interface MangaData {
  id: string;
  slug: string; // ✅
  title: string;
  description?: string;
  cover_image: string;
  bg_image?: string;
  rating: number;
}

interface HeroProps {
  featuredMangas?: MangaData[]; // ✅ تغيير من مانجا واحدة إلى مصفوفة
}

export default function Hero({ featuredMangas }: HeroProps) {
  // ✅ دعم عدة أعمال أو عمل واحد
  if (!featuredMangas || featuredMangas.length === 0) return null;

  // أخذ أول 5 أعمال للعرض في السلايدر
  const slides = featuredMangas.slice(0, 5);

  return (
    <div className="w-full bg-[#050505] pt-6 pb-8 px-4 md:px-8 overflow-hidden">

      {/* الحاوية الرئيسية: زوايا ناعمة وإطار مضيء خافت */}
      <div className="max-w-[1250px] mx-auto relative group rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent">

        <Swiper
          modules={[Autoplay, Pagination, Navigation, Parallax, EffectFade]}
          parallax={true} // تفعيل حركة العمق 3D
          effect="fade" // ✅ تأثير Fade للانتقال السلس
          fadeEffect={{ crossFade: true }}
          speed={1200} // سرعة انتقالية بطيئة وفخمة
          slidesPerView={1}
          loop={slides.length > 1} // ✅ Loop فقط إذا كان هناك أكثر من سلايد
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true // ✅ إيقاف مؤقت عند التمرير
          }}
          navigation={{
            nextEl: '.hero-next',
            prevEl: '.hero-prev',
          }}
          pagination={{
            clickable: true,
            renderBullet: (index, className) => `<span class="${className} custom-pagination-line"></span>`
          }}
          className="w-full h-[450px] md:h-[550px] rounded-[31px] overflow-hidden bg-[#0a0a0a] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] relative"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">

              {/* === الطبقة 1: الخلفية (تتحرك ببطء - Parallax) === */}
              <div
                className="absolute inset-0 z-0"
                data-swiper-parallax="-23%" // الخلفية تتحرك أبطأ من المحتوى
              >
                <img
                  src={slide.bg_image || slide.cover_image || "https://placehold.co/1920x1080/111/666?text=Hero+Background"}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-110 animate-cinematic-pan blur-sm"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/1920x1080/111/666?text=Hero+Background';
                  }}
                />
                {/* تراكب لوني متدرج واحترافي */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80" />
                {/* طبقة Noise خفيفة لإخفاء عيوب الصورة */}
                <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
              </div>

              {/* === الطبقة 2: المحتوى (يتحرك بسرعة - Parallax) === */}
              <div className="relative z-10 h-full w-full flex flex-col justify-center items-center text-center px-4 pb-8">

                {/* التصنيف (يظهر من الأعلى) */}
                <div className="flex items-center gap-3 mb-5" data-swiper-parallax-y="-100" data-swiper-parallax-opacity="0">
                  <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg flex items-center gap-2">
                    <Sparkles size={10} className="text-yellow-400 animate-pulse" />
                    Featured
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm bg-black/40 px-3 py-1 rounded-full border border-white/5 shadow-glow">
                    <Star size={12} fill="currentColor" /> {slide.rating}
                  </div>
                </div>

                {/* العنوان (يظهر من الأسفل) */}
                <h1
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl max-w-4xl"
                  data-swiper-parallax-y="200" // يتحرك مسافة أطول
                  data-swiper-parallax-duration="1000"
                >
                  {slide.title}
                </h1>

                {/* الوصف */}
                <p
                  className="text-gray-300/90 text-sm md:text-lg font-medium max-w-xl mb-8 leading-relaxed line-clamp-2 md:line-clamp-2"
                  data-swiper-parallax-y="300"
                  data-swiper-parallax-opacity="0"
                >
                  {slide.description || "اكتشف عالماً مليئاً بالمغامرة والإثارة مع أحدث فصول المانهوا المترجمة حصرياً."}
                </p>

                {/* الأزرار */}
                <div
                  className="flex flex-wrap items-center justify-center gap-4"
                  data-swiper-parallax-y="400"
                  data-swiper-parallax-opacity="0"
                >
                  {/* ✅ استخدام slug بدلاً من id */}
                  <Link href={`/manga/${slide.slug}`}>
                    <button className="group relative px-8 py-3.5 bg-white text-black rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
                      <span className="relative z-10 flex items-center gap-2">
                        <Play size={18} fill="currentColor" /> اقرأ الآن
                      </span>
                      {/* تأثير hover متحرك */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </Link>

                  <Link href={`/manga/${slide.slug}`}>
                    <button className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 active:scale-95 hover:border-white/20">
                      <Info size={18} /> المزيد
                    </button>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* === أزرار التنقل المخصصة (Hover Effect) === */}
        {/* ✅ إظهار الأزرار فقط إذا كان هناك أكثر من سلايد */}
        {slides.length > 1 && (
          <>
            <button className="hero-prev absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all duration-500 -translate-x-4 group-hover:translate-x-0 active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <button className="hero-next absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all duration-500 translate-x-4 group-hover:translate-x-0 active:scale-90">
              <ChevronRight size={24} />
            </button>
          </>
        )}

      </div>

      {/* === ستايلات CSS إضافية === */}
      <style jsx global>{`
        /* حركة زووم وتحريك سينمائية للخلفية */
        @keyframes cinematicPan {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.15) translate(5px, -5px); }
            100% { transform: scale(1.1); }
        }
        .animate-cinematic-pan {
            animation: cinematicPan 20s ease-in-out infinite alternate;
        }

        /* تخصيص الباجينيشن (الخطوط السفلية) */
        .custom-pagination-line {
            width: 40px !important;
            height: 3px !important;
            background: rgba(255,255,255,0.2) !important;
            border-radius: 2px;
            margin: 0 4px !important;
            transition: all 0.4s ease;
            opacity: 1 !important;
        }
        .swiper-pagination-bullet-active.custom-pagination-line {
            background: #dc2626 !important; /* أحمر */
            width: 60px !important;
            box-shadow: 0 0 10px rgba(220,38,38,0.5);
        }
        .swiper-pagination {
            bottom: 25px !important;
        }

        /* تأثير الظل للتقييم */
        .shadow-glow {
            box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
        }
      `}</style>
    </div>
  );
}