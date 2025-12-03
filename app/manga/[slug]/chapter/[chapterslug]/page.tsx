import { supabase } from '@/app/utils/supabase';
import { notFound } from 'next/navigation';
import ChapterReaderClient from '@/app/components/ChapterReaderClient';

export const revalidate = 0;

interface Props {
  params: Promise<{
    slug: string;
    chapterslug: string;
  }>;
}

export default async function ChapterReader({ params }: Props) {
  const { slug: mangaSlug, chapterslug: chapterSlug } = await params;

  const { data: manga } = await supabase
    .from('mangas')
    .select('id, title, slug')
    .eq('slug', mangaSlug)
    .single();

  if (!manga) return notFound();

  const { data: currentChapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('manga_id', manga.id)
    .eq('slug', chapterSlug)
    .single();

  if (error || !currentChapter) return notFound();

  const { data: prevChap } = await supabase
    .from('chapters')
    .select('slug')
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

  return (
    <ChapterReaderClient
      mangaData={manga}
      chapterData={currentChapter}
      prevChap={prevChap}
      nextChap={nextChap}
    />
  );
}