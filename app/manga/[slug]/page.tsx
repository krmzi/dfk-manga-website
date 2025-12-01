import { supabase } from '@/app/utils/supabase';
import Link from 'next/link';
import { Star, Clock, MapPin, Layers, BookOpen, Share2, List } from 'lucide-react';
import { notFound } from 'next/navigation';
import BookmarkButton from '@/app/components/BookmarkButton';
import ViewCounter from '@/app/components/ViewCounter';

export const revalidate = 0;

// ✅ التغيير 1: استقبال Slug بدلاً من ID
interface Props {
    params: Promise<{ slug: string }>;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

export default async function MangaDetails({ params }: Props) {

    const { slug } = await params; // ✅ فك الـ slug

    // 1. محاولة جلب البيانات باستخدام Slug
    let { data: manga, error } = await supabase
        .from('mangas')
        .select(`
        *,
        chapters (
            chapter_number,
            slug,
            created_at
        )
    `)
        .eq('slug', slug)
        .single();

    // 2. إذا لم يتم العثور عليه، وكان الـ slug يبدو كـ UUID، نحاول البحث بالـ ID
    // هذا يحل مشكلة المانهوات القديمة التي قد لا تملك slug أو الروابط التي تستخدم ID
    if (!manga && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        const { data: mangaById, error: errorById } = await supabase
            .from('mangas')
            .select(`
            *,
            chapters (
                chapter_number,
                slug,
                created_at
            )
        `)
            .eq('id', slug)
            .single();

        if (mangaById) {
            manga = mangaById;
            error = null;
        }
    }

    if (error || !manga) return notFound();

    // الترتيب والعمليات تبقى كما هي
    const allChapters = (manga.chapters as any[] || []).sort((a, b) => b.chapter_number - a.chapter_number);
    const firstChapter = allChapters.length > 0 ? allChapters[allChapters.length - 1] : null;

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] pb-20" dir="rtl">

            {/* نمرر الـ ID للعداد والمفضلة لأن الداتابيز تعتمد عليه داخلياً */}
            <ViewCounter mangaId={manga.id} />

            {/* الخلفية */}
            <div className="relative h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-[#050505]/40 z-10" />
                <img src={manga.bg_image || manga.cover_image || "/placeholder_bg.jpg"} className="w-full h-full object-cover opacity-40 blur-xl scale-110" alt="Background" />
            </div>

            {/* المحتوى */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 -mt-80 relative z-20">
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* البوستر والأزرار */}
                    <div className="w-full max-w-[300px] flex-shrink-0 mx-auto lg:mx-0">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.25)] bg-[#1a1a1a] relative">
                            <img src={manga.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={manga.title} />
                            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded font-bold text-xs shadow-lg uppercase">{manga.status || "ONGOING"}</div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {firstChapter && (
                                // ✅ التغيير 2: الرابط أصبح يعتمد على Slug المانهوا + Slug الفصل
                                <Link href={`/manga/${slug}/chapter/${firstChapter.slug}`} className="block w-full">
                                    <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <BookOpen size={20} /> ابدأ القراءة
                                    </button>
                                </Link>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <BookmarkButton mangaId={manga.id} />
                                <button className="py-3 bg-[#1a1a1a] border border-white/10 text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2"><Share2 size={18} /> مشاركة</button>
                            </div>
                        </div>
                    </div>

                    {/* التفاصيل والقائمة */}
                    <div className="flex-1 pt-4 lg:pt-32 w-full">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">{manga.title}</h1>

                        <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-400 mb-8">
                            <span className="bg-[#111] px-4 py-2 rounded-lg border border-white/5"><Star className="inline text-yellow-500" size={16} /> {manga.rating}</span>
                            <span className="bg-[#111] px-4 py-2 rounded-lg border border-white/5"><MapPin className="inline text-red-500" size={16} /> {manga.country}</span>
                            <span className="bg-[#111] px-4 py-2 rounded-lg border border-white/5"><Layers className="inline text-blue-500" size={16} /> {allChapters.length} Chapters</span>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-xl font-black text-white mb-4 border-r-4 border-red-600 pr-3">القصة</h3>
                            <div className="bg-[#111]/80 p-6 rounded-2xl border border-white/5 text-gray-300 leading-8">{manga.description || '...'}</div>
                        </div>

                        {/* القائمة */}
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3"><List className="text-red-600" /> الفصول</h3>
                            </div>

                            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                                {allChapters.length > 0 ? (
                                    allChapters.map((ch) => (
                                        // ✅ التغيير 3: الرابط في القائمة أصبح ديناميكياً بالـ Slug
                                        <Link href={`/manga/${slug}/chapter/${ch.slug}`} key={ch.chapter_number} className="group flex items-center justify-between p-4 rounded-xl bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] hover:translate-x-1 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center text-gray-400 font-black text-lg">{ch.chapter_number}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-200 group-hover:text-white">الفصل {ch.chapter_number}</span>
                                                    <span className="text-xs text-gray-600 flex gap-1"><Clock size={10} /> {formatDate(ch.created_at)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-gray-500">لا توجد فصول</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}