'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    q: 'Is EstateHub free to use?',
    a: 'Yes, browsing and contacting owners is completely free. We do not charge tenants or buyers any fees.',
  },
  {
    q: 'How do I list my property?',
    a: 'Create an account as an Owner, then go to your Dashboard and click "New listing". Fill in the details, upload photos, and publish.',
  },
  {
    q: 'Can I message the owner before viewing?',
    a: 'Absolutely. Every property page has a "Message the owner" button. You need to be logged in to send a message.',
  },
  {
    q: 'How do I add a property to my favorites?',
    a: 'Click the heart icon on any property card or listing page. You must be logged in to save favorites.',
  },
  {
    q: 'What cities in Cyprus do you cover?',
    a: 'We currently cover Limassol, Nicosia, Larnaca, Paphos, Ayia Napa, and Protaras — with more cities being added.',
  },
  {
    q: 'How do I edit or delete my listing?',
    a: 'Go to your Dashboard (My listings). Each listing has an Edit and Delete button. Changes are reflected immediately.',
  },
  {
    q: 'Is my personal data secure?',
    a: 'Yes. We store passwords encrypted and never share your personal information with third parties.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState(null)

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Frequently asked questions</h1>
        <p className="text-gray-500">Can't find an answer? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>.</p>
      </div>

      <div className="flex flex-col gap-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                className={`flex-shrink-0 ml-3 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
