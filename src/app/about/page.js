'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

const STATS = [
  { value: '5,000+', label: 'Properties listed' },
  { value: '12,000+', label: 'Happy clients'    },
  { value: '6',       label: 'Cities in Cyprus' },
  { value: '4 years', label: 'On the market'    },
]

const TEAM = [
  { name: 'Alex Petrov',    role: 'CEO & Co-founder',      initials: 'AP', color: 'bg-blue-100 text-blue-600'    },
  { name: 'Maria Ioannou',  role: 'Head of Real Estate',   initials: 'MI', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Dmitri Sokolov', role: 'Lead Developer',        initials: 'DS', color: 'bg-violet-100 text-violet-600'  },
  { name: 'Elena Charalambous', role: 'Customer Success',  initials: 'EC', color: 'bg-amber-100 text-amber-600'   },
]

const MARQUEE_ITEMS = [
  'Cyprus rents here',
  'Limassol finds here',
  'Nicosia lives here',
  'Paphos buys here',
  'Larnaca moves here',
  'Ayia Napa stays here',
]

export default function AboutPage() {
  return (
    <>
      {/* ── Hero split ─────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row" style={{ height: '600px' }}>

        {/* LEFT — text */}
        <div className="flex items-center w-full lg:w-[45%] flex-shrink-0 px-8 sm:px-14 lg:px-20 py-20">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-8"
            >
              We are<br />EstateHub.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-lg text-gray-500 leading-relaxed mb-6"
              style={{ maxWidth: '420px' }}
            >
              We have been transforming real estate in Cyprus for over 4 years.
              With a marketplace that connects buyers, renters and property owners
              across the island — from Limassol to Paphos, Nicosia to Ayia Napa.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="text-lg text-gray-500 leading-relaxed mb-10"
              style={{ maxWidth: '420px' }}
            >
              Our digital platform makes finding, listing and renting property
              simple, transparent and efficient — for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="/search"
                className="inline-block text-white text-sm font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
                style={{ background: '#3d5a80' }}
              >
                Find a property →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* RIGHT — photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex-1 overflow-hidden"
        >
          <img
            src="/about-hero.jpg"
            alt="EstateHub office"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80'
            }}
          />
        </motion.div>

      </section>

      {/* ── Marquee ─────────────────────────────────────────────── */}
      <div className="overflow-hidden border-t border-b border-gray-200 bg-white py-3">
        <div className="flex gap-0 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-8 text-sm font-medium text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: '#3d5a80' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Values ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-20"
        >
          Simple, transparent, trusted.
        </motion.h2>

        {[
          {
            word: 'Simple',
            bg: '#e8845a',
            accent: '#c96a3e',
            text: 'EstateHub makes finding property in Cyprus effortless. Our smart search, interactive map and clear filters help you discover the right home in minutes — not days.',
          },
          {
            word: 'Transparent',
            bg: '#5b7ec5',
            accent: '#4466b0',
            text: 'Every listing on EstateHub shows real prices, real photos and verified owner contacts. No hidden fees, no surprises — just honest information so you can decide with confidence.',
          },
          {
            word: 'Trusted',
            bg: '#4aab8a',
            accent: '#358f72',
            text: 'Thousands of renters, buyers and property owners across Cyprus trust EstateHub every day. We\'re committed to being the most reliable real estate platform on the island.',
          },
        ].map(({ word, bg, accent, text }, i) => (
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col sm:flex-row items-center gap-10 mb-20 last:mb-0"
          >
            {/* Coloured card */}
            <div
              className="w-full sm:w-56 h-56 flex-shrink-0 flex items-end p-5 relative overflow-hidden"
              style={{ background: bg }}
            >
              <div className="absolute top-3 right-3 w-10 h-10 rounded-lg opacity-40" style={{ background: accent }} />
              <div className="absolute top-10 right-7 w-5 h-5 rounded-md opacity-30" style={{ background: accent }} />
              <div className="absolute bottom-8 left-3 w-14 h-4 rounded-md opacity-25" style={{ background: accent }} />
              <span className="text-white text-2xl font-bold relative z-10">{word}</span>
            </div>

            {/* Text */}
            <p className="text-gray-500 text-xl leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-gray-900 mb-2" style={{ color: '#3d5a80' }}>{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
          >
            Making real estate simple for everyone in Cyprus
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 text-lg leading-relaxed"
          >
            Whether you're looking for your first home, upgrading to a villa,
            or listing your investment property — EstateHub gives you the tools,
            transparency and support to make it happen with confidence.
          </motion.p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#3d5a80' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to find your home?</h2>
          <p className="text-white/70 mb-8 text-lg">Browse thousands of properties across Cyprus today.</p>
          <Link
            href="/search"
            className="inline-block bg-white text-sm font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            style={{ color: '#3d5a80' }}
          >
            Start searching →
          </Link>
        </motion.div>
      </section>
    </>
  )
}
