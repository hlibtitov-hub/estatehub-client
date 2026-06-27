'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef, useCallback } from 'react'

// Returns badge label + style if applicable
function getBadge(property) {
  const ageMs = Date.now() - new Date(property.createdAt).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays <= 3) return { label: 'New', cls: 'bg-emerald-500 text-white' }
  if ((property.popularity || 0) >= 20) return { label: 'Popular', cls: 'bg-amber-400 text-white' }
  return null
}

// SVG placeholder when no image
function HouseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

// ─── Aceternity: 3D Card Effect ───────────────────────────────────────────────
function Card3D({ children }) {
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { stiffness: 200, damping: 20 })
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-8deg', '8deg'])
  const glareX  = useTransform(xSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY  = useTransform(ySpring, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top)  / rect.height - 0.5)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        perspective: '800px',
        borderRadius: '1rem',
        position: 'relative',
      }}
    >
      {/* Glare overlay */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 10,
          borderRadius: '1rem', pointerEvents: 'none',
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18) 0%, transparent 60%)`
          ),
        }}
      />
      {children}
    </motion.div>
  )
}

export default function PropertyCard({ property }) {
  const badge = getBadge(property)
  return (
    <Card3D>
      <Link href={`/properties/${property._id}`} aria-label={`View ${property.title} — $${property.price?.toLocaleString()}`}>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}>

          <div className="h-56 bg-gray-100 relative overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" aria-label="No photo available">
                <HouseIcon />
              </div>
            )}
            {badge && (
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full animate-scale-in ${badge.cls}`}>
                {badge.label}
              </span>
            )}
            {property.images?.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                {property.images.length} photos
              </span>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{property.title}</h3>
            <p className="text-xs text-gray-400 mb-3">{property.address?.city}</p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-bold text-base">
                €{property.price?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                {property.rooms} rooms
              </span>
            </div>
          </div>

        </div>
      </Link>
    </Card3D>
  )
}
