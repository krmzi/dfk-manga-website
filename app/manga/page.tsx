import { supabase } from "@/app/utils/supabase";
import MangaLibrary from "@/app/components/MangaLibrary"; // استيراد المكون التفاعلي

export const revalidate = 0;

export default async function MangaListPage() {
  
  // 1. جلب كل المانهوات من قاعدة البيانات
  const { data: mangas } = await supabase
    .from('mangas')
    .select('*, chapters(chapter_number)')
    .order('created_at', { ascending: false });

  // 2. تنسيق البيانات (حساب آخر فصل)
  const formattedMangas = mangas?.map((manga: any) => {
      const latestChap = manga.chapters?.length > 0 
        ? Math.max(...manga.chapters.map((c: any) => c.chapter_number))
        : null;

      return {
          ...manga,
          latestChNum: latestChap
      };
  }) || [];

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* العنوان */}
        <div className="mb-12 text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">مكتبة <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">الأعمال</span></h1>
            <p className="text-gray-400 font-medium text-lg max-w-2xl">تصفح الأرشيف الكامل، استخدم الفلترة للعثور على ما يناسب ذوقك.</p>
        </div>

        {/* استدعاء المكون التفاعلي وتمرير البيانات له */}
        <MangaLibrary initialMangas={formattedMangas} />

      </div>
    </div>
  );
}