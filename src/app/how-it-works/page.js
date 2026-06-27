import Link from 'next/link'

const STEPS = [
  {
    step: '01',
    title: 'Search properties',
    desc: 'Browse thousands of listings in Cyprus. Filter by city, type, price and number of bedrooms to find your perfect match.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'View details & photos',
    desc: 'Each listing includes high-quality photos, floor plans, pricing, and all the key details you need to make a decision.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Message the owner',
    desc: 'Contact property owners directly through our built-in messaging system. No middleman, no hidden fees.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Schedule a viewing',
    desc: 'Arrange a visit at a time that works for you. Meet the owner and see the property in person before committing.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Sign & move in',
    desc: 'Agree on terms with the owner, sign the contract and get your keys. That simple — no agency fees on our platform.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

export default function HowItWorksPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How EstateHub works</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Find your next home in Cyprus in 5 simple steps — no hidden fees, no agents required.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {STEPS.map((s, i) => (
          <div key={s.step}
            className="flex items-start gap-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 tracking-widest">STEP {s.step}</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">{s.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-blue-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
        <p className="text-blue-100 mb-5 text-sm">Browse hundreds of listings across Cyprus right now.</p>
        <Link href="/search"
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
          Browse listings
        </Link>
      </div>
    </main>
  )
}
