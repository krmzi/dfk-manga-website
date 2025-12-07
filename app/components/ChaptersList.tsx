"use client";
import Link from 'next/link';
import { Clock, Eye, EyeOff } from 'lucide-react';
import { useChapterReadStatus } from '../hooks/useChapterReadStatus';

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

    return (
        <div className="flex flex-col gap-2 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-1" suppressHydrationWarning>
            {chapters.length > 0 ? (
                chapters.map((ch) => {
                    const isRead = ch.id ? readChapters.has(ch.id) : false;
                    const isNew = isNewChapter(ch.created_at);

                    return (
                        <Link
                            href={`/manga/${mangaSlug}/chapter/${ch.slug}`}
                            key={ch.chapter_number}
                            className="group flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] hover:translate-x-1 transition-all active:scale-[0.98] min-h-[56px]"
                        >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                {/* Chapter Number */}
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-black text-base md:text-lg flex-shrink-0 transition-colors ${isNew ? 'bg-red-600/10 text-red-500 border border-red-900/30' : 'bg-[#222] text-gray-400'
                                    }`}>
                                    {ch.chapter_number}
                                </div>

                                {/* Chapter Info */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold text-sm md:text-base truncate transition-colors ${isNew ? 'text-white' : 'text-gray-200 group-hover:text-white'
                                            }`}>
                                            الفصل {ch.chapter_number}
                                        </span>

                                        {/* New Badge */}
                                        {isNew && (
                                            <div className="relative overflow-hidden bg-red-600 text-white text-[9px] font-black px-2 py-[1px] rounded-[2px] flex items-center justify-center select-none shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                                <span className="relative z-10">جديد</span>
                                                <div className="animate-scan" />
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-[10px] md:text-xs text-gray-600 flex gap-1 items-center mt-1">
                                        <Clock size={10} /> {formatDate(ch.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Read Status Icon */}
                            <div className="flex-shrink-0 mr-2">
                                {isLoading ? (
                                    <div className="w-5 h-5 rounded-full bg-gray-700 animate-pulse"></div>
                                ) : isRead ? (
                                    <span title="تم قراءته">
                                        <EyeOff
                                            size={18}
                                            className="text-green-500"
                                        />
                                    </span>
                                ) : (
                                    <span title="لم يُقرأ">
                                        <Eye
                                            size={18}
                                            className="text-gray-500 group-hover:text-gray-300 transition-colors"
                                        />
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })
            ) : (
                <p className="text-center py-10 text-gray-500">لا توجد فصول</p>
            )}
        </div>
    );
}
