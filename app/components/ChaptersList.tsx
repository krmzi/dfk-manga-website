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

export default function ChaptersList({ chapters, mangaSlug, mangaId }: ChaptersListProps) {
    const { readChapters, isLoading } = useChapterReadStatus(mangaId);

    return (
        <div className="flex flex-col gap-2 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-1" suppressHydrationWarning>
            {chapters.length > 0 ? (
                chapters.map((ch) => {
                    const isRead = ch.id ? readChapters.has(ch.id) : false;

                    return (
                        <Link
                            href={`/manga/${mangaSlug}/chapter/${ch.slug}`}
                            key={ch.chapter_number}
                            className="group flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] hover:translate-x-1 transition-all active:scale-[0.98] min-h-[56px]"
                        >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                {/* Chapter Number */}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#222] flex items-center justify-center text-gray-400 font-black text-base md:text-lg flex-shrink-0">
                                    {ch.chapter_number}
                                </div>

                                {/* Chapter Info */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-bold text-sm md:text-base text-gray-200 group-hover:text-white truncate">
                                        الفصل {ch.chapter_number}
                                    </span>
                                    <span className="text-[10px] md:text-xs text-gray-600 flex gap-1 items-center">
                                        <Clock size={10} /> {formatDate(ch.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Read Status Icon */}
                            <div className="flex-shrink-0 mr-2">
                                {isLoading ? (
                                    <div className="w-5 h-5 rounded-full bg-gray-700 animate-pulse"></div>
                                ) : isRead ? (
                                    <EyeOff
                                        size={18}
                                        className="text-green-500"
                                        title="تم قراءته"
                                    />
                                ) : (
                                    <Eye
                                        size={18}
                                        className="text-gray-500"
                                        title="لم يُقرأ"
                                    />
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
