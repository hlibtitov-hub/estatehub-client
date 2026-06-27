const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://estatehub.cy'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/messages',
          '/profile',
          '/favorites',
          '/listings/create',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
