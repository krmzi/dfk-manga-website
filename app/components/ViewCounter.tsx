"use client";
import { useEffect, useRef } from "react";
import { supabase } from "@/app/utils/supabase";

interface Props {
    mangaId: string;
}

export default function ViewCounter({ mangaId }: Props) {
    // نستخدم useRef لضمان أن الكود يعمل مرة واحدة فقط عند تحميل الصفحة
    const hasCounted = useRef(false);

    useEffect(() => {
        if (!hasCounted.current) {
            const increment = async () => {
                // استدعاء الدالة الآمنة في قاعدة البيانات
                await supabase.rpc('increment_views', { manga_id: mangaId });
            };
            increment();
            hasCounted.current = true;
        }
    }, [mangaId]);

    // هذا المكون وظيفي فقط ولا يعرض شيئاً على الشاشة
    return null;
}