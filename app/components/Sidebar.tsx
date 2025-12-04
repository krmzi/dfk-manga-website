"use client";
import Link from "next/link";
import { Star, Activity, Eye, ArrowUpRight, MessageCircle } from "lucide-react";

interface Manga {
    id: string;
    slug: string;
    title: string;
    cover_image: string;
    rating: number;
    country: string;
    status: string;
    views?: number;
}

interface SidebarProps {
    topMangas?: Manga[];
}

const getCountryName = (code: string) => {
    if (code === 'KR') return 'Manhwa';
    if (code === 'JP') return 'Manga';
    if (code === 'CN') return 'Manhua';
    return 'Webtoon';
}

const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const getRankVisual = (index: number) => {
    if (index === 0) return <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">01</span>;
    if (index === 1) return <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-500 drop-shadow-sm">02</span>;
    if (index === 2) return <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-700 drop-shadow-sm">03</span>;
    return <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-white/20 stroke-text">0{index + 1}</span>;
};

export default function Sidebar({ topMangas = [] }: SidebarProps) {

    if (!topMangas || topMangas.length === 0) return null;

    return (
        <aside className="w-full flex flex-col gap-6 md:gap-8 animate-fade-in-up">

            {/* === Header === */}
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="p-1.5 md:p-2 bg-red-600/10 rounded-lg border border-red-600/20">
                    <Activity className="text-red-600" size={18} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
                    Trending <span className="text-red-600">Now</span>
                </h2>
            </div>

            {/* === List Items === */}
            <div className="flex flex-col gap-3 md:gap-4">
                {topMangas.map((item, index) => (
                    <Link
                        key={item.id}
                        href={`/manga/${item.slug}`}
                        className="group flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl bg-[#111] border border-white/5 hover:bg-[#161616] hover:border-white/10 transition-all duration-300 hover:-translate-x-2 cursor-pointer"
                    >
                        {/* 1. Rank */}
                        <div className="w-10 md:w-12 flex-shrink-0 text-center">
                            {getRankVisual(index)}
                        </div>

                        {/* 2. Image */}
                        <div className="relative w-12 h-16 md:w-14 md:h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/5 group-hover:border-white/20 transition-all">
                            <img
                                src={item.cover_image && item.cover_image.length > 5 ? item.cover_image : "/placeholder.jpg"}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                                alt={item.title}
                            />
                        </div>

                        {/* 3. Info */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5 md:gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    {getCountryName(item.country)}
                                </span>
                                <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-yellow-500">
                                    <Star size={9} fill="currentColor" /> {item.rating}
                                </div>
                            </div>

                            <h4 className="text-xs md:text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                                {item.title}
                            </h4>

                            <div className="flex items-center gap-2 mt-auto">
                                <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-400 bg-white/5 px-1.5 md:px-2 py-0.5 rounded border border-white/5">
                                    <Eye size={10} className={index < 3 ? "text-red-500" : "text-gray-500"} />
                                    <span className={index < 3 ? "text-white font-bold" : ""}>
                                        {formatViews(item.views || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* === Discord Banner === */}
            <a
                href="https://discord.gg/yourserver"
                target="_blank"
                className="group relative w-full h-20 md:h-24 rounded-xl overflow-hidden border border-[#5865F2]/30 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-[#5865F2]/20 to-transparent hover:from-[#5865F2]/30 transition-all"
            >
                <div className="flex flex-col gap-0.5 md:gap-1 z-10">
                    <span className="text-[#5865F2] text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">Community</span>
                    <h3 className="text-white font-black text-base md:text-lg flex gap-2 items-center">
                        Discord <MessageCircle size={14} className="md:w-4 md:h-4" />
                    </h3>
                </div>

                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/40 group-hover:scale-110 transition-transform z-10">
                    <ArrowUpRight size={16} className="md:w-5 md:h-5" />
                </div>

                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#5865F2]/20 to-transparent opacity-50 blur-xl pointer-events-none"></div>
            </a>

            <style jsx>{`
            .stroke-text {
                -webkit-text-stroke: 1px rgba(255,255,255,0.1);
            }
        `}</style>

        </aside>
    );
}

function formatViews(num: number) {
    return formatNumber(num);
}