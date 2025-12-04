import Link from 'next/link';
import { Search, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                        404
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="bg-[#111] p-4 rounded-full border border-[#222]">
                        <Search className="w-12 h-12 text-gray-600" />
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-2xl font-black text-white mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={20} />
                        <span>الصفحة الرئيسية</span>
                    </Link>

                    <Link
                        href="/manga"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <BookOpen size={20} />
                        <span>تصفح المانهوا</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
