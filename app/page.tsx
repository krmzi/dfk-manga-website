import { supabase } from "./utils/supabase";
import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import NewReleasesSlider from "./components/NewReleasesSlider";
import ChapterCard from "./components/ChapterCard";
import { ChevronLeft, ChevronRight, LayoutGrid, Flame } from "lucide-react";
import StructuredData, { createWebsiteSchema, createOrganizationSchema } from "./components/StructuredData";

// ⚠️ إلغاء الكاش لضمان التحديث اللحظي (SSR)
// ⚠️ تفعيل الكاش لمدة 60 ثانية لتحسين الأداء
export const revalidate = 60;

// --- 1. التعريفات (TypeScript Definitions) ---
interface Chapter {
  chapter_number: number;
  created_at: string;
  slug: string;
}

interface Manga {
  id: string;
  slug: string; // ✅
  title: string;
  cover_image: string;
  bg_image: string;
  rating: number;
  status: string;
  country: string;
  created_at: string;
  chapters: Chapter[];
}

// --- 2. دوال مساعدة (Utils) ---
function getTimeAgo(dateString: string) {
  const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)}د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)}س`;
  return `منذ ${Math.floor(diff / 86400)}ي`;
}

function isNewChapter(dateString: string) {
  // يعتبر الفصل جديداً إذا مر عليه أقل من 24 ساعة
  return (new Date().getTime() - new Date(dateString).getTime()) < (24 * 60 * 60 * 1000);
}

// --- 3. مكون الصفحة الرئيسية (Home Page) ---
export default async function Home(props: { searchParams: Promise<{ page?: string }> }) {
  // Await searchParams in Next.js 15+
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const itemsPerPage = 12;

  // --- A. Optimization: Parallel Data Fetching ---
  const [newReleasesResult, latestIdsResult, topRatedResult] = await Promise.all([
    // 1. New Releases (Slider)
    supabase
      .from('mangas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),

    // 2. Latest Updates (Via RPC for correct pagination)
    supabase.rpc('get_latest_updated_mangas', {
      page_offset: (page - 1) * itemsPerPage,
      page_limit: itemsPerPage
    }),

    // 3. Top Rated (Sidebar)
    supabase
      .from('mangas')
      .select('id, title, cover_image, rating, country, status, views, slug')
      .order('views', { ascending: false })
      .limit(5)
  ]);

  const newReleasesData = newReleasesResult.data;
  const topRatedData = topRatedResult.data;

  // --- B. Fetch Full Details for RPC Results ---
  let latestChaptersData: any[] = [];
  if (latestIdsResult.data && latestIdsResult.data.length > 0) {
    const ids = latestIdsResult.data.map((m: any) => m.id);

    // Fetch details + chapters for these specific IDs
    const { data: details } = await supabase
      .from('mangas')
      .select(`
        *,
        chapters (
            chapter_number,
            created_at,
            slug
        )
      `)
      .in('id', ids);

    // Re-sort in JS to match the RPC order (Latest Updated First)
    if (details) {
      const orderMap = new Map(ids.map((id: string, index: number) => [id, index]));
      latestChaptersData = details.sort((a, b) => {
        return (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0);
      });
    }
  }

  // --- 3. معالجة وتنسيق البيانات ---

  // 1. حساب "تاريخ التحديث" لكل مانهوا
  const processedMangas = latestChaptersData.map((manga: any) => {
    const sortedChapters = (manga.chapters || []).sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      ...manga,
      chapters: sortedChapters,
      lastUpdateTimestamp: new Date(sortedChapters[0]?.created_at || manga.created_at).getTime()
    };
  });

  // 2. تحويل البيانات للشكل الذي يفهمه ChapterCard
  const displayContent = processedMangas.map((manga: any) => ({
    id: manga.id,
    slug: manga.slug,
    title: manga.title,
    image: manga.cover_image,
    rating: manga.rating?.toString() || "0.0",
    status: manga.status,
    country: manga.country,
    chapters: manga.chapters.slice(0, 3).map((ch: any) => ({
      num: ch.chapter_number.toString(),
      time: getTimeAgo(ch.created_at),
      isNew: isNewChapter(ch.created_at),
      slug: ch.slug
    }))
  }));

  // Structured Data للصفحة الرئيسية
  const websiteSchema = createWebsiteSchema();
  const organizationSchema = createOrganizationSchema();

  return (
    <div className="bg-[#050505] min-h-screen pb-20 text-right" dir="rtl">

      {/* Structured Data for SEO */}
      <StructuredData data={websiteSchema} />
      <StructuredData data={organizationSchema} />

      {/* 1. Hero Section */}
      <Hero featuredMangas={(newReleasesData || []) as any} />

      <div className="w-full max-w-full md:max-w-[1450px] mx-auto px-4 md:px-6 mt-6 md:mt-10">

        {/* 2. New Releases Slider */}
        <div className="mb-16 animate-fade-in-up">
          <NewReleasesSlider mangas={newReleasesData as any || []} />
        </div>

        <div className="flex flex-col xl:flex-row gap-10 border-t border-white/5 pt-10">

          {/* 3. Main Grid (75%) */}
          <div className="w-full xl:w-[75%]">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-[#111] p-3 rounded-xl border border-[#222] shadow-sm">
                    <LayoutGrid className="text-red-600 w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">
                    آخر <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-500 to-red-700">التحديثات</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-bold mt-1.5 tracking-wide">
                    فصول حصرية بجودة عالية
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayContent.map((item: any) => (
                <ChapterCard key={item.id} {...item} />
              ))}

              {/* Empty State */}
              {displayContent.length === 0 && (
                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-2xl border border-[#222] border-dashed group hover:border-red-900/30 transition-all">
                  <div className="bg-[#111] p-5 rounded-full mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Flame className="w-10 h-10 text-gray-700 group-hover:text-red-600 transition-colors" />
                  </div>
                  <h3 className="text-gray-300 font-black text-xl mb-2">المكتبة هادئة حالياً</h3>
                  <p className="text-sm text-gray-500 font-medium">سيقوم الفريق برفع فصول جديدة قريباً</p>
                </div>
              )}
            </div>

            {/* Modern Pagination - Real Links */}
            <div className="flex justify-center items-center gap-4 mt-20 mb-8 select-none">
              {/* زر الصفحة السابقة - يظهر فقط إذا لم نكن في الصفحة 1 */}
              {page > 1 ? (
                <a
                  href={`/?page=${page - 1}`}
                  className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-full text-xs md:text-sm font-bold text-gray-400 hover:text-white transition-all hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)] group"
                >
                  <ChevronRight size={16} className="group-hover:-translate-x-1 transition-transform" /> السابق
                </a>
              ) : (
                <button disabled className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#111]/50 border border-[#222]/50 rounded-full text-xs md:text-sm font-bold text-gray-600 cursor-not-allowed">
                  <ChevronRight size={16} /> السابق
                </button>
              )}

              <div className="flex items-center gap-2 bg-[#0a0a0a] px-3 py-2 rounded-full border border-[#222] shadow-inner">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-sm shadow-[0_4px_10px_rgba(220,38,38,0.4)] transform scale-110">
                  {page}
                </span>
              </div>

              {/* زر الصفحة التالية - نفترض وجود صفحة تالية إذا كانت الحالية ممتلئة */}
              {displayContent.length === itemsPerPage ? (
                <a
                  href={`/?page=${page + 1}`}
                  className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-full text-xs md:text-sm font-bold text-gray-400 hover:text-white transition-all hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)] group"
                >
                  التالي <ChevronLeft size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button disabled className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#111]/50 border border-[#222]/50 rounded-full text-xs md:text-sm font-bold text-gray-600 cursor-not-allowed">
                  التالي <ChevronLeft size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 4. Sidebar (25%) */}
          <div className="w-full xl:w-[25%]">
            <div className="sticky top-28 space-y-10">
              <Sidebar topMangas={topRatedData as any || []} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
