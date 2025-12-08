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

    useEffect(() => {
        let isMounted = true;

        const checkBookmark = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!isMounted) return;

                if (user) {
                    setUserId(user.id);
                    const { data, error } = await supabase
                        .from("bookmarks")
                        .select("*")
                        .eq("user_id", user.id)
                        .eq("manga_id", mangaId)
                        .maybeSingle();

                    if (!isMounted) return;

                    if (data && !error) {
                        setIsBookmarked(true);
                    }
                }
            } catch (error) {
                console.error("Error checking bookmark:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkBookmark();

        return () => {
            isMounted = false;
        };
    }, [mangaId]);

    const toggleBookmark = async () => {
        if (!userId) {
            return router.push("/login");
        }

        const previousState = isBookmarked;
        setIsBookmarked(!isBookmarked);

        try {
            if (previousState) {
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("user_id", userId)
                    .eq("manga_id", mangaId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("bookmarks")
                    .insert({ user_id: userId, manga_id: mangaId });

                if (error) throw error;
            }
        } catch (error) {
            console.error("Bookmark error:", error);
            setIsBookmarked(previousState);
        }
    };

    if (loading) return (
        <button className="py-3 px-6 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center min-h-[48px]">
            <Loader2 className="animate-spin text-gray-500" size={18} />
        </button>
    );

    return (
        <button
            onClick={toggleBookmark}
            className={`py-3 px-6 rounded-xl border font-bold transition flex items-center justify-center gap-2 group w-full md:w-auto min-h-[48px] active:scale-95
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
