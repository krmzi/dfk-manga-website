"use client";
import Link from "next/link";
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
    country?: string; // أضفت هذا لتلوين البطاقة حسب النوع
}

export default function ChapterCard({ id, title, image, rating, chapters = [], status = "Ongoing", slug, country = "KR" }: Props) {
    const displayChapters = chapters.slice(0, 3);

    // تحديد الألوان والنصوص بناءً على الدولة
    const getTypeInfo = (c: string) => {
        const lower = c?.toLowerCase() || 'kr';
        if (lower === 'kr' || lower.includes('korea')) return { label: 'MANHWA', color: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/30' };
        if (lower === 'jp' || lower.includes('japan')) return { label: 'MANGA', color: 'bg-red-600', text: 'text-red-400', border: 'border-red-500/30' };
        if (lower === 'cn' || lower.includes('china')) return { label: 'MANHUA', color: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500/30' };
        return { label: 'MANHWA', color: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/30' };
    };

    const typeInfo = getTypeInfo(country);
    const isOngoing = status === 'Ongoing' || status === 'مستمر';

    return (
        <div className="relative group w-full h-[170px] bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-300">

            <div className="flex h-full">
                {/* === Image Section (Left) === */}
                <div className="relative w-[110px] sm:w-[120px] h-full flex-shrink-0 overflow-hidden">
                    <Link href={`/manga/${slug}`} className="block w-full h-full">
                        <img
                            src={image || "/placeholder.jpg"}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                        />
                        {/* Overlay Gradient on Image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Rating Badge */}
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-lg">
                            <Star size={10} className="fill-yellow-400" />
                            {rating}
                        </div>
                    </Link>
                </div>

                {/* === Content Section (Right) === */}
                <div className="flex-1 flex flex-col py-3 px-4 relative z-10">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                        {/* Status & Type */}
                        <div className="flex flex-col gap-1 items-end min-w-fit">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] text-white ${typeInfo.color} shadow-lg shadow-${typeInfo.color}/20`}>
                                {typeInfo.label}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? 'bg-green-500 animate-soft-blink shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-blue-500'}`} />
                                <span className={`text-[9px] font-bold uppercase ${isOngoing ? 'text-green-400' : 'text-blue-400'}`}>
                                    {isOngoing ? 'مستمر' : 'مكتمل'}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-white font-bold text-[14px] leading-tight line-clamp-2 text-right hover:text-white/80 transition-colors flex-1" dir="rtl">
                            <Link href={`/manga/${slug}`} title={title}>{title}</Link>
                        </h3>
                    </div>

                    {/* Chapters List */}
                    <div className="flex flex-col gap-2 mt-auto">
                        {displayChapters.map((ch, i) => (
                            <Link
                                key={i}
                                href={`/manga/${slug}/chapter/${ch.slug}`}
                                className={`
                                    relative flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-300 group/chapter
                                    ${ch.isNew
                                        ? 'bg-gradient-to-r from-[#1a1a1a] to-[#111] border-red-500/20 hover:border-red-500/40'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                `}
                            >
                                {/* Chapter Info (Right Side) */}
                                <div className="flex items-center gap-2" dir="rtl">
                                    <span className={`text-[11px] font-bold transition-colors ${ch.isNew ? 'text-white' : 'text-gray-400 group-hover/chapter:text-gray-200'}`}>
                                        الفصل {ch.num}
                                    </span>

                                    {/* Premium New Badge */}
                                    {ch.isNew && (
                                        <div className="relative overflow-hidden bg-red-600 text-white text-[8px] font-black px-1.5 py-[1px] rounded-[3px] flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                                            <span className="relative z-10 tracking-wider">جديد</span>
                                            {/* Scan Effect */}
                                            <div className="animate-scan" />
                                        </div>
                                    )}
                                </div>

                                {/* Time (Left Side) */}
                                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-medium">
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

            {/* Ambient Background Glow based on Type */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[80px] opacity-10 pointer-events-none ${typeInfo.color.replace('bg-', 'bg-')}`} />
        </div>
    );
}