"use client";

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl"></div>
                        <div className="relative bg-[#111] p-6 rounded-full border border-red-600/20">
                            <AlertTriangle className="w-16 h-16 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-3xl font-black text-white mb-4">
                    عذراً، حدث خطأ!
                </h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <RefreshCw size={20} />
                        <span>إعادة المحاولة</span>
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={20} />
                        <span>الصفحة الرئيسية</span>
                    </Link>
                </div>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-[#111] border border-[#222] rounded-xl text-left">
                        <p className="text-xs text-red-400 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
