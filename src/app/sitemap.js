const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SITE    = process.env.NEXT_PUBLIC_SITE_URL || 'https://estatehub.cy'

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: SITE,                  priority: 1.0,  changeFrequency: 'daily' },
    { url: `${SITE}/search`,      priority: 0.9,  changeFrequency: 'daily' },
    { url: `${SITE}/mortgage`,    priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${SITE}/about`,       priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${SITE}/contact`,     priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${SITE}/how-it-works`,priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${SITE}/faq`,         priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${SITE}/terms`,       priority: 0.3,  changeFrequency: 'yearly' },
    { url: `${SITE}/privacy`,     priority: 0.3,  changeFrequency: 'yearly' },
  ].map(p => ({ ...p, lastModified: new Date() }))

  // Dynamic property pages
  let propertyPages = []
  try {
    const res = await fetch(`${BACKEND}/properties?limit=500&status=active`, {
      next: { revalidate: 3600 }, // revalidate every hour
    })
    if (res.ok) {
      const data = await res.json()
      const properties = data.properties || data
      propertyPages = properties.map(p => ({
        url:             `${SITE}/properties/${p._id}`,
        lastModified:    new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'weekly',
        priority:        0.8,
      }))
    }
  } catch {
    // Silently fail — sitemap will still include static pages
  }

  return [...staticPages, ...propertyPages]
}
