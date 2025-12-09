"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Parallax, EffectFade } from 'swiper/modules';
import { Play, Info, Star, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

interface MangaData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cover_image: string;
  bg_image?: string;
  rating: number;
}

interface HeroProps {
  featuredMangas?: MangaData[];
}

export default function Hero({ featuredMangas }: HeroProps) {
  if (!featuredMangas || featuredMangas.length === 0) return null;

  const slides = featuredMangas.slice(0, 5);

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="w-full bg-[#050505] pt-4 pb-4 px-4 md:px-8">
      <div className="w-full max-w-full md:max-w-[1400px] mx-auto relative group">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, Parallax, EffectFade]}
          parallax={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          slidesPerView={1}
          loop={slides.length > 1}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          navigation={{
            nextEl: '.hero-next',
            prevEl: '.hero-prev',
          }}
          pagination={{
            clickable: true,
            el: '.custom-pagination',
          }}
          className="w-full h-[260px] md:h-[500px] rounded-xl md:rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full">

              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.bg_image || slide.cover_image || "https://placehold.co/1920x1080/111/666?text=Hero"}
                  alt={slide.title}
                  fill
                  priority={index === 0} // Hero images should be prioritized ONLY for the first slide
                  className="object-cover scale-105 animate-subtle-zoom blur-[3px]"
                  sizes="100vw"
                />

                {/* Stronger Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/60" />
              </div>

              {/* Content Layer */}
              <div className="relative z-10 h-full w-full flex flex-col justify-end pb-8 md:pb-20 px-4 md:px-16">

                {/* Top Badges */}
                <div className="absolute top-4 right-4 md:top-10 md:right-12 flex items-center gap-2 md:gap-3 animate-fade-in">
                  <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] md:text-xs font-bold text-white flex items-center gap-1.5 md:gap-2 shadow-lg">
                    <Sparkles size={10} className="text-yellow-400 md:w-3 md:h-3" />
                    <span>مميز</span>
                  </div>
                  <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/20 text-[9px] md:text-xs font-bold text-yellow-400 flex items-center gap-1 md:gap-1.5 shadow-lg">
                    <Star size={10} fill="currentColor" className="md:w-3 md:h-3" />
                    <span>{slide.rating}</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center md:items-start text-center md:text-right" dir="rtl">

                  {/* Title */}
                  <h1 className="text-lg md:text-5xl lg:text-6xl font-black text-white mb-2 md:mb-4 leading-tight drop-shadow-2xl animate-slide-up max-w-4xl px-2 md:px-0">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="hidden md:block text-gray-200 text-sm md:text-lg font-medium mb-8 leading-relaxed max-w-2xl line-clamp-2 animate-slide-up-delay drop-shadow-md">
                    {truncateText(slide.description || "اكتشف عالماً مليئاً بالمغامرة والإثارة مع أحدث فصول المانهوا المترجمة حصرياً.", 150)}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 md:gap-4 animate-slide-up-delay-2 w-full md:w-auto justify-center md:justify-start px-2 md:px-0">
                    <Link href={`/manga/${slide.slug}`} className="flex-1 md:flex-none">
                      <button className="w-full md:w-auto px-4 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2">
                        <Play size={16} fill="currentColor" className="md:w-5 md:h-5" />
                        <span>اقرأ الآن</span>
                      </button>
                    </Link>

                    <Link href={`/manga/${slide.slug}`} className="flex-1 md:flex-none">
                      <button className="w-full md:w-auto px-4 md:px-8 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-bold text-sm md:text-base text-white border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        <Info size={16} className="md:w-5 md:h-5" />
                        <span>التفاصيل</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Pagination Container */}
          <div className="custom-pagination absolute bottom-3 md:bottom-4 left-0 right-0 z-20 flex justify-center gap-2" />
        </Swiper>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button className="hero-prev hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-all duration-300 active:scale-95 group-hover:opacity-100 opacity-0">
              <ChevronLeft size={24} />
            </button>
            <button className="hero-next hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white items-center justify-center hover:bg-[#dc2626] hover:border-[#dc2626] transition-all duration-300 active:scale-95 group-hover:opacity-100 opacity-0">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes subtleZoom {
            0% { transform: scale(1.05); }
            100% { transform: scale(1.1); }
        }
        .animate-subtle-zoom {
            animation: subtleZoom 20s ease-in-out infinite alternate;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-up-delay {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out 0.1s forwards;
        }
        .animate-slide-up-delay-2 {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out 0.2s forwards;
        }
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
        }

        /* Pagination Styling */
        .swiper-pagination-bullet {
            width: 6px !important;
            height: 6px !important;
            background: rgba(255,255,255,0.3) !important;
            opacity: 1 !important;
            transition: all 0.3s ease !important;
            border-radius: 50% !important;
        }
        
        .swiper-pagination-bullet-active {
            background: #dc2626 !important;
            width: 20px !important;
            border-radius: 4px !important;
            box-shadow: 0 0 10px rgba(220,38,38,0.5) !important;
        }
      `}</style>
    </div>
  );
}
