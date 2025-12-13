"use client";
import Link from 'next/link';
import { Clock, Eye, EyeOff, Search, SortAsc, SortDesc } from 'lucide-react';
import { useChapterReadStatus } from '../hooks/useChapterReadStatus';
import { useState } from 'react';

interface Chapter {
    id?: string;
    chapter_number: number;
    slug: string;
    created_at: string;
}

interface ChaptersListProps {
    chapters: Chapter[];
    mangaSlug: string;
    mangaId: string;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

function isNewChapter(dateString: string) {
    const chapterDate = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - chapterDate.getTime()) / 36e5;
    return diffInHours < 24;
}

export default function ChaptersList({ chapters, mangaSlug, mangaId }: ChaptersListProps) {
    const { readChapters, isLoading } = useChapterReadStatus(mangaId);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAscending, setIsAscending] = useState(false);

    // Filter and Sort
    const filteredChapters = chapters
        .filter(ch => ch.chapter_number.toString().includes(searchTerm))
        .sort((a, b) => isAscending
            ? a.chapter_number - b.chapter_number
            : b.chapter_number - a.chapter_number
        );

    return (
        <div className="w-full" suppressHydrationWarning>

            {/* Header: Search & Sort */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-red-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن رقم الفصل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] text-gray-200 text-sm font-medium py-3.5 pr-12 pl-4 rounded-xl border border-[#222] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:outline-none transition-all placeholder:text-[#444]"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsAscending(!isAscending)}
                        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-gray-400 hover:text-white hover:border-[#444] transition-all text-xs font-bold w-full md:w-auto"
                    >
                        {isAscending ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        {isAscending ? 'الأقدم أولاً' : 'الأحدث أولاً'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
                {filteredChapters.length > 0 ? (
                    filteredChapters.map((ch, index) => {
                        const isRead = ch.id ? readChapters.has(ch.id) : false;
                        const isNew = isNewChapter(ch.created_at);

                        return (
                            <Link
                                href={`/manga/${mangaSlug}/chapter/${ch.slug}`}
                                key={ch.chapter_number}
                                className="group relative flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] hover:bg-[#111] transition-all duration-200"
                            >
                                {/* Left Side: Number & Indicator */}
                                <div className="flex items-center gap-4">
                                    <div className={`relative w-12 h-12 flex items-center justify-center rounded-lg text-lg font-black tracking-tighter transition-all duration-300 bg-[#151515] border border-[#222] ${isNew
                                            ? 'text-red-500 border-red-900/30'
                                            : isRead
                                                ? 'text-gray-600'
                                                : 'text-gray-300 group-hover:text-white'
                                        }`}>
                                        {ch.chapter_number}

                                        {/* Blinking Dot for New Chapters */}
                                        {isNew && (
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`text-sm md:text-base font-bold transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>
                                            الفصل {ch.chapter_number}
                                        </span>
                                        <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            {formatDate(ch.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Actions & Status */}
                                <div className="flex items-center gap-4 md:gap-6 pl-2">
                                    {/* Read Status */}
                                    <div className="transition-transform group-hover:scale-110">
                                        {isLoading ? (
                                            <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" />
                                        ) : isRead ? (
                                            <EyeOff size={20} className="text-green-600/50" />
                                        ) : (
                                            <span className="text-gray-700 group-hover:text-gray-400 transition-colors">
                                                <Eye size={20} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <Search size={40} className="mb-4 text-gray-700" />
                        <p className="text-gray-500 font-medium">لم يتم العثور على أي فصل بهذا الرقم</p>
                    </div>
                )}
            </div>
        </div>
    );
}
