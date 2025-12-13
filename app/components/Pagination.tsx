
'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl = '/' }: PaginationProps) {
    // Ensure we don't show more pages than exist
    if (totalPages <= 1) return null;

    // Logic to determine the range of pages to show (Sliding Window of 4)
    // We want to show 4 pages.
    // The user requested that as we advance, the pages verify.
    // "When reaching page 4, 1,2,3 disappear. Place of 1 comes 4".
    // This implies the window starts shifting heavily around page 4.

    // Strategy: Try to center current page, but prioritize showing 4 items.
    // Let's create a window of 4 items ending at current+2 or current+3?

    // Let's implement: Start = max(1, current - 1)
    // But constrain length to 4.

    // Example:
    // Page 1: Start 1 -> 1, 2, 3, 4
    // Page 2: Start 1 -> 1, 2, 3, 4  (Ideally we keep 1 visible for a bit)
    // Page 3: Start 2 -> 2, 3, 4, 5
    // Page 4: Start 3 -> 3, 4, 5, 6

    // This seems smooth.

    let startPage = Math.max(1, currentPage - 1);
    let endPage = startPage + 3;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - 3);
    }

    // Create array of page numbers
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const createPageUrl = (page: number) => {
        return `${baseUrl}?page=${page}`;
    };

    return (
        <div className="flex justify-center items-center gap-3 mt-16 mb-8 select-none">

            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="flex items-center gap-1 pr-4 pl-3 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-400 hover:text-white hover:border-red-600/30 hover:bg-[#151515] transition-all group"
                >
                    <ChevronRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">السابق</span>
                </Link>
            ) : (
                <div className="flex items-center gap-1 pr-4 pl-3 py-3 bg-[#111]/30 border border-[#222]/30 rounded-xl text-gray-700 cursor-not-allowed">
                    <ChevronRight size={18} />
                    <span className="font-bold text-sm">السابق</span>
                </div>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-2xl border border-[#222]">
                {pages.map((p) => {
                    const isActive = p === currentPage;
                    return isActive ? (
                        <div
                            key={p}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-sm shadow-[0_4px_12px_rgba(220,38,38,0.4)] transform scale-105 border border-red-500/20"
                        >
                            {p}
                        </div>
                    ) : (
                        <Link
                            key={p}
                            href={createPageUrl(p)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] text-gray-400 font-bold text-sm hover:bg-[#1a1a1a] hover:text-white border border-transparent hover:border-[#333] transition-all"
                        >
                            {p}
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="flex items-center gap-1 pl-4 pr-3 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-400 hover:text-white hover:border-red-600/30 hover:bg-[#151515] transition-all group"
                >
                    <span className="font-bold text-sm">التالي</span>
                    <ChevronLeft size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <div className="flex items-center gap-1 pl-4 pr-3 py-3 bg-[#111]/30 border border-[#222]/30 rounded-xl text-gray-700 cursor-not-allowed">
                    <span className="font-bold text-sm">التالي</span>
                    <ChevronLeft size={18} />
                </div>
            )}
        </div>
    );
}
