import { supabase } from '@/app/utils/supabase';
import Link from 'next/link';
import { Star, Clock, MapPin, Layers, BookOpen, List } from 'lucide-react';
import { notFound } from 'next/navigation';
import BookmarkButton from '@/app/components/BookmarkButton';
import ViewCounter from '@/app/components/ViewCounter';
import ShareButton from '@/app/components/ShareButton';
import ChaptersList from '@/app/components/ChaptersList';
import { Metadata } from 'next';

export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const { data: manga } = await supabase
        .from('mangas')
        .select('title, description, cover_image, rating, status')
        .eq('slug', slug)
        .single();

    if (!manga) {
        return {
            title: 'مانهوا غير موجودة | DFK Team',
        };
    }

    return {
        title: `${manga.title} | DFK Team`,
        description: manga.description || `اقرأ ${manga.title} مترجم للعربية بأعلى جودة على DFK Team`,
        openGraph: {
            title: manga.title,
            description: manga.description || `اقرأ ${manga.title} مترجم للعربية`,
            images: [manga.cover_image],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: manga.title,
            description: manga.description || `اقرأ ${manga.title} مترجم للعربية`,
            images: [manga.cover_image],
        },
    };
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

export default async function MangaDetails({ params }: Props) {

    const { slug } = await params;

    // 1. محاولة جلب البيانات باستخدام Slug - مع إضافة id للفصول
    let { data: manga, error } = await supabase
        .from('mangas')
        .select(`
    *,
    chapters(
        id,
        chapter_number,
        slug,
        created_at
    )
        `)
        .eq('slug', slug)
        .single();

    // 2. إذا لم يتم العثور عليه، وكان الـ slug يبدو كـ UUID، نحاول البحث بالـ ID
    if (!manga && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        const { data: mangaById, error: errorById } = await supabase
            .from('mangas')
            .select(`
    *,
    chapters(
        id,
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

    const allChapters = (manga.chapters as any[] || []).sort((a, b) => b.chapter_number - a.chapter_number);
    const firstChapter = allChapters.length > 0 ? allChapters[allChapters.length - 1] : null;

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] pb-20 md:pb-10" dir="rtl">

            <ViewCounter mangaId={manga.id} />

            {/* Background - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block relative h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-[#050505]/40 z-10" />
                <img src={manga.bg_image || manga.cover_image || "/placeholder_bg.jpg"} className="w-full h-full object-cover opacity-40 blur-xl scale-110" alt="Background" />
            </div>

            {/* Content Container */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 md:-mt-80 relative z-20">

                {/* Mobile: Vertical Layout | Desktop: Horizontal Layout */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">

                    {/* Cover Image & Actions */}
                    <div className="w-full md:w-auto md:max-w-[300px] flex-shrink-0">

                        {/* Mobile: Smaller cover at top */}
                        <div className="md:hidden w-full max-w-[200px] mx-auto mb-4">
                            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(220,38,38,0.15)] bg-[#1a1a1a] relative">
                                <img src={manga.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={manga.title} />
                                <div className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs shadow-lg uppercase">{manga.status || "ONGOING"}</div>
                            </div>
                        </div>

                        {/* Desktop: Larger cover */}
                        <div className="hidden md:block">
                            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.25)] bg-[#1a1a1a] relative">
                                <img src={manga.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={manga.title} />
                                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded font-bold text-xs shadow-lg uppercase">{manga.status || "ONGOING"}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 md:mt-6 space-y-3">
                            {firstChapter && (
                                <Link href={`/manga/${slug}/chapter/${firstChapter.slug}`} className="block w-full">
                                    <button className="w-full py-3.5 md:py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]">
                                        <BookOpen size={20} /> ابدأ القراءة
                                    </button>
                                </Link>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <BookmarkButton mangaId={manga.id} />
                                <ShareButton title={manga.title} />
                            </div>
                        </div>
                    </div>

                    {/* Details & Chapters */}
                    <div className="flex-1 w-full md:pt-4 lg:pt-32">

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-2xl text-center md:text-right">{manga.title}</h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 md:gap-3 text-sm font-bold text-gray-400 mb-6 md:mb-8 justify-center md:justify-start">
                            <span className="bg-[#111] px-3 md:px-4 py-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                                <Star className="inline text-yellow-500" size={16} /> {manga.rating}
                            </span>
                            <span className="bg-[#111] px-3 md:px-4 py-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                                <MapPin className="inline text-red-500" size={16} /> {manga.country}
                            </span>
                            <span className="bg-[#111] px-3 md:px-4 py-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                                <Layers className="inline text-blue-500" size={16} /> {allChapters.length} Chapters
                            </span>
                        </div>

                        {/* Description */}
                        <div className="mb-8 md:mb-12">
                            <h3 className="text-lg md:text-xl font-black text-white mb-3 md:mb-4 border-r-4 border-red-600 pr-3">القصة</h3>
                            <div className="bg-[#111]/80 p-4 md:p-6 rounded-2xl border border-white/5 text-gray-300 leading-7 md:leading-8 text-sm md:text-base">
                                {manga.description || '...'}
                            </div>
                        </div>

                        {/* Chapters List */}
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4">
                                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
                                    <List className="text-red-600" size={20} /> الفصول
                                </h3>
                                <span className="text-xs md:text-sm text-gray-500 font-bold">{allChapters.length} فصل</span>
                            </div>

                            {/* Chapters Grid with Read Status */}
                            <ChaptersList
                                chapters={allChapters}
                                mangaSlug={slug}
                                mangaId={manga.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Sticky Bottom Actions (Alternative) */}
            <div className="md:hidden fixed bottom-[70px] left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-30 pointer-events-none">
                <div className="pointer-events-auto max-w-md mx-auto">
                    {firstChapter && (
                        <Link href={`/manga/${slug}/chapter/${firstChapter.slug}`}>
                            <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500">
                                <BookOpen size={20} /> ابدأ القراءة
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}