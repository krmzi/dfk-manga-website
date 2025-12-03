"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // يفضل استخدام Next Image للأداء

import 'swiper/css';
import 'swiper/css/navigation';

// ✅ 1. إضافة slug للتعريف
interface Manga {
    id: string;
    slug: string;
    title: string;
    cover_image: string;
    country: string;
    rating: number;
    status: string;
}

const getFlag = (code: string) => {
    if (code === "KR") return "https://cdn-icons-png.flaticon.com/512/197/197582.png";
    if (code === "CN") return "https://cdn-icons-png.flaticon.com/512/197/197375.png";
    if (code === "JP") return "https://cdn-icons-png.flaticon.com/512/197/197604.png";
    return null;
}

// === Vortex Style Card (تصميم مطابق للصورة) ===
// ✅ 2. استقبال slug في المكون
function VortexCard({ title, cover_image, country, rating, status, slug }: Manga) {
    const flagUrl = getFlag(country);

    return (
        // ✅ 3. استخدام slug في الرابط بدلاً من id
        <Link href={`/manga/${slug}`} className="group relative block w-full h-full">
            {/* الحاوية الرئيسية: تحدد الزوايا الدائرية وتخفي الزوائد */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg border border-white/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:border-red-500/30">
                {/* 1. الصورة: إصلاح مشكلة عدم الظهور */}
                <img
                    // نستخدم صورة احتياطية خارجية مضمونة بدلاً من الملف المحلي
                    src={cover_image && cover_image.length > 5 ? cover_image : "https://placehold.co/600x900/111/666?text=No+Image"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                />

                {/* 2. الظل المتدرج (Gradient): لجعل النص مقروءاً */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* 3. العناصر العائمة (Top Overlay) */}
                <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-10">
                    {/* شارة "جديد" أو العلم */}
                    <div className="flex flex-col gap-2">
                        {status === 'Ongoing' && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md uppercase tracking-wide">
                                UP
                            </span>
                        )}
                    </div>

                    {/* التقييم */}
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/10">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-white">{rating}</span>
                    </div>
                </div>

                {/* 4. المحتوى السفلي (العنوان) */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-20 flex flex-col justify-end">
                    {/* العلم صغير بجانب العنوان */}
                    <div className="flex items-center gap-2 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {flagUrl && <img src={flagUrl} alt={country} className="w-3.5 h-3.5 rounded-sm shadow-sm" />}
                        <span className="text-[10px] text-gray-300 font-semibold uppercase">{country === 'KR' ? 'Manhwa' : country === 'CN' ? 'Manhua' : 'Manga'}</span>
                    </div>

                    <h3 className="text-white font-black text-[15px] leading-tight line-clamp-2 drop-shadow-md group-hover:text-red-500 transition-colors">
                        {title}
                    </h3>
                </div>

            </div>
        </Link>
    )
}

interface NewReleasesSliderProps {
    mangas: Manga[];
}

export default function NewReleasesSlider({ mangas }: NewReleasesSliderProps) {
    if (!mangas || mangas.length === 0) return null;

    return (
        <section className="w-full max-w-full overflow-hidden mb-16 px-2 md:px-0">

            {/* === Header (نظيف ومينيماليست) === */}
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2">
                    <Flame className="text-red-600 fill-red-600 animate-pulse" size={24} />
                    <h2 className="text-2xl font-black text-white tracking-wide">
                        الأكثر رواجاً
                    </h2>
                </div>

                {/* أزرار التنقل الدائرية الشفافة */}
                <div className="flex gap-2">
                    <button className="nr-prev w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center justify-center active:scale-95">
                        <ChevronRight size={20} />
                    </button>
                    <button className="nr-next w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center justify-center active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>

            {/* === Swiper Slider === */}
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={12} // مسافة نظيفة بين الكروت
                slidesPerView={2.2} // الموبايل - تقليل العرض قليلاً لضمان عدم الخروج
                breakpoints={{
                    480: { slidesPerView: 3.3, spaceBetween: 16 }, // تابلت صغير
                    768: { slidesPerView: 4.3, spaceBetween: 16 }, // تابلت
                    1024: { slidesPerView: 5.3, spaceBetween: 20 }, // لابتوب
                    1400: { slidesPerView: 6.3, spaceBetween: 20 }, // شاشات كبيرة
                }}
                navigation={{ nextEl: '.nr-next', prevEl: '.nr-prev' }} // عكسناهم ليناسب الـ RTL
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={mangas.length > 5}
                className="py-1" // حشوة صغيرة لمنع قص الظل
            >
                {mangas.map((item) => (
                    <SwiperSlide key={item.id}>
                        <VortexCard {...item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}