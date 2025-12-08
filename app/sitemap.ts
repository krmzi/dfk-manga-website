import { MetadataRoute } from 'next'
import { supabase } from './utils/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dfk-team.site' // الدومين الجديد

    try {
        // 1. جلب كل المانهوا
        const { data: mangas } = await supabase
            .from('mangas')
            .select('slug, created_at')
            .order('created_at', { ascending: false })

        // 2. جلب كل الفصول مع معلومات المانهوا
        const { data: chapters } = await supabase
            .from('chapters')
            .select(`
        slug,
        created_at,
        mangas!inner(slug)
      `)
            .order('created_at', { ascending: false })

        // 3. الصفحات الثابتة
        const staticPages: MetadataRoute.Sitemap = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/manga`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
        ]

        // 4. صفحات المانهوا
        const mangaPages: MetadataRoute.Sitemap = mangas?.map(manga => ({
            url: `${baseUrl}/manga/${manga.slug}`,
            lastModified: new Date(manga.created_at),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        })) || []

        // 5. صفحات الفصول
        const chapterPages: MetadataRoute.Sitemap = chapters?.map((chapter: any) => ({
            url: `${baseUrl}/manga/${chapter.mangas.slug}/chapter/${chapter.slug}`,
            lastModified: new Date(chapter.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })) || []

        // 6. دمج كل الصفحات
        return [
            ...staticPages,
            ...mangaPages,
            ...chapterPages,
        ]

    } catch (error) {
        console.error('Sitemap generation error:', error)

        // Fallback: إرجاع الصفحات الثابتة فقط
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
        ]
    }
}
