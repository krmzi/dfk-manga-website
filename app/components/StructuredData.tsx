
interface StructuredDataProps {
    data: Record<string, any>;
}

/**
 * مكون لإضافة Structured Data (JSON-LD) للصفحات
 * يساعد Google على فهم محتوى الصفحة وعرض Rich Snippets
 */
export default function StructuredData({ data }: StructuredDataProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data, null, 2)
            }}
        />
    );
}

/**
 * دوال مساعدة لإنشاء Structured Data
 */

// 1. Schema للمانهوا (Book/ComicSeries)
export function createMangaSchema(manga: any) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `https://www.dfk-team.site/manga/${manga.slug}`,
        name: manga.title,
        description: manga.description || `اقرأ ${manga.title} مترجم للعربية`,
        image: manga.cover_image,
        author: {
            '@type': 'Organization',
            name: 'DFK Team',
            url: 'https://www.dfk-team.site'
        },
        publisher: {
            '@type': 'Organization',
            name: 'DFK Team',
            url: 'https://www.dfk-team.site',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.dfk-team.site/logo.png'
            }
        },
        aggregateRating: manga.rating ? {
            '@type': 'AggregateRating',
            ratingValue: manga.rating,
            bestRating: '10',
            worstRating: '0',
            ratingCount: manga.views || 1
        } : undefined,
        genre: manga.genres?.join(', '),
        inLanguage: 'ar',
        datePublished: manga.created_at,
        numberOfPages: manga.chapters?.length || 0,
        bookFormat: 'https://schema.org/EBook',
        url: `https://www.dfk-team.site/manga/${manga.slug}`
    };
}

// 2. Schema للفصل (Chapter/Article)
export function createChapterSchema(chapter: any, manga: any) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `https://www.dfk-team.site/manga/${manga.slug}/chapter/${chapter.slug}`,
        headline: `${manga.title} - الفصل ${chapter.chapter_number}`,
        description: `اقرأ الفصل ${chapter.chapter_number} من ${manga.title} مترجم للعربية`,
        image: chapter.images?.[0] || manga.cover_image,
        author: {
            '@type': 'Organization',
            name: 'DFK Team'
        },
        publisher: {
            '@type': 'Organization',
            name: 'DFK Team',
            url: 'https://www.dfk-team.site'
        },
        datePublished: chapter.created_at,
        dateModified: chapter.updated_at || chapter.created_at,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.dfk-team.site/manga/${manga.slug}/chapter/${chapter.slug}`
        },
        isPartOf: {
            '@type': 'Book',
            name: manga.title,
            url: `https://www.dfk-team.site/manga/${manga.slug}`
        },
        inLanguage: 'ar'
    };
}

// 3. Schema للصفحة الرئيسية (WebSite)
export function createWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://www.dfk-team.site/#website',
        name: 'DFK Team',
        description: 'منصة قراءة المانهوا والمانجا المترجمة للعربية',
        url: 'https://www.dfk-team.site',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.dfk-team.site/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        },
        publisher: {
            '@type': 'Organization',
            name: 'DFK Team',
            url: 'https://www.dfk-team.site'
        },
        inLanguage: 'ar'
    };
}

// 4. Schema للـ Organization
export function createOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://www.dfk-team.site/#organization',
        name: 'DFK Team',
        url: 'https://www.dfk-team.site',
        logo: {
            '@type': 'ImageObject',
            url: 'https://www.dfk-team.site/logo.png'
        },
        description: 'فريق ترجمة المانهوا والمانجا للغة العربية',
        sameAs: [
            // أضف روابط السوشيال ميديا
            // 'https://twitter.com/dfkteam',
            // 'https://facebook.com/dfkteam',
        ]
    };
}

// 5. Schema للـ Breadcrumbs
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
}

// 6. Schema للـ ItemList (قائمة المانهوا)
export function createItemListSchema(mangas: any[], listName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        itemListElement: mangas.map((manga, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Book',
                name: manga.title,
                url: `https://www.dfk-team.site/manga/${manga.slug}`,
                image: manga.cover_image
            }
        }))
    };
}
