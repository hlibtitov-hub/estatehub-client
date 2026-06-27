import Link from 'next/link'

const TIPS = [
  {
    title: 'Shoot in natural light',
    desc: 'Open blinds and curtains. Schedule your shoot in the morning or late afternoon for warm, flattering light. Avoid harsh midday sun through windows.',
    badge: 'Lighting',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Use a wide-angle lens',
    desc: 'A wide-angle (16–24mm) lens makes rooms look larger and more inviting. Most modern smartphones have an ultra-wide mode that works great.',
    badge: 'Equipment',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Declutter before shooting',
    desc: 'Remove personal items, clean surfaces, and tidy up. Buyers and renters want to imagine themselves in the space — not see your belongings.',
    badge: 'Preparation',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    title: 'Shoot from corners',
    desc: 'Stand in the corner of each room and shoot diagonally. This shows the most space and gives a natural, professional feel.',
    badge: 'Composition',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Include all key spaces',
    desc: 'Cover: living room, kitchen, all bedrooms, bathrooms, balcony/terrace, parking, and the building exterior. Minimum 6–8 photos per listing.',
    badge: 'Coverage',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
  {
    title: 'Edit lightly',
    desc: 'Increase brightness and contrast slightly. Do NOT use extreme filters or HDR effects — they look unnatural and erode buyer trust.',
    badge: 'Editing',
    badgeColor: 'bg-gray-100 text-gray-700',
  },
]

export default function PhotoGuidelinesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Photo guidelines</h1>
        <p className="text-gray-500 max-w-md mx-auto text-base">
          Listings with great photos get 3× more views. Follow these tips to make yours stand out.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {TIPS.map((tip) => (
          <div key={tip.title}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${tip.badgeColor}`}>
              {tip.badge}
            </span>
            <h2 className="font-semibold text-gray-900 mb-1.5 text-sm">{tip.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Minimum photo requirements</h3>
        <div className="flex justify-center gap-8 text-sm text-gray-600 mt-3">
          <div><p className="text-2xl font-bold text-blue-600">6+</p><p>photos per listing</p></div>
          <div><p className="text-2xl font-bold text-blue-600">1080p</p><p>minimum resolution</p></div>
          <div><p className="text-2xl font-bold text-blue-600">JPG</p><p>or PNG format</p></div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/dashboard"
          className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          Go to my listings
        </Link>
      </div>
    </main>
  )
}
