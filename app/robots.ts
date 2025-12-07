import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://dfk-team.com' // غيّره إلى دومينك الحقيقي

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/api/',
                    '/api/*',
                    '/_next/',
                    '/diagnostic',
                ],
            },
            // قواعد خاصة لـ Google Bot
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin', '/api/'],
            },
            // قواعد خاصة لـ Bing Bot
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
