"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookmarkButton({ mangaId }: { mangaId: string }) {
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // 1. التحقق: هل المستخدم سجل دخول؟ وهل هذا العمل في مفضلته؟
    useEffect(() => {
        const checkBookmark = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                const { data } = await supabase
                    .from("bookmarks")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("manga_id", mangaId)
                    .single();

                if (data) setIsBookmarked(true);
            }
            setLoading(false);
        };
        checkBookmark();
    }, [mangaId]);

    // 2. التعامل مع الضغط
    const toggleBookmark = async () => {
        if (!userId) {
            // إذا لم يكن مسجلاً، نوجهه لصفحة الدخول
            return router.push("/login");
        }

        // "تفاءل" بالنتيجة لتسريع الواجهة (Optimistic UI)
        const previousState = isBookmarked;
        setIsBookmarked(!isBookmarked);

        if (previousState) {
            // حذف
            await supabase.from("bookmarks").delete().eq("user_id", userId).eq("manga_id", mangaId);
        } else {
            // إضافة
            await supabase.from("bookmarks").insert({ user_id: userId, manga_id: mangaId });
        }

        router.refresh(); // لتحديث البيانات في الخلفية
    };

    if (loading) return (
        <button className="py-3 px-6 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-500" size={18} />
        </button>
    );

    return (
        <button
            onClick={toggleBookmark}
            className={`py-3 px-6 rounded-xl border font-bold transition flex items-center justify-center gap-2 group w-full md:w-auto
        ${isBookmarked
                    ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    : "bg-[#1a1a1a] border-white/10 text-gray-300 hover:bg-[#222] hover:text-white"
                }`}
        >
            <Heart size={18} className={isBookmarked ? "fill-white" : "group-hover:text-red-500"} />
            {isBookmarked ? "في المفضلة" : "إضافة للمفضلة"}
        </button>
    );
}