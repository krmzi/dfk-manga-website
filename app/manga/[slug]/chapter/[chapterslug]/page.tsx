import { supabase } from '@/app/utils/supabase';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, List, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0;

// ✅ نستقبل الآن slug المانهوا و chapterSlug
interface Props {
  params: Promise<{
    slug: string;
    chapterSlug: string; // كان اسمه chapterId سابقاً
  }>
}

export default async function ChapterReader({ params }: Props) {
  const { slug: mangaSlug, chapterSlug } = await params;

  // 1. (هام جداً) نجلب ID المانهوا باستخدام الـ Slug الموجود في الرابط
  const { data: manga } = await supabase
    .from('mangas')
    .select('id, title, slug') // نحتاج slug للعودة
    .eq('slug', mangaSlug)
    .single();

  if (!manga) return notFound();

  // 2. الآن نجلب الفصل باستخدام manga_id و chapter_slug
  const { data: currentChapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('manga_id', manga.id)
    .eq('slug', chapterSlug) // البحث بالـ slug
    .single();

  if (error || !currentChapter) return notFound();

  // 3. التنقل بين الفصول (السابق والتالي)
  // هنا نستخدم "رقم الفصل" للعثور على الفصل السابق والتالي منطقياً
  const { data: prevChap } = await supabase
    .from('chapters')
    .select('slug') // نحتاج فقط الـ slug للرابط
    .eq('manga_id', manga.id)
    .lt('chapter_number', currentChapter.chapter_number)
    .order('chapter_number', { ascending: false })
    .limit(1)
    .single();

  const { data: nextChap } = await supabase
    .from('chapters')
    .select('slug')
    .eq('manga_id', manga.id)
    .gt('chapter_number', currentChapter.chapter_number)
    .order('chapter_number', { ascending: true })
    .limit(1)
    .single();

  const imagesList: string[] = Array.isArray(currentChapter.images) ? currentChapter.images as string[] : [];

  return (
    <div className="bg-[#050505] min-h-screen text-[#ededed] flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* ✅ العودة لصفحة المانهوا باستخدام الـ Slug */}
          <Link href={`/manga/${manga.slug}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
              <ArrowRight size={18} />
            </div>
            <span className="hidden md:inline font-bold text-sm truncate max-w-[150px]">{manga.title}</span>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-white font-black text-base md:text-lg tracking-wide">
              الفصل <span className="text-red-600">{currentChapter.chapter_number}</span>
            </h2>
          </div>

          {/* أزرار التنقل بالروابط الجديدة */}
          <div className="flex gap-2">
            {nextChap ? (
              <Link href={`/manga/${manga.slug}/chapter/${nextChap.slug}`} className="p-2 rounded-lg bg-[#222] hover:bg-red-600 text-white transition">
                <ChevronRight size={20} />
              </Link>
            ) : (
              <button disabled className="p-2 rounded-lg bg-[#111] text-gray-600 cursor-not-allowed border border-white/5"><ChevronRight size={20} /></button>
            )}

            {prevChap ? (
              <Link href={`/manga/${manga.slug}/chapter/${prevChap.slug}`} className="p-2 rounded-lg bg-[#222] hover:bg-red-600 text-white transition">
                <ChevronLeft size={20} />
              </Link>
            ) : (
              <button disabled className="p-2 rounded-lg bg-[#111] text-gray-600 cursor-not-allowed border border-white/5"><ChevronLeft size={20} /></button>
            )}
          </div>
        </div>
        <div className="h-0.5 w-full bg-[#222]"><div className="h-full bg-red-600 w-full animate-pulse shadow-[0_0_10px_red]" /></div>
      </div>

      {/* Reader (الصور) */}
      <div className="w-full max-w-[800px] mx-auto bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-0">
        {imagesList.length > 0 ? (
          imagesList.map((imgUrl: string, index: number) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Page ${index + 1}`}
              className="w-full h-auto block select-none"
              loading={index < 3 ? "eager" : "lazy"}
            />
          ))
        ) : (
          <div className="py-40 text-center text-gray-500 flex flex-col items-center">
            <List size={40} className="mb-4 opacity-20" />
            <p>لا توجد صور</p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-[#0a0a0a] border-t border-white/5 py-8 mt-auto">
        <div className="max-w-[800px] mx-auto px-4 flex flex-col md:flex-row gap-4">
          {nextChap ? (
            <Link href={`/manga/${manga.slug}/chapter/${nextChap.slug}`} className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-xl text-center font-black text-white transition shadow-lg flex items-center justify-center gap-2">
              الفصل التالي <ChevronLeft />
            </Link>
          ) : (
            <div className="flex-1 bg-[#151515] py-4 rounded-xl text-center font-bold text-gray-500 cursor-not-allowed border border-white/5">لا يوجد فصل تالي</div>
          )}

          {prevChap && (
            <Link href={`/manga/${manga.slug}/chapter/${prevChap.slug}`} className="flex-1 bg-[#151515] hover:bg-[#222] border border-white/10 py-4 rounded-xl text-center font-bold text-gray-300 transition flex items-center justify-center gap-2">
              <ChevronRight /> الفصل السابق
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}