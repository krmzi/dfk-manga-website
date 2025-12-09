"use client";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock } from "lucide-react";

interface Chapter {
    num: string;
    time: string;
    isNew: boolean;
    slug: string;
}

interface Props {
    id: string;
    slug: string;
    title: string;
    image: string;
    rating: string;
    chapters?: Chapter[];
    status?: string;
    country?: string;
}

export default function ChapterCard({ id, title, image, rating, chapters = [], status = "Ongoing", slug, country = "KR" }: Props) {
    // زيادة عدد الفصول إلى 4
    const displayChapters = chapters.slice(0, 4);

    const getTypeInfo = (c: string) => {
        const lower = c?.toLowerCase() || 'kr';
        if (lower === 'kr' || lower.includes('korea')) return { label: 'MANHWA', pulseClass: 'animate-pulse-purple', baseColor: 'bg-purple-600', text: 'text-purple-400' };
        if (lower === 'jp' || lower.includes('japan')) return { label: 'MANGA', pulseClass: 'animate-pulse-red', baseColor: 'bg-red-600', text: 'text-red-400' };
        if (lower === 'cn' || lower.includes('china')) return { label: 'MANHUA', pulseClass: 'animate-pulse-blue', baseColor: 'bg-blue-600', text: 'text-blue-400' };
        return { label: 'MANHWA', pulseClass: 'animate-pulse-purple', baseColor: 'bg-purple-600', text: 'text-purple-400' };
    };

    const typeInfo = getTypeInfo(country);
    const isOngoing = status === 'Ongoing' || status === 'مستمر';

    return (
        // إزالة الارتفاع الثابت واستخدام min-h ليسمح بالتمدد
        <div className="relative group w-full h-auto min-h-[180px] bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-300">

            <div className="flex h-full">
                {/* === Image Section (Left) === */}
                {/* تعديل العرض ليناسب الموبايل بشكل أفضل */}
                <div className="relative w-[110px] sm:w-[130px] flex-shrink-0 overflow-hidden">
                    <Link href={`/manga/${slug}`} className="block w-full h-full relative">
                        {/* التأكد من أن الصورة تملأ المساحة بالكامل دائماً */}
                        <div className="absolute inset-0">
                            <Image
                                src={image || "/placeholder.jpg"}
                                alt={title}
                                fill
                                sizes="(max-width: 768px) 110px, 130px"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                priority={false}
                            />
                        </div>
                        {/* Overlay Gradient on Image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Rating Badge */}
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-lg z-10">
                            <Star size={10} className="fill-yellow-400" />
                            {rating}
                        </div>
                    </Link>
                </div>

                {/* === Content Section (Right) === */}
                <div className="flex-1 flex flex-col py-3 px-3 sm:px-4 relative z-10 w-full min-w-0">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                        {/* Status & Type */}
                        <div className="flex flex-col gap-1.5 items-end min-w-fit">
                            {/* Type Badge with Color Pulse Animation */}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-[4px] text-white shadow-lg ${typeInfo.pulseClass}`}>
                                {typeInfo.label}
                            </span>

                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? 'bg-green-500 animate-soft-blink shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-blue-500'}`} />
                                <span className={`text-[9px] font-bold uppercase ${isOngoing ? 'text-green-400' : 'text-blue-400'}`}>
                                    {isOngoing ? 'مستمر' : 'مكتمل'}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-white font-bold text-[13px] sm:text-[14px] leading-tight line-clamp-2 text-right hover:text-white/80 transition-colors flex-1" dir="rtl">
                            <Link href={`/manga/${slug}`} title={title}>{title}</Link>
                        </h3>
                    </div>

                    {/* Chapters List */}
                    <div className="flex flex-col gap-1.5 mt-auto w-full">
                        {displayChapters.map((ch, i) => (
                            <Link
                                key={i}
                                href={`/manga/${slug}/chapter/${ch.slug}`}
                                className="relative flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group/chapter"
                            >
                                {/* Chapter Info (Right Side) */}
                                <div className="flex items-center gap-2" dir="rtl">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 group-hover/chapter:text-white transition-colors">
                                        الفصل {ch.num}
                                    </span>

                                    {/* New Badge with Slide Animation */}
                                    {ch.isNew && (
                                        <div className="animate-slide-horizontal bg-red-600 text-white text-[8px] font-black px-1.5 py-[1px] rounded-[3px] shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                                            جديد
                                        </div>
                                    )}
                                </div>

                                {/* Time (Left Side) - Hidden on very small screens if needed, but flex-col handles it */}
                                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-medium whitespace-nowrap">
                                    <Clock size={8} />
                                    {ch.time}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {displayChapters.length === 0 && (
                        <div className="mt-auto text-center text-[10px] text-gray-600 font-medium py-2 bg-white/5 rounded-lg border border-white/5 border-dashed">
                            لا توجد فصول حالياً
                        </div>
                    )}
                </div>
            </div>

            {/* Ambient Background Glow based on Type (Subtle) */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[80px] opacity-[0.08] pointer-events-none ${typeInfo.baseColor}`} />
        </div>
    );
}
