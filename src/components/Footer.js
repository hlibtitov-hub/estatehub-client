'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'

const COLUMNS = [
  {
    heading: 'Properties',
    links: [
      { label: 'Search listings', href: '/search' },
      { label: 'My favorites',    href: '/favorites' },
      { label: 'My listings',     href: '/dashboard' },
    ],
  },
  {
    heading: 'For Owners',
    links: [
      { label: 'List your property', href: '/dashboard' },
      { label: 'Manage listings',    href: '/dashboard' },
      { label: 'Photo guidelines',   href: '/photo-guidelines' },
      { label: 'Pricing tips',       href: '/pricing-tips' },
    ],
  },
  {
    heading: 'Guide & Help',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Safety tips',  href: '/safety-tips' },
      { label: 'FAQ',          href: '/faq' },
      { label: 'Contact us',   href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', href: '/about' },
    ],
  },
]

// ─── Social icons ─────────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

const SOCIALS = [
  { href: 'https://facebook.com',  label: 'Facebook',  Icon: FacebookIcon  },
  { href: 'https://instagram.com', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://linkedin.com',  label: 'LinkedIn',  Icon: LinkedInIcon  },
]

// ─── Shared animation variants ────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#f0ece6' }}>

      {/* ── CTA banner ──────────────────────────────────────────────────────── */}
      <motion.div
        className="border-b border-black/5"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Ready to find your home?
            </h2>
            <p className="text-sm text-gray-500">Browse hundreds of listings in Cyprus — rent or buy.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
              <Link
                href="/search"
                className="text-sm font-medium text-gray-700 border border-gray-300 px-5 py-2.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Browse listings
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
              <Link
                href="/dashboard"
                className="relative flex items-center gap-1.5 overflow-hidden bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent shimmer-sweep" />
                <Plus size={14} strokeWidth={2.5} className="relative z-10" />
                <span className="relative z-10">List property</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── 4-column link grid ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {COLUMNS.map((col, colIdx) => (
            <motion.div
              key={col.heading}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: colIdx * 0.08 }}
            >
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link, linkIdx) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: colIdx * 0.08 + linkIdx * 0.05 + 0.15, duration: 0.3 }}
                  >
                    <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <motion.div
          className="border-t border-black/8 pt-8 flex flex-col items-center gap-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} EstateHub. All rights reserved.
          </p>

          {/* Social icons — centered */}
          <div className="flex items-center justify-center gap-3">
            {SOCIALS.map(({ href, label, Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.15, backgroundColor: '#2563eb' }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center transition-colors"
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Cityscape illustration ───────────────────────────────────────────── */}
      <motion.div
        className="w-full overflow-hidden"
        style={{ backgroundColor: '#f0ece6' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 1440 280" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <defs>
            <linearGradient id="skyFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#f0ece6" stopOpacity="1"/>
              <stop offset="10%"  stopColor="#f0ece6" stopOpacity="0"/>
              <stop offset="90%"  stopColor="#f0ece6" stopOpacity="0"/>
              <stop offset="100%" stopColor="#f0ece6" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="skyWash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#dbeafe" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#f0ece6" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="bFar"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8dff0"/><stop offset="100%" stopColor="#b0ceea"/>
            </linearGradient>
            <linearGradient id="bMid"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#90b8d8"/><stop offset="100%" stopColor="#6898c0"/>
            </linearGradient>
            <linearGradient id="bNear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a7cb8"/><stop offset="100%" stopColor="#2d5c9a"/>
            </linearGradient>
            <linearGradient id="bCtr"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e4a8c"/><stop offset="100%" stopColor="#0f2d60"/>
            </linearGradient>
            <linearGradient id="bCtr2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2356a8"/><stop offset="100%" stopColor="#133070"/>
            </linearGradient>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8ccdc"/><stop offset="100%" stopColor="#c8d8e8" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <rect width="1440" height="280" fill="#f0ece6"/>
          <rect width="1440" height="280" fill="url(#skyWash)"/>
          <rect x="30"  y="218" width="28" height="42" fill="url(#bFar)" rx="1"/>
          <rect x="62"  y="204" width="36" height="56" fill="url(#bFar)" rx="1"/>
          <rect x="62"  y="200" width="36" height="6"  fill="#b0ceea"/>
          <rect x="102" y="212" width="44" height="48" fill="url(#bFar)" rx="1"/>
          <rect x="150" y="220" width="30" height="40" fill="url(#bFar)" rx="1"/>
          <rect x="1382" y="218" width="28" height="42" fill="url(#bFar)" rx="1"/>
          <rect x="1342" y="204" width="36" height="56" fill="url(#bFar)" rx="1"/>
          <rect x="1342" y="200" width="36" height="6"  fill="#b0ceea"/>
          <rect x="1294" y="212" width="44" height="48" fill="url(#bFar)" rx="1"/>
          <rect x="1260" y="220" width="30" height="40" fill="url(#bFar)" rx="1"/>
          <rect x="186" y="162" width="48" height="98" fill="url(#bMid)" rx="2"/>
          <rect x="186" y="155" width="48" height="9"  fill="#78a4c8"/>
          <rect x="238" y="178" width="42" height="82" fill="url(#bMid)" rx="2"/>
          <rect x="238" y="171" width="42" height="9"  fill="#78a4c8"/>
          <rect x="284" y="170" width="52" height="90" fill="url(#bMid)" rx="2"/>
          <rect x="284" y="163" width="52" height="9"  fill="#78a4c8"/>
          <rect x="1206" y="162" width="48" height="98" fill="url(#bMid)" rx="2"/>
          <rect x="1206" y="155" width="48" height="9"  fill="#78a4c8"/>
          <rect x="1160" y="178" width="42" height="82" fill="url(#bMid)" rx="2"/>
          <rect x="1160" y="171" width="42" height="9"  fill="#78a4c8"/>
          <rect x="1104" y="170" width="52" height="90" fill="url(#bMid)" rx="2"/>
          <rect x="1104" y="163" width="52" height="9"  fill="#78a4c8"/>
          <rect x="340" y="152" width="66" height="108" fill="url(#bNear)" rx="2"/>
          <rect x="340" y="143" width="66" height="11"  fill="#3a6aaa"/>
          <rect x="396" y="152" width="10" height="108" fill="#1e4a88" opacity="0.25"/>
          <rect x="410" y="118" width="72" height="142" fill="url(#bNear)" rx="2"/>
          <rect x="410" y="108" width="72" height="13"  fill="#3a6aaa"/>
          <rect x="424" y="82"  width="44" height="40"  fill="url(#bNear)" rx="2"/>
          <rect x="424" y="72"  width="44" height="12"  fill="#3a6aaa"/>
          <rect x="434" y="56"  width="24" height="30"  fill="#3a6aaa" rx="1"/>
          <rect x="444" y="44"  width="4"  height="16"  fill="#2a5090"/>
          <rect x="472" y="118" width="10" height="142" fill="#1e4a88" opacity="0.2"/>
          <rect x="488" y="60"  width="90" height="200" fill="url(#bCtr2)" rx="2"/>
          <rect x="488" y="48"  width="90" height="15"  fill="#1a4490"/>
          <rect x="568" y="60"  width="10" height="200" fill="#0e2e60" opacity="0.3"/>
          <rect x="586" y="8"   width="104" height="252" fill="url(#bCtr)" rx="2"/>
          <rect x="586" y="0"   width="104" height="12"  fill="#0a2050"/>
          <rect x="632" y="0"   width="10"  height="14"  fill="#0a2050" rx="1"/>
          <rect x="635" y="0"   width="4"   height="8"   fill="#1a3a80"/>
          <rect x="676" y="8"   width="14"  height="252" fill="#081c48" opacity="0.35"/>
          <rect x="698" y="60"  width="90" height="200" fill="url(#bCtr2)" rx="2"/>
          <rect x="698" y="48"  width="90" height="15"  fill="#1a4490"/>
          <rect x="698" y="60"  width="10"  height="200" fill="#0e2e60" opacity="0.2"/>
          <rect x="794" y="118" width="72" height="142" fill="url(#bNear)" rx="2"/>
          <rect x="794" y="108" width="72" height="13"  fill="#3a6aaa"/>
          <rect x="808" y="82"  width="44" height="40"  fill="url(#bNear)" rx="2"/>
          <rect x="808" y="72"  width="44" height="12"  fill="#3a6aaa"/>
          <rect x="818" y="56"  width="24" height="30"  fill="#3a6aaa" rx="1"/>
          <rect x="828" y="44"  width="4"  height="16"  fill="#2a5090"/>
          <rect x="794" y="118" width="10" height="142" fill="#1e4a88" opacity="0.2"/>
          <rect x="870" y="152" width="66" height="108" fill="url(#bNear)" rx="2"/>
          <rect x="870" y="143" width="66" height="11"  fill="#3a6aaa"/>
          <rect x="870" y="152" width="10" height="108" fill="#1e4a88" opacity="0.25"/>
          <rect x="888" y="226" width="30" height="34"  fill="#2a5898" rx="1"/>
          <rect x="895" y="228" width="10" height="20"  fill="#4a84c0"/>
          <rect x="0" y="260" width="1440" height="20" fill="url(#ground)" opacity="0.5"/>
          <rect x="0" y="260" width="1440" height="2"  fill="#a8c0d4" opacity="0.6"/>
          <rect width="1440" height="280" fill="url(#skyFade)"/>
        </svg>
      </motion.div>
    </footer>
  )
}
