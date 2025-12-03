"use client";

import Link from 'next/link';
import { ChevronRight, ChevronLeft, ArrowRight, Home, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    mangaData: any;
    chapterData: any;
    prevChap: any;
    nextChap: any;
}

export default function ChapterReaderClient({ mangaData, chapterData, prevChap, nextChap }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100); // 100% width by default

    const imagesList: string[] = Array.isArray(chapterData.images) ? chapterData.images as string[] : [];
    const totalPages = imagesList.length;

    // Auto-hide controls
    useEffect(() => {
        if (showControls) {
            const timer = setTimeout(() => setShowControls(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showControls]);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const page = Math.ceil((scrolled / total) * totalPages) || 1;
            setCurrentPage(Math.min(page, totalPages));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [totalPages]);

    // Zoom handlers
    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 100));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 30));
    const resetZoom = () => setZoomLevel(100);

    const handleTap = (e: React.MouseEvent) => {
        const clickX = e.clientX;
        const screenWidth = window.innerWidth;

        if (!showControls) {
            setShowControls(true);
            return;
        }

        if (clickX < screenWidth / 3 && prevChap) {
            setShowControls(false);
        } else if (clickX > (screenWidth * 2) / 3 && nextChap) {
            setShowControls(false);
        } else {
            setShowControls(false);
        }
    };

    const toggleUI = () => setShowControls(prev => !prev);

    return (
        <div className="bg-[#050505] min-h-screen text-white flex flex-col relative">

            {/* --- Top Bar (Floating) --- */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent h-24 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Right: Back / Home */}
                    <div className="flex items-center gap-3">
                        <Link href={`/manga/${mangaData.slug}`} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all active:scale-95 shadow-lg group">
                            <ArrowRight size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <Link href="/" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg">
                            <Home size={18} />
                        </Link>
                    </div>

                    {/* Center: Title (Hidden on small mobile to save space) */}
                    <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
                        <h2 className="font-bold text-sm text-gray-300">{mangaData.title}</h2>
                        <p className="text-xs text-red-500 font-black mt-0.5">الفصل {chapterData.chapter_number}</p>
                    </div>

                    {/* Left: Page Counter */}
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-gray-300 shadow-lg">
                            {currentPage} / {totalPages}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Reader Area --- */}
            <div
                className="flex-1 flex flex-col items-center min-h-screen pt-0 pb-0 cursor-pointer"
                onClick={toggleUI}
            >
                <div
                    className="w-full transition-all duration-300 ease-out"
                    style={{ maxWidth: `${zoomLevel}%` }}
                >
                    {imagesList.length > 0 ? (
                        imagesList.map((imgUrl: string, index: number) => (
                            <img
                                key={index}
                                src={imgUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto block select-none"
                                loading={index < 3 ? "eager" : "lazy"}
                                draggable={false}
                            />
                        ))
                    ) : (
                        <div className="h-screen flex flex-col items-center justify-center text-gray-500">
                            <p className="text-lg font-bold">لا توجد صور</p>
                            <p className="text-sm mt-2">يرجى التحقق من الفصل لاحقاً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Bottom Bar (Controls & Nav) --- */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/90 to-transparent h-48 pointer-events-none" />

                <div className="relative max-w-3xl mx-auto px-4 pb-8 pt-12 flex flex-col gap-6">

                    {/* Zoom Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all">
                            <ZoomOut size={18} />
                        </button>

                        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-sm font-bold min-w-[80px] text-center">
                            {zoomLevel}%
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all">
                            <ZoomIn size={18} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); resetZoom(); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all" title="Reset Zoom">
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        {nextChap ? (
                            <Link href={`/manga/${mangaData.slug}/chapter/${nextChap.slug}`} className="flex-1">
                                <button className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    الفصل التالي <ChevronLeft size={18} />
                                </button>
                            </Link>
                        ) : (
                            <div className="flex-1 py-3.5 bg-white/5 rounded-xl text-center text-gray-500 font-bold border border-white/5">
                                النهاية
                            </div>
                        )}

                        {prevChap && (
                            <Link href={`/manga/${mangaData.slug}/chapter/${prevChap.slug}`} className="flex-1">
                                <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <ChevronRight size={18} /> السابق
                                </button>
                            </Link>
                        )}
                    </div>

                </div>
            </div>

            {/* Progress Bar (Always visible at bottom edge, very thin) */}
            {!showControls && (
                <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5 z-40">
                    <div
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                </div>
            )}

        </div>
    );
}
