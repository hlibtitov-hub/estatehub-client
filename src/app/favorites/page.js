'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import api from '@/lib/api'

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : '#9ca3af'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function FavCard({ property, onRemove }) {
  const img = property.images?.[0]
  const price = `€${Number(property.price || 0).toLocaleString()}`
  const dealLabel = property.dealType === 'rent' ? '/mo' : ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <Link href={`/properties/${property._id}`} className="block">
        <div className="h-52 bg-gray-100 relative overflow-hidden">
          {img ? (
            <Image src={img} alt={property.title} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
            <p className="text-white font-bold text-base leading-none">
              {price}<span className="text-xs font-normal opacity-80">{dealLabel}</span>
            </p>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm truncate mb-0.5">{property.title}</h3>
          <p className="text-xs text-gray-400 truncate">
            {[property.address?.street, property.address?.city].filter(Boolean).join(', ')}
          </p>
          {(property.rooms || property.area) && (
            <div className="flex gap-3 mt-2">
              {property.rooms && <span className="text-xs text-gray-500">{property.rooms} bed</span>}
              {property.area  && <span className="text-xs text-gray-500">{property.area} m²</span>}
            </div>
          )}
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={() => onRemove(property._id)}
        aria-label="Remove from favourites"
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
        style={{ position: 'absolute' }}
      >
        <HeartIcon filled />
      </button>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [favorites, setFavorites] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (user === null) { router.push('/login'); return }
    if (user) fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorites(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await api.post(`/favorites/${id}`)
      setFavorites(prev => prev.filter(p => p._id !== id))
    } catch (err) { console.error(err) }
  }

  if (!user) return null

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved properties</h1>
        <p className="text-sm text-gray-400">
          {loading ? 'Loading…' : favorites.length === 0 ? 'No saved properties yet' : `${favorites.length} saved`}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <HeartIcon filled />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No saved properties</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Click the heart icon on any property to save it here for later.
          </p>
          <Link href="/search"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Browse properties
          </Link>
        </motion.div>
      ) : (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {favorites.map(property => (
              <FavCard key={property._id} property={property} onRemove={handleRemove} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  )
}
