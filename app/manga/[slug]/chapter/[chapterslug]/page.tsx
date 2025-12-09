import { supabase } from '@/app/utils/supabase';
import { notFound } from 'next/navigation';
import ChapterReaderClient from '@/app/components/ChapterReaderClient';
import MarkAsRead from '@/app/components/MarkAsRead';
import CommentsSection from '@/app/components/comments/CommentsSection';
import StructuredData, { createChapterSchema, createBreadcrumbSchema } from '@/app/components/StructuredData';
import { Metadata } from 'next';
import { cache } from 'react';

export const revalidate = 0;

interface Props {
  params: Promise<{
    slug: string;
    chapterslug: string;
  }>;
}

// --- Optimization: Cached Data Fetching ---
// This ensures that the data fetched in generateMetadata is REUSED in the main component
// without hitting the database again.
const getChapterData = cache(async (mangaSlug: string, chapterSlug: string) => {
  // Combine Manga + Chapter fetch into ONE query
  const { data, error } = await supabase
    .from('chapters')
    .select(`
      *,
      manga:mangas!inner (
        id,
        title,
        slug,
        cover_image,
        description
      )
    `)
    .eq('slug', chapterSlug)
    .eq('mangas.slug', mangaSlug)
    .single();

  return { data, error };
});


// Generate dynamic metadata for chapter pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: mangaSlug, chapterslug: chapterSlug } = await params;

  // Use the cached function
  const { data: currentChapter } = await getChapterData(mangaSlug, chapterSlug);

  if (!currentChapter || !currentChapter.manga) {
    return {
      title: 'فصل غير موجود | DFK Team',
    };
  }

  // Access the joined manga data
  // @ts-ignore - Supabase type inference for joined tables can be tricky
  const manga = currentChapter.manga;

  const baseUrl = 'https://www.dfk-team.site';
  const chapterUrl = `${baseUrl}/manga/${mangaSlug}/chapter/${chapterSlug}`;
  const chapterTitle = `${manga.title} - الفصل ${currentChapter.chapter_number}`;

  const firstImage = (currentChapter.images as any)?.[0] || manga.cover_image;

  return {
    title: `${chapterTitle} | DFK Team`,
    description: `اقرأ ${chapterTitle} مترجم للعربية بأعلى جودة على DFK Team`,
    keywords: [
      manga.title,
      `الفصل ${currentChapter.chapter_number}`,
      'مانهوا',
      'مانهوا مترجمة',
      'قراءة مانهوا'
    ],
    alternates: {
      canonical: chapterUrl,
    },
    openGraph: {
      title: chapterTitle,
      description: `اقرأ ${chapterTitle} مترجم للعربية`,
      images: firstImage ? [{
        url: firstImage,
        width: 800,
        height: 1200,
        alt: `${chapterTitle} - صفحة 1`
      }] : [],
      type: 'article',
      url: chapterUrl,
      siteName: 'DFK Team',
    },
    twitter: {
      card: 'summary_large_image',
      title: chapterTitle,
      description: `اقرأ ${chapterTitle} مترجم للعربية`,
      images: firstImage ? [firstImage] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ChapterReader({ params }: Props) {
  const { slug: mangaSlug, chapterslug: chapterSlug } = await params;

  // 1. Fetch Main Data (Cached, so instant if metadata ran)
  const { data: currentChapter, error } = await getChapterData(mangaSlug, chapterSlug);

  if (error || !currentChapter || !currentChapter.manga) return notFound();

  // @ts-ignore
  const manga = currentChapter.manga;

  // 2. Fetch Prev/Next in Parallel
  const [prevChapReq, nextChapReq] = await Promise.all([
    supabase
      .from('chapters')
      .select('slug')
      .eq('manga_id', manga.id)
      .lt('chapter_number', currentChapter.chapter_number)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from('chapters')
      .select('slug')
      .eq('manga_id', manga.id)
      .gt('chapter_number', currentChapter.chapter_number)
      .order('chapter_number', { ascending: true })
      .limit(1)
      .single()
  ]);

  const prevChap = prevChapReq.data;
  const nextChap = nextChapReq.data;

  // Structured Data للفصل
  const baseUrl = 'https://www.dfk-team.site';
  const chapterSchema = createChapterSchema(currentChapter, manga);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'الرئيسية', url: baseUrl },
    { name: 'المانهوا', url: `${baseUrl}/manga` },
    { name: manga.title, url: `${baseUrl}/manga/${mangaSlug}` },
    { name: `الفصل ${currentChapter.chapter_number}`, url: `${baseUrl}/manga/${mangaSlug}/chapter/${chapterSlug}` }
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={chapterSchema} />
      <StructuredData data={breadcrumbSchema} />

      <MarkAsRead chapterId={currentChapter.id} mangaId={manga.id} />
      <ChapterReaderClient
        mangaData={manga}
        chapterData={currentChapter}
        prevChap={prevChap}
        nextChap={nextChap}
      />
      <CommentsSection chapterId={currentChapter.id} />
    </>
  );
}