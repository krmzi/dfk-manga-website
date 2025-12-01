"use client";
import Link from "next/link";
import { Star, Flame, Clock } from "lucide-react";

interface Chapter {
    num: string;
    time: string;
    isNew: boolean;
    slug: string;
}

interface Props {
    id: string;
    slug: string; // ✅
    title: string;
    image: string;
    rating: string;
    chapters?: Chapter[];
    status?: string;
}

export default function ChapterCard({ id, title, image, rating, chapters = [], status = "Ongoing", slug }: Props) {
    const displayChapters = chapters.slice(0, 3);

    return (
        <div className="flex w-full h-[165px] bg-[#111] rounded-md overflow-hidden border border-[#222] hover:border-[#333] transition-colors group">

            {/* === Image Section (Left) === */}
            <div className="relative w-[115px] flex-shrink-0 h-full">
                <Link href={`/manga/${slug}`} className="block w-full h-full">
                    <img
                        src={image || "/placeholder.jpg"}
                        alt={title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                    />

                    {/* Rating Badge (Top Left) */}
                    <div className="absolute top-0 left-0 bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br flex items-center gap-1 border-b border-r border-[#222]">
                        <Star size={9} className="text-yellow-500 fill-yellow-500" />
                        {rating}
                    </div>

                    {/* Type Badge (Top Right - Optional Placeholder) */}
                    <div className="absolute top-0 right-0 bg-[#c026d3] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl">
                        MANHWA
                    </div>
                </Link>
            </div>

            {/* === Content Section (Right) === */}
            <div className="flex-1 flex flex-col p-2.5 bg-[#141414]">

                {/* Header */}
                <div className="flex flex-col gap-1 mb-2">
                    <h3 className="text-white font-bold text-[14px] leading-tight line-clamp-1 hover:text-[#c026d3] transition-colors">
                        <Link href={`/manga/${slug}`} title={title}>{title}</Link>
                    </h3>

                    {/* Status & Rating Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ongoing' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{status}</span>
                        </div>
                    </div>
                </div>

                {/* Chapters Grid */}
                <div className="flex flex-col gap-1.5 mt-auto">
                    {displayChapters.map((ch, i) => (
                        <Link
                            key={i}
                            href={`/manga/${slug}/chapter/${ch.slug}`}
                            className="flex items-center justify-between px-2.5 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all group/chapter"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`text-[11px] font-bold truncate ${ch.isNew ? 'text-white' : 'text-gray-400 group-hover/chapter:text-gray-200'}`}>
                                    Chapter {ch.num}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">
                                    {ch.time}
                                </span>
                                {ch.isNew && (
                                    <Flame size={10} className="text-red-500 fill-red-500" />
                                )}
                            </div>
                        </Link>
                    ))}

                    {/* Empty State */}
                    {displayChapters.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-600 text-[10px]">
                            No chapters
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}