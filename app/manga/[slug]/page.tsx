import { supabase } from '@/app/utils/supabase';
import Link from 'next/link';
import { Star, Clock, MapPin, Layers, BookOpen, List } from 'lucide-react';
import { notFound } from 'next/navigation';
import BookmarkButton from '@/app/components/BookmarkButton';
import ViewCounter from '@/app/components/ViewCounter';
import ShareButton from '@/app/components/ShareButton';
import ChaptersList from '@/app/components/ChaptersList';
import { Metadata } from 'next';
import StructuredData, { createMangaSchema, createBreadcrumbSchema } from '@/app/components/StructuredData';

export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const { data: manga } = await supabase
        .from('mangas')
        .select('title, description, cover_image, rating, status, genres')
        .eq('slug', slug)
        .single();

    if (!manga) {
        return {
            title: 'مانهوا غير موجودة | DFK Team',
        };
    }

    const baseUrl = 'https://www.dfk-team.site';
    const mangaUrl = `${baseUrl}/manga/${slug}`;

    return {
        title: `${manga.title} | DFK Team`,
        description: manga.description || `اقرأ ${manga.title} مترجم للعربية بأعلى جودة على DFK Team. ${manga.status === 'Ongoing' ? 'مستمر' : 'مكتمل'} - تقييم ${manga.rating}/10`,
        keywords: [
            manga.title,
            'مانهوا',
            'مانجا',
            'مانهوا مترجمة',
            'قراءة مانهوا',
            ...(manga.genres || [])
        ],
        authors: [{ name: 'DFK Team' }],
        alternates: {
            canonical: mangaUrl,
        },
        openGraph: {
            title: manga.title,
            description: manga.description || `اقرأ ${manga.title} مترجم للعربية`,
            images: manga.cover_image ? [{
                url: manga.cover_image,
                width: 800,
                height: 1200,
                alt: `غلاف مانهوا ${manga.title}`
            }] : [],
            type: 'article',
            url: mangaUrl,
            siteName: 'DFK Team',
            locale: 'ar_AR',
        },
        twitter: {
            card: 'summary_large_image',
            title: manga.title,
            description: manga.description || `اقرأ ${manga.title} مترجم للعربية`,
            images: manga.cover_image ? [manga.cover_image] : [],
        },
        robots: {
            index: true,
            follow: true,
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

    // Structured Data للمانهوا
    const baseUrl = 'https://www.dfk-team.site';
    const mangaSchema = createMangaSchema(manga);
    const breadcrumbSchema = createBreadcrumbSchema([
        { name: 'الرئيسية', url: baseUrl },
        { name: 'المانهوا', url: `${baseUrl}/manga` },
        { name: manga.title, url: `${baseUrl}/manga/${slug}` }
    ]);

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] pb-20 md:pb-10 relative overflow-x-hidden" dir="rtl">

            {/* Structured Data for SEO */}
            <StructuredData data={mangaSchema} />
            <StructuredData data={breadcrumbSchema} />

            <ViewCounter mangaId={manga.id} />

            {/* 1. Immersive Background Blur */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-[80vh] bg-gradient-to-b from-red-900/10 via-[#050505]/95 to-[#050505]" />
                <img
                    src={manga.cover_image || "/placeholder_bg.jpg"}
                    className="w-full h-[80vh] object-cover opacity-20 blur-[100px] scale-125"
                    alt=""
                />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[380px_1fr] gap-10 items-start">

                    {/* 2. Sidebar (Sticky) - Cover & Actions */}
                    <div className="lg:sticky lg:top-8 w-full">
                        <div className="relative group perspective-1000">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-red-900 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000"></div>

                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
                                <img
                                    src={manga.cover_image || "/placeholder.jpg"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={manga.title}
                                />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 font-bold text-xs shadow-lg uppercase tracking-wide flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${manga.status === 'Ongoing' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></span>
                                    {manga.status || "ONGOING"}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 space-y-4">
                            {firstChapter && (
                                <Link href={`/manga/${slug}/chapter/${firstChapter.slug}`} className="block w-full group">
                                    <button className="w-full py-4 bg-white text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 transition-all transform group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
                                        <BookOpen size={22} className="text-red-600" />
                                        ابدأ القراءة
                                    </button>
                                </Link>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <BookmarkButton mangaId={manga.id} />
                                <ShareButton title={manga.title} />
                            </div>
                        </div>
                    </div>


                    {/* 3. Main Content Area */}
                    <div className="flex flex-col gap-10">

                        {/* Header Info */}
                        <div className="space-y-6">
                            {/* Breadcrumbs-ish & Year */}
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                <span>مانهوا</span>
                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                <span className="text-gray-400">{new Date(manga.created_at).getFullYear()}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                <span className="flex items-center gap-1 text-red-500"><MapPin size={14} /> {manga.country}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-xl">{manga.title}</h1>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-6 md:gap-10 p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm w-fit">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-white">{manga.rating}</div>
                                        <div className="text-xs font-bold text-gray-500">التقييم العام</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-white">{allChapters.length}</div>
                                        <div className="text-xs font-bold text-gray-500">عدد الفصول</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-white">
                                            {manga.status === "Ongoing" ? "مستمر" : "مكتمل"}
                                        </div>
                                        <div className="text-xs font-bold text-gray-500">الحالة</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="relative group">
                                <p className="text-gray-300 leading-8 text-lg font-medium max-w-4xl opacity-90">
                                    {manga.description}
                                </p>
                            </div>
                        </div>


                        {/* Content Tabs (Visual Only for now) & List */}
                        <div className="w-full">
                            {/* Tabs Header */}
                            <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto pb-1 custom-scrollbar">
                                <button className="pb-4 border-b-2 border-red-600 text-white font-black text-xl md:text-2xl whitespace-nowrap px-2">
                                    الفصول <span className="text-sm align-top text-gray-500 font-bold ml-1">{allChapters.length}</span>
                                </button>
                                <button className="pb-4 border-b-2 border-transparent text-gray-500 font-bold text-xl md:text-2xl hover:text-gray-300 transition-colors whitespace-nowrap px-2">
                                    التعليقات <span className="text-sm align-top text-gray-600 font-bold ml-1">0</span>
                                </button>
                                <button className="pb-4 border-b-2 border-transparent text-gray-500 font-bold text-xl md:text-2xl hover:text-gray-300 transition-colors whitespace-nowrap px-2">
                                    الشخصيات <span className="text-sm align-top text-gray-600 font-bold ml-1">0</span>
                                </button>
                            </div>

                            <ChaptersList
                                chapters={allChapters}
                                mangaSlug={slug}
                                mangaId={manga.id}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Bottom Action (Optional) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-40 md:hidden pointer-events-none">
                <div className="pointer-events-auto flex gap-3">
                    {firstChapter && (
                        <Link href={`/manga/${slug}/chapter/${firstChapter.slug}`} className="flex-1">
                            <button className="w-full py-3.5 bg-red-600 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2">
                                اقرأ الفصل الأول
                            </button>
                        </Link>
                    )}
                </div>
            </div>

        </div>
    );
}