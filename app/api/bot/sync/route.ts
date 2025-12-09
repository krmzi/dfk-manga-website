import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تهيئة عميل Supabase بصلاحيات الـ Service Role لتجاوز قيود RLS
// لأن البوت يعمل في الخلفية ولا يملك جلسة مستخدم عادية
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const mangaIdParam = searchParams.get('manga_id');

        if (!slug && !mangaIdParam) {
            return NextResponse.json({ error: 'Missing slug or manga_id parameter' }, { status: 400 });
        }

        let mangaId = mangaIdParam;

        // إذا تم إرسال الـ slug، نجلب الـ ID المقابل له
        if (slug && !mangaId) {
            const { data: manga, error: mangaError } = await supabaseAdmin
                .from('mangas')
                .select('id')
                .eq('slug', slug)
                .single();

            if (mangaError || !manga) {
                return NextResponse.json({ error: 'Manga not found', details: mangaError }, { status: 404 });
            }
            mangaId = manga.id;
        }

        // جلب آخر فصل تم رفعه لهذه المانهوا
        const { data: lastChapter, error: chapterError } = await supabaseAdmin
            .from('chapters')
            .select('chapter_number')
            .eq('manga_id', mangaId)
            .order('chapter_number', { ascending: false })
            .limit(1)
            .single();

        if (chapterError && chapterError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine (new manga)
            return NextResponse.json({ error: 'Error fetching chapters' }, { status: 500 });
        }

        return NextResponse.json({
            manga_id: mangaId,
            last_chapter: lastChapter ? lastChapter.chapter_number : 0, // 0 يعني لا يوجد فصول بعد
            status: 'success'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
