'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#f8f7f5' }}>

      {/* Animated house */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="relative w-32 h-32 mx-auto">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full blur-2xl opacity-20"
            style={{ background: '#3d5a80' }} />
          <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(61,90,128,0.08)' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="#3d5a80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
              {/* Question mark inside */}
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: '#3d5a80' }}>404 — Page not found</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Looks like this<br />address doesn't exist
        </h1>
        <p className="text-gray-400 text-base mb-8 max-w-sm mx-auto">
          The page you're looking for may have been moved, deleted, or never existed.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <Link href="/"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#3d5a80' }}>
          Go to homepage
        </Link>
        <Link href="/search"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
          Browse properties
        </Link>
      </motion.div>

      {/* Decorative dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full opacity-20" style={{ background: '#3d5a80' }} />
        <div className="absolute top-2/3 right-1/5 w-3 h-3 rounded-full opacity-15" style={{ background: '#3d5a80' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full opacity-25" style={{ background: '#3d5a80' }} />
      </div>
    </main>
  )
}
