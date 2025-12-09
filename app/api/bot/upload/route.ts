import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تهيئة عميل Supabase بصلاحيات الـ Service Role
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { manga_id, chapter_number, images, secret_key } = body;

        console.log(`[BOT UPLOAD] Received request for MangaID: ${manga_id}, Chapter: ${chapter_number}`);

        // 1. التحقق من مفتاح الأمان (Security Check)
        if (secret_key !== process.env.BOT_API_SECRET) {
            console.warn(`[BOT UPLOAD] Unauthorized access attempt. Key provided: ${secret_key?.substring(0, 5)}...`);
            return NextResponse.json({ error: 'Unauthorized: Invalid Secret Key' }, { status: 401 });
        }

        // 2. التحقق من البيانات المطلوبة
        if (!manga_id || chapter_number === undefined || !images || !Array.isArray(images)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (images.length === 0) {
            return NextResponse.json({ error: 'Empty images array' }, { status: 400 });
        }

        // ensure chapter_number is a number
        const chapNum = parseFloat(chapter_number);

        // 3. التحقق من عدم وجود الفصل مسبقاً (Double Check)
        const { data: existingChapter } = await supabaseAdmin
            .from('chapters')
            .select('id')
            .eq('manga_id', manga_id)
            .eq('chapter_number', chapNum) // Use parsed number
            .single();

        if (existingChapter) {
            console.log(`[BOT UPLOAD] Chapter already exists: ${existingChapter.id}`);
            return NextResponse.json({
                message: 'Chapter already exists',
                chapter_id: existingChapter.id
            }, { status: 200 });
        }

        // 4. إدخال الفصل الجديد
        const { data: newChapter, error: insertError } = await supabaseAdmin
            .from('chapters')
            .insert({
                manga_id: manga_id,
                chapter_number: chapNum,
                slug: `${chapNum}`,
                images: images,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error(`[BOT UPLOAD] DB Insert Error:`, insertError);
            return NextResponse.json({ error: 'Database Insert Failed', details: insertError }, { status: 500 });
        }

        console.log(`[BOT UPLOAD] Success! New Chapter ID: ${newChapter.id}`);

        return NextResponse.json({
            status: 'success',
            message: 'Chapter uploaded successfully',
            chapter: newChapter
        });

    } catch (error: any) {
        console.error(`[BOT UPLOAD] Critical Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
