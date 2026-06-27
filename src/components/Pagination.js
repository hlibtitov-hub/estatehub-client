'use client'

import { motion } from 'motion/react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Build page numbers to show (always show first, last, current ±1, with ... gaps)
  const getPages = () => {
    const pages = []
    const delta = 1
    const left  = page - delta
    const right = page + delta

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i)
      }
    }

    // Insert gaps
    const result = []
    let prev = null
    for (const p of pages) {
      if (prev && p - prev > 1) result.push('...')
      result.push(p)
      prev = p
    }
    return result
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10">
      {/* Prev */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </motion.button>

      {/* Pages */}
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">
            ···
          </span>
        ) : (
          <motion.button
            key={p}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
              p === page
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
            }`}
          >
            {p}
          </motion.button>
        )
      )}

      {/* Next */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </motion.button>
    </nav>
  )
}
