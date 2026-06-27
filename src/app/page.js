'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'motion/react'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import PropertyCard from '@/components/PropertyCard'
import Pagination from '@/components/Pagination'
import api from '@/lib/api'

// ─── Aceternity: Typewriter Effect ───────────────────────────────────────────
function TypewriterEffect({ words, className = '' }) {
  const [wordIndex, setWordIndex]   = useState(0)
  const [displayed, setDisplayed]   = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused]     = useState(false)

  useEffect(() => {
    if (isPaused) return
    const word = words[wordIndex]
    const speed = isDeleting ? 45 : 95

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < word.length) {
          setDisplayed(word.slice(0, displayed.length + 1))
        } else {
          setIsPaused(true)
          setTimeout(() => { setIsPaused(false); setIsDeleting(true) }, 1800)
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1))
        } else {
          setIsDeleting(false)
          setWordIndex(i => (i + 1) % words.length)
        }
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, isPaused, wordIndex, words])

  return (
    <span className={className}>
      {displayed}
      <span className="typewriter-cursor ml-0.5 inline-block w-[3px] h-[1em] bg-current align-middle" />
    </span>
  )
}

// ─── Aceternity: Number Ticker ────────────────────────────────────────────────
function NumberTicker({ to, prefix = '', suffix = '', duration = 2000 }) {
  const ref        = useRef(null)
  const inView     = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {prefix}{val >= 1000 ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k' : val}{suffix}
    </span>
  )
}

// ─── Aceternity: Stats Section ────────────────────────────────────────────────
const STATS = [
  { to: 12400, suffix: '+', label: 'Happy buyers',    sublabel: 'Families found their home' },
  { to: 98,    suffix: '%', label: 'Satisfaction',    sublabel: 'Rated 5 stars by clients' },
  { to: 3200,  suffix: '+', label: 'Active listings', sublabel: 'Updated daily' },
  { to: 2,     prefix: '€', suffix: 'B+', label: 'Loans facilitated', sublabel: 'In mortgage value' },
]

function StatsSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 50%, #3d5a80 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="flex flex-col items-center text-center px-4 py-3 relative"
          >
            {/* Divider between items */}
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px"
                style={{ background: 'rgba(255,255,255,0.12)' }} />
            )}
            <p className="text-4xl font-bold text-white tabular-nums tracking-tight">
              <NumberTicker to={s.to} prefix={s.prefix || ''} suffix={s.suffix} />
            </p>
            <p className="text-sm font-semibold mt-1.5" style={{ color: '#93c5fd' }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.sublabel}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Aceternity: Infinite Moving Cards (Testimonials) ────────────────────────
const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell', role: 'First-time buyer', avatar: 'SM',
    color: 'bg-blue-100 text-blue-600',
    text: 'Found my dream apartment in just 3 days. The search filters saved me hours of browsing!',
    rating: 5,
  },
  {
    name: 'James Kowalski', role: 'Property investor', avatar: 'JK',
    color: 'bg-emerald-100 text-emerald-600',
    text: 'Listed 4 properties and got inquiries within hours. Seamless experience from start to finish.',
    rating: 5,
  },
  {
    name: 'Amira Chen', role: 'Renter', avatar: 'AC',
    color: 'bg-violet-100 text-violet-600',
    text: 'No ads, no clutter — just properties. Found a great studio near my office in two days.',
    rating: 5,
  },
  {
    name: 'David Park', role: 'Homeowner', avatar: 'DP',
    color: 'bg-orange-100 text-orange-600',
    text: 'Sold my house 40% faster than with a traditional agency. The platform is simply brilliant.',
    rating: 5,
  },
  {
    name: 'Elena Rossi', role: 'Expat buyer', avatar: 'ER',
    color: 'bg-pink-100 text-pink-600',
    text: 'Moving from Italy was stressful, but EstateHub made finding a home so straightforward.',
    rating: 5,
  },
  {
    name: 'Tom Brennan', role: 'Developer', avatar: 'TB',
    color: 'bg-cyan-100 text-cyan-600',
    text: 'Clean UI, fast filters, great mobile experience. Exactly what a property platform should be.',
    rating: 5,
  },
]

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function InfiniteMovingCards() {
  // Double items so the loop is seamless
  const items = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="bg-gray-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
            style={{ color: '#3d5a80', background: 'rgba(61,90,128,0.08)' }}>
            What people say
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Trusted by renters & owners
          </h2>
        </motion.div>
      </div>

      {/* Aceternity: fade masks on edges */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
          style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
          style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }} />

        {/* Scrolling track */}
        <div className="flex animate-infinite-scroll">
          {items.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[320px] mx-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <Stars count={t.rating} />
              <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-5 line-clamp-3">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-none">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity: Sticky Scroll Reveal "How it works" ─────────────────────────
const HOW_STEPS = [
  {
    n: '01', title: 'Search & discover',
    desc: 'Browse thousands of verified listings across Cyprus. Filter by type, price, area and deal type — all updated daily.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#3b82f6', bg: '#eff6ff',
  },
  {
    n: '02', title: 'Save favourites',
    desc: 'Bookmark properties you love and compare them side by side. Never lose track of a great listing.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    color: '#ec4899', bg: '#fdf2f8',
  },
  {
    n: '03', title: 'Contact the owner',
    desc: 'Message owners or agents directly inside EstateHub — no third-party apps, no hidden fees.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#10b981', bg: '#ecfdf5',
  },
  {
    n: '04', title: 'Move in',
    desc: 'Finalise the deal, sign the documents and get the keys. EstateHub guides you every step of the way.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    color: '#f59e0b', bg: '#fffbeb',
  },
]

function HowItWorksStep({ step, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="flex items-start gap-5"
    >
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: step.bg, color: step.color }}>
        {step.icon}
      </div>
      <div>
        <p className="text-xs font-bold mb-1" style={{ color: step.color }}>{step.n}</p>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  )
}

function HowItWorksSection() {
  const sectionRef  = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const lineHeight  = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%'])

  return (
    <section ref={sectionRef} className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
            style={{ color: '#3d5a80', background: 'rgba(61,90,128,0.08)' }}>
            Simple process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How EstateHub works</h2>
          <p className="text-gray-400 mt-2 text-sm">From search to keys — four easy steps</p>
        </motion.div>

        <div className="flex gap-10 lg:gap-16">
          {/* Left: animated vertical line + dots (Tracing Beam style) */}
          <div className="hidden sm:flex flex-col items-center flex-shrink-0 pt-1">
            <div className="relative w-0.5 flex-1" style={{ background: '#e5e7eb' }}>
              <motion.div className="absolute top-0 left-0 w-full origin-top rounded-full"
                style={{ height: lineHeight, background: 'linear-gradient(to bottom, #3b82f6, #10b981)' }} />
            </div>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-10 flex-1">
            {HOW_STEPS.map((step, i) => (
              <HowItWorksStep key={step.n} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Find your perfect home', 'Verified listings', 'Top properties',
  'Apartments & houses', 'Studios & commercial', 'Best deals near you',
]

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden border-t border-gray-200 bg-white py-3">
      <div className="flex gap-0 animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-medium text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: '#3d5a80' }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="flex justify-between pt-1">
          <div className="h-4 bg-blue-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}

// ─── Hero Slideshow ───────────────────────────────────────────────────────────
const SLIDES = [
  { src: '/hero-1.jpg' }, { src: '/hero-2.jpg' }, { src: '/hero-3.jpg' },
  { src: '/hero-4.jpg' }, { src: '/hero-5.jpg' },
]

function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="w-full h-56 sm:h-72 lg:flex-1 lg:h-full overflow-hidden relative bg-gray-900 flex-shrink-0">
      <AnimatePresence initial={false}>
        <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0">
          <Image src={SLIDES[current].src} alt="" fill className="object-cover object-center"
            sizes="100vw" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{ width: i === current ? '20px' : '6px', height: '6px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.45)' }} />
        ))}
      </div>
    </div>
  )
}

// ─── Aceternity: Background Beams ─────────────────────────────────────────────
const BEAMS = [
  { left: '8%',  height: '55%', duration: '7s',  delay: '0s',   opacity: 0.5 },
  { left: '18%', height: '40%', duration: '9s',  delay: '1.5s', opacity: 0.3 },
  { left: '30%', height: '65%', duration: '6s',  delay: '3s',   opacity: 0.4 },
  { left: '42%', height: '45%', duration: '11s', delay: '0.8s', opacity: 0.25 },
  { left: '55%', height: '70%', duration: '8s',  delay: '2s',   opacity: 0.35 },
  { left: '68%', height: '38%', duration: '10s', delay: '4s',   opacity: 0.3 },
  { left: '78%', height: '58%', duration: '7.5s',delay: '1s',   opacity: 0.45 },
  { left: '88%', height: '42%', duration: '9.5s',delay: '2.5s', opacity: 0.28 },
]

function BackgroundBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {BEAMS.map((b, i) => (
        <div key={i} className="bg-beam"
          style={{
            left: b.left, height: b.height, opacity: b.opacity,
            animationDuration: b.duration, animationDelay: b.delay, top: 0,
          }} />
      ))}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = ['perfect home.', 'dream apartment.', 'ideal studio.', 'best investment.']

function Hero({ search, setSearch, onSearch, type, setType, onScrollToListings }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 32 }, animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: 'easeOut', delay },
  })

  return (
    <section style={{ background: '#f8f7f5' }} ref={heroRef} onMouseMove={handleMouseMove}>
      {/* Aceternity: Spotlight follows mouse */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,90,128,0.10) 0%, transparent 70%)',
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }} />
      </div>

      <div className="flex flex-col-reverse lg:flex-row lg:h-[600px]">
        {/* LEFT */}
        <div className="relative flex items-center w-full lg:w-[50%] flex-shrink-0 overflow-hidden px-8 sm:px-14 lg:px-20 py-10 lg:py-0">
          {/* Aceternity: Background Beams */}
          <BackgroundBeams />
          {/* Blob bg */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl animate-blob"
              style={{ background: '#f2d4cf' }} />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-25 blur-3xl animate-blob animation-delay-2000"
              style={{ background: '#c8d8eb' }} />
          </div>

          <div className="relative w-full">
            <motion.div {...fadeUp(0)}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(61,90,128,0.08)', color: '#3d5a80' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3d5a80' }} />
              New listings every day
            </motion.div>

            {/* Aceternity: Typewriter in heading */}
            <motion.h1 {...fadeUp(0.1)}
              className="text-4xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: '#1a1f2e' }}>
              Find your<br />
              <span style={{ color: '#3d5a80' }}>
                <TypewriterEffect words={TYPEWRITER_WORDS} />
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-base mb-7" style={{ color: '#6b7280', maxWidth: '380px' }}>
              Thousands of apartments, houses and studios — all in one place.
            </motion.p>

            <motion.form {...fadeUp(0.3)} onSubmit={onSearch}
              className="flex items-center bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
              style={{ border: '1px solid rgba(61,90,128,0.14)' }}>
              <span className="pl-4 flex-shrink-0 text-gray-400"><Search size={16} aria-hidden /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="City, address or keyword..." aria-label="Search properties"
                className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent placeholder-gray-400"
                style={{ color: '#1a1f2e' }} />
              <motion.button whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.96 }}
                type="submit" className="text-white text-sm font-semibold px-5 py-3.5 flex-shrink-0"
                style={{ background: '#3d5a80' }}>
                Search
              </motion.button>
            </motion.form>

            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-2">
              {[['', 'All'], ['apartment', 'Apartment'], ['house', 'House'], ['studio', 'Studio'], ['commercial', 'Commercial']].map(([val, label]) => (
                <button key={val} onClick={() => { setType(val); onScrollToListings() }}
                  aria-pressed={type === val}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all"
                  style={type === val
                    ? { background: '#3d5a80', borderColor: '#3d5a80', color: '#fff' }
                    : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  {label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* RIGHT — slideshow */}
        <HeroSlideshow />
      </div>
      <Marquee />
    </section>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({ type, setType, sort, setSort, minPrice, maxPrice, onPriceChange, activeCount, onClear }) {
  const sel = 'h-9 border border-gray-200 rounded-xl px-3 pr-7 text-sm outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors appearance-none'
  const selBg = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[69px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className={sel} style={selBg} aria-label="Property type">
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={`${minPrice}-${maxPrice}`}
          onChange={(e) => { const [mn, mx] = e.target.value.split('-').map(Number); onPriceChange(mn, mx) }}
          className={sel} style={selBg} aria-label="Price range">
          <option value="0-10000">Any Price</option>
          <option value="0-500">Under €500</option>
          <option value="500-1000">€500 – €1,000</option>
          <option value="1000-2000">€1,000 – €2,000</option>
          <option value="2000-5000">€2,000 – €5,000</option>
          <option value="5000-10000">€5,000+</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={sel} style={selBg} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
          <option value="popular">Most popular</option>
        </select>
        {activeCount > 0 && (
          <button onClick={onClear}
            className="h-9 px-3 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl hover:border-red-200 transition-colors flex items-center gap-1.5">
            <X size={13} />
            Clear
            <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
              {activeCount}
            </span>
          </button>
        )}
        <div className="ml-auto">
          <Link href="/search"
            className="h-9 px-4 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Map view
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Aceternity: Card Spotlight wrapper ───────────────────────────────────────
function SpotlightCard({ children }) {
  const cardRef  = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div ref={cardRef} className="relative group rounded-2xl overflow-hidden"
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {/* Spotlight glow */}
      {hovered && (
        <div className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, rgba(59,130,246,0.10), transparent 70%)`,
          }} />
      )}
      {/* Hover border gradient */}
      <div className="absolute inset-0 rounded-2xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ padding: '1px', background: 'linear-gradient(135deg, #3b82f6, #93c5fd, #2563eb)' }}>
        <div className="w-full h-full rounded-2xl bg-white" />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const LIMIT = 9

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [type,       setType]       = useState('')
  const [sort,       setSort]       = useState('newest')
  const [priceKey,   setPriceKey]   = useState('0-10000')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const listingsRef                 = useRef(null)

  const [minPrice, maxPrice] = priceKey.split('-').map(Number)
  const activeCount = [type, priceKey !== '0-10000' ? priceKey : ''].filter(Boolean).length

  useEffect(() => { setPage(1) }, [type, sort, minPrice, maxPrice, search])
  useEffect(() => { fetchProperties() }, [type, sort, minPrice, maxPrice, page])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = { sort, limit: LIMIT, page }
      if (search)        params.search   = search
      if (type)          params.type     = type
      if (minPrice > 0)  params.minPrice = minPrice
      if (maxPrice < 10000) params.maxPrice = maxPrice
      const res = await api.get('/properties', { params })
      setProperties(res.data.properties)
      setTotalPages(res.data.pagination?.pages || 1)
      setTotalCount(res.data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const scrollToListings = () =>
    setTimeout(() => listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProperties(); scrollToListings() }
  const handleClear  = () => { setType(''); setPriceKey('0-10000'); setSort('newest'); setSearch('') }

  return (
    <>
      <Hero search={search} setSearch={setSearch} onSearch={handleSearch}
        type={type} setType={setType} onScrollToListings={scrollToListings} />

      {/* Aceternity: Stats with Number Ticker */}
      <StatsSection />

      {/* Aceternity: How it works — Sticky Scroll Reveal */}
      <HowItWorksSection />

      <FilterBar type={type} setType={setType} sort={sort} setSort={setSort}
        minPrice={minPrice} maxPrice={maxPrice}
        onPriceChange={(mn, mx) => setPriceKey(`${mn}-${mx}`)}
        activeCount={activeCount} onClear={handleClear} />

      <main ref={listingsRef} className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Latest listings</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Searching...' : `${totalCount} properties found`}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No properties found</p>
            <p className="text-sm text-gray-400 mb-4">Try a different search or adjust filters</p>
            <button onClick={handleClear} className="text-sm text-blue-600 hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            {/* Aceternity: SpotlightCard wraps each property card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((property, i) => (
                <SpotlightCard key={property._id}>
                  <PropertyCard property={property} index={i} />
                </SpotlightCard>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </>
        )}
      </main>

      {/* Aceternity: Infinite Moving Cards */}
      <InfiniteMovingCards />
    </>
  )
}
