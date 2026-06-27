import Link from 'next/link'

const TIPS = [
  {
    title: 'Research the local market',
    desc: 'Before setting a price, browse similar listings in your city and neighbourhood on EstateHub. Compare size, condition, amenities and distance to city centre.',
    icon: '🔍',
  },
  {
    title: 'Price at market, not above',
    desc: 'Overpriced listings get fewer views and take longer to fill. A property priced 5–10% above market may sit empty for months — costing more than a slightly lower rent would.',
    icon: '📊',
  },
  {
    title: 'Factor in all costs',
    desc: 'Include utilities, maintenance, and management costs in your calculations. If you\'re renting furnished, premium of 10–20% is typical in Cyprus.',
    icon: '🧮',
  },
  {
    title: 'Seasonal pricing',
    desc: 'Coastal cities like Limassol and Paphos see higher demand in summer. Consider slightly higher short-term rates in peak season if you allow flexible leases.',
    icon: '🌊',
  },
  {
    title: 'Offer incentives for long-term tenants',
    desc: 'A small discount for 12-month contracts vs month-to-month reduces vacancy risk. Long-term tenants also tend to take better care of the property.',
    icon: '🤝',
  },
]

const BENCHMARKS = [
  { type: 'Studio', city: 'Limassol', range: '€600 – €900' },
  { type: '1-bed apartment', city: 'Limassol', range: '€800 – €1,400' },
  { type: '2-bed apartment', city: 'Limassol', range: '€1,100 – €2,000' },
  { type: '3-bed house', city: 'Limassol', range: '€1,800 – €3,500' },
  { type: '1-bed apartment', city: 'Nicosia', range: '€600 – €1,000' },
  { type: '2-bed apartment', city: 'Nicosia', range: '€900 – €1,600' },
]

export default function PricingTipsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Pricing tips for owners</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Set the right price from day one. A well-priced property rents faster and attracts better tenants.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-10">
        {TIPS.map((tip) => (
          <div key={tip.title}
            className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1 text-sm">{tip.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Cyprus rental benchmarks (2024)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Approximate monthly rent ranges</p>
        </div>
        <div className="divide-y divide-gray-50">
          {BENCHMARKS.map((b, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{b.type}</p>
                <p className="text-xs text-gray-400">{b.city}</p>
              </div>
              <span className="text-sm font-semibold text-blue-600">{b.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/dashboard"
          className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          List your property
        </Link>
      </div>
    </main>
  )
}
