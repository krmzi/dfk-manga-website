"use client"; // ✅ تحويل الصفحة إلى Client Component لحل مشكلة الدخول
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";
import { Heart, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

// مكون بطاقة المانهوا البسيطة
const FavCard = ({ manga }: { manga: any }) => (
    <Link href={`/manga/${manga.slug}`} className="group relative block aspect-[2/3] rounded-xl overflow-hidden border border-white/10 hover:border-red-600 hover:-translate-y-1 transition-all duration-300">
        <img
            src={manga.cover_image || "/placeholder.jpg"}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            alt={manga.title}
            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; e.currentTarget.onerror = null; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* التقييم */}
        <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-black px-2 py-1 rounded text-white shadow-lg uppercase tracking-wider
                ${manga.status === 'Ongoing' ? 'bg-green-600' : 'bg-blue-600'}
             `}>
                {manga.status || 'Ongoing'}
            </span>
        </div>

        <div className="absolute bottom-0 p-3 w-full">
            <h3 className="text-white font-bold text-sm truncate group-hover:text-red-500 transition-colors">{manga.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <StarIcon /> {manga.rating}
            </div>
        </div>
    </Link>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-500">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
)

export default function BookmarksPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchBookmarks = async () => {
            // 1. التحقق من المستخدم
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // إذا لم يكن مسجلاً، وجهه لصفحة الدخول مع رابط العودة
                router.replace("/login?next=/bookmarks");
                return;
            }

            setUser(user);

            // 2. جلب البيانات من جدول bookmarks وربطه بـ mangas
            const { data, error } = await supabase
                .from('bookmarks')
                .select(`
            manga_id,
            mangas (
                id, title, cover_image, status, rating, slug
            )
        `)
                .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching bookmarks:", error);
            } else {
                setBookmarks(data || []);
            }
            setLoading(false);
        };

        fetchBookmarks();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white pt-20">
                <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse">جاري تحميل مكتبتك...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] pt-28 pb-20 px-4 md:px-8" dir="rtl">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <Heart className="text-red-600 fill-red-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">مكتبتي الخاصة</h1>
                        <p className="text-gray-500 text-sm mt-1 font-bold">لديك {bookmarks.length} عملاً في القائمة</p>
                    </div>
                </div>

                {/* Content Grid */}
                {bookmarks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {bookmarks.map((item: any) => (
                            <FavCard key={item.manga_id} manga={item.mangas} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#111] rounded-3xl border-2 border-dashed border-[#222] group hover:border-white/10 transition-colors">
                        <div className="p-4 bg-black rounded-full mb-4">
                            <BookOpen size={40} className="text-gray-700" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">القائمة فارغة حالياً</h2>
                        <p className="text-gray-500 mb-6 text-sm">أضف بعض الأعمال لمتابعتها لاحقاً</p>
                        <Link href="/manga" className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg">
                            تصفح الأعمال
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}