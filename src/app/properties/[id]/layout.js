const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function generateMetadata({ params }) {
  try {
    const res  = await fetch(`${BACKEND}/api/properties/${params.id}`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('not found')
    const { property } = await res.json()

    const title       = property.title || 'Property'
    const city        = property.address?.city || 'Cyprus'
    const price       = property.price ? `€${Number(property.price).toLocaleString()}` : ''
    const description = property.description
      ? property.description.slice(0, 155)
      : `${title} in ${city}${price ? ` — ${price}` : ''}. Listed on EstateHub.`
    const image       = property.images?.[0] || '/og-image.png'

    return {
      title,
      description,
      openGraph: {
        title:       `${title} | EstateHub`,
        description,
        images:      [{ url: image, width: 1200, height: 630, alt: title }],
        type:        'article',
      },
      twitter: {
        card:        'summary_large_image',
        title:       `${title} | EstateHub`,
        description,
        images:      [image],
      },
    }
  } catch {
    return {
      title: 'Property | EstateHub',
      description: 'View property details on EstateHub.',
    }
  }
}

export default function PropertyLayout({ children }) {
  return children
}
