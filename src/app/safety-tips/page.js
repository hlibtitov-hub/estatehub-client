const TIPS = [
  {
    title: 'Always meet in person',
    desc: "Never pay a deposit or sign a contract without visiting the property first. Verify that the listing matches reality before committing.",
    color: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    title: 'Verify the owner\'s identity',
    desc: 'Ask for a government-issued ID and proof of ownership before making any payment. A legitimate owner will always cooperate.',
    color: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    title: 'Never wire money upfront',
    desc: 'Be cautious with bank transfers before a contract is signed. Use escrow services or only pay when you have the keys.',
    color: 'bg-red-50 border-red-100',
    iconColor: 'text-red-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    title: 'Use our messaging system',
    desc: 'Keep all communication on EstateHub. Avoid sharing sensitive personal information on third-party apps until you trust the party.',
    color: 'bg-green-50 border-green-100',
    iconColor: 'text-green-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Read the contract carefully',
    desc: 'Review all terms before signing — including deposit conditions, break clauses, and maintenance responsibilities. When in doubt, get legal advice.',
    color: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

export default function SafetyTipsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Safety tips</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Renting or buying property is a big decision. Keep these tips in mind to protect yourself.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {TIPS.map((tip) => (
          <div key={tip.title}
            className={`flex items-start gap-4 border rounded-2xl p-5 ${tip.color}`}>
            <div className={`flex-shrink-0 mt-0.5 ${tip.iconColor}`}>{tip.icon}</div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">{tip.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        If you suspect fraud, please{' '}
        <a href="/contact" className="text-blue-600 hover:underline">contact us</a> immediately.
      </p>
    </main>
  )
}
