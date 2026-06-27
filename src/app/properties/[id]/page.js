'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import api from '@/lib/api'
import {
  MapPin, Bed, Bath, Maximize2, Car, Wind, Package,
  PawPrint, Heart, ChevronLeft, ChevronRight,
  Eye, Calendar, Home, Expand, Phone, MessageCircle,
  ArrowLeft, CheckCircle2, X, ZoomIn, LayoutGrid, Share2, Copy, Check,
} from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ─── Property Map (Leaflet) ───────────────────────────────────────────────────
const CITY_COORDS = {
  limassol: [34.6851, 33.0329], nicosia: [35.1856, 33.3823],
  larnaca:  [34.9229, 33.6233], paphos:  [34.7754, 32.4242],
  'ayia napa': [34.9841, 33.9999], protaras: [35.0135, 34.0569],
}

function PropertyMap({ property }) {
  const mapRef    = useRef(null)
  const mapObjRef = useRef(null)

  const city = (property.address?.city || '').toLowerCase()
  const coords = CITY_COORDS[city] || [34.6851, 33.0329]
  const lat = property.lat || coords[0]
  const lng = property.lng || coords[1]

  useEffect(() => {
    if (typeof window === 'undefined' || mapObjRef.current) return

    const loadLeaflet = () => new Promise(resolve => {
      if (window.L) { resolve(window.L); return }
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'; link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => resolve(window.L)
      document.head.appendChild(script)
    })

    loadLeaflet().then(L => {
      if (!mapRef.current || mapObjRef.current) return
      const map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, zoomControl: true })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19,
      }).addTo(map)

      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#2563eb;color:#fff;font-size:12px;font-weight:700;padding:5px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 10px rgba(37,99,235,0.4);border:2px solid #fff;transform:translateX(-50%) translateY(-100%)">€${Number(property.price||0).toLocaleString()}</div>`,
        iconSize: [0,0], iconAnchor: [0,0],
      })

      L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<b>${property.title}</b><br>${property.address?.city || ''}`)
        .openPopup()

      mapObjRef.current = map
    })

    return () => { if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null } }
  }, [lat, lng])

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div ref={mapRef} style={{ height: '360px', width: '100%', background: '#e8eef2' }} />
      <div className="px-5 py-4 flex items-center gap-2 text-sm text-gray-500">
        <MapPin size={14} className="text-blue-500 flex-shrink-0" />
        {[property.address?.street, property.address?.city].filter(Boolean).join(', ') || 'Cyprus'}
        <span className="text-xs text-gray-300 ml-1">(approximate location)</span>
      </div>
    </div>
  )
}

// ─── Aceternity: Parallax Image Container ────────────────────────────────────
function ParallaxImageContainer({ children, onClick, className }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} className={className} onClick={onClick}>
      <motion.div style={{ y, scale: 1.18 }} className="absolute inset-0 w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current,  setCurrent]  = useState(startIndex)
  const [zoomed,   setZoomed]   = useState(false)
  const [pan,      setPan]      = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const touchStart = useRef(null)
  const dragOrigin = useRef(null)
  const hasDragged = useRef(false)

  const resetZoom = () => { setZoomed(false); setPan({ x: 0, y: 0 }) }
  const prev = useCallback(() => { setCurrent(i => (i - 1 + images.length) % images.length); resetZoom() }, [images.length])
  const next = useCallback(() => { setCurrent(i => (i + 1) % images.length); resetZoom() }, [images.length])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     { zoomed ? resetZoom() : onClose() }
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose, zoomed])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const onMouseDown = (e) => {
    if (!zoomed) return
    e.preventDefault()
    hasDragged.current = false
    setDragging(true)
    dragOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }
  const onMouseMove = (e) => {
    if (!dragging) return
    hasDragged.current = true
    setPan({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y })
  }
  const onMouseUp = () => setDragging(false)

  const onImgClick = () => {
    if (hasDragged.current) return
    if (zoomed) resetZoom()
    else setZoomed(true)
  }

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
    if (zoomed) dragOrigin.current = { x: t.clientX - pan.x, y: t.clientY - pan.y }
    hasDragged.current = false
  }
  const onTouchMove = (e) => {
    if (!zoomed) return
    e.preventDefault()
    hasDragged.current = true
    const t = e.touches[0]
    setPan({ x: t.clientX - dragOrigin.current.x, y: t.clientY - dragOrigin.current.y })
  }
  const onTouchEnd = (e) => {
    if (zoomed) return
    if (!touchStart.current) return
    const dx = touchStart.current.x - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) dx > 0 ? next() : prev()
    touchStart.current = null
  }

  const imgStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 2 : 1})`,
    transition: dragging ? 'none' : 'transform 0.25s ease',
    cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
    maxHeight: '100%',
    maxWidth: zoomed ? 'none' : '100%',
    objectFit: 'contain',
    borderRadius: '0.5rem',
    userSelect: 'none',
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-white/10">
        <span className="text-white/60 text-sm font-medium">{current + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoomed ? resetZoom() : setZoomed(true)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm px-3 py-1.5 rounded-full border border-white/20 hover:border-white/50 transition-all"
          >
            {zoomed ? <><ZoomIn size={14}/> Zoom out</> : <><ZoomIn size={14}/> Zoom in</>}
          </button>
          <button
            onClick={onClose}
            aria-label="Close gallery"
            className="text-white/70 hover:text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all ml-1"
          >
            <X size={18}/>
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 1 && !zoomed && (
          <button onClick={prev} aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform text-gray-800">
            <ChevronLeft size={20}/>
          </button>
        )}
        <img src={images[current]} alt={`Photo ${current + 1}`} style={imgStyle}
          onClick={onImgClick} onMouseDown={onMouseDown} draggable={false}/>
        {images.length > 1 && !zoomed && (
          <button onClick={next} aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform text-gray-800">
            <ChevronRight size={20}/>
          </button>
        )}
        {zoomed && (
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none">
            Drag to pan · click or ESC to zoom out
          </span>
        )}
      </div>

      {images.length > 1 && !zoomed && (
        <div className="flex-shrink-0 py-4 px-4 overflow-x-auto border-t border-white/10">
          <div className="flex gap-2 justify-center">
            {images.map((img, i) => (
              <div key={i} onClick={() => { setCurrent(i); resetZoom() }}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  i === current ? 'border-white scale-105' : 'border-transparent opacity-40 hover:opacity-70'
                }`}>
                <img src={img} alt="" className="w-full h-full object-cover" draggable={false}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Feature Chip ──────────────────────────────────────────────────────────────
function FeatureChip({ icon: Icon, label, value, available = true }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
      available ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-50'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        available ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
      }`}>
        <Icon size={17}/>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PropertyPage() {
  const { id }   = useParams()
  const { user } = useAuth()
  const router   = useRouter()
  const toast    = useToast()

  const [property,      setProperty]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [message,       setMessage]       = useState('')
  const [sent,          setSent]          = useState(false)
  const [isFavorite,    setIsFavorite]    = useState(false)
  const [copied,        setCopied]        = useState(false)
  const [activeImage,   setActiveImage]   = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [direction,     setDirection]     = useState(1)  // 1 = forward, -1 = backward
  const [similar,       setSimilar]       = useState([])
  const [showMore,      setShowMore]      = useState(false)

  useEffect(() => {
    fetchProperty()
    fetchSimilar()
    if (user) checkFavorite()
    window.scrollTo(0, 0)
  }, [id, user])

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`)
      setProperty(res.data)
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilar = async () => {
    try {
      const res = await api.get('/properties?limit=4')
      setSimilar((res.data.properties || res.data || []).filter(p => p._id !== id).slice(0, 3))
    } catch {}
  }

  const checkFavorite = async () => {
    try {
      const res = await api.get('/favorites')
      setIsFavorite(res.data.map(p => p._id).includes(id))
    } catch {}
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: property.title, text: property.description?.slice(0, 100), url }) }
      catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleFavorite = async () => {
    if (!user) { toast('Sign in to save listings', 'info'); return router.push('/login') }
    try {
      await api.post(`/favorites/${id}`)
      const next = !isFavorite
      setIsFavorite(next)
      toast(next ? 'Added to favorites' : 'Removed from favorites', next ? 'success' : 'info')
    } catch {
      toast('Something went wrong', 'error')
    }
  }

  const handleContact = async (e) => {
    e.preventDefault()
    if (!user) { toast('Sign in to send messages', 'info'); return router.push('/login') }
    try {
      await api.post(`/contact/${id}`, { message })
      setSent(true)
      setMessage('')
      toast('Message sent!', 'success')
    } catch {
      toast('Failed to send message', 'error')
    }
  }

  const goImage = (idx) => {
    setDirection(idx > activeImage ? 1 : -1)
    setActiveImage(idx)
  }

  const prevImage = () => {
    const images = property?.images || []
    setDirection(-1)
    setActiveImage(i => (i - 1 + images.length) % images.length)
  }

  const nextImage = () => {
    const images = property?.images || []
    setDirection(1)
    setActiveImage(i => (i + 1) % images.length)
  }

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) return (
    <main className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-4 w-32 bg-gray-100 rounded-full mb-8"/>
      <div className="h-7 bg-gray-100 rounded-full w-2/3 mb-3"/>
      <div className="h-4 bg-gray-100 rounded-full w-1/3 mb-8"/>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <div className="h-[460px] bg-gray-100 rounded-3xl mb-4"/>
          <div className="flex gap-2 mb-8">
            {[...Array(4)].map((_,i) => <div key={i} className="w-20 h-14 bg-gray-100 rounded-xl"/>)}
          </div>
          <div className="h-48 bg-gray-100 rounded-2xl mb-4"/>
          <div className="h-48 bg-gray-100 rounded-2xl"/>
        </div>
        <div className="h-80 bg-gray-100 rounded-3xl"/>
      </div>
    </main>
  )
  if (!property) return null

  const images = property.images || []
  const descShort = property.description?.length > 300
  const displayDesc = showMore || !descShort
    ? property.description
    : property.description?.slice(0, 300) + '…'

  const listedDate = property.createdAt
    ? new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const features = [
    { icon: Bed,       label: 'Bedrooms',       value: property.rooms ? `${property.rooms} rooms` : null },
    { icon: Bath,      label: 'Bathrooms',      value: property.bathrooms ? `${property.bathrooms}` : null },
    { icon: Maximize2, label: 'Area',           value: property.area ? `${property.area} m²` : null },
    { icon: Car,       label: 'Parking',        value: property.parking ? 'Available' : null, available: !!property.parking },
    { icon: Wind,      label: 'Air Conditioning', value: property.ac ? 'Yes' : null,         available: !!property.ac },
    { icon: Package,   label: 'Furnished',      value: property.furnished ? 'Yes' : null,    available: !!property.furnished },
    { icon: LayoutGrid,label: 'Balcony',        value: property.balcony ? 'Yes' : null,      available: !!property.balcony },
    { icon: PawPrint,  label: 'Pets Allowed',   value: property.pets ? 'Yes' : null,         available: !!property.pets },
  ]

  const visibleFeatures = features.filter(f => f.value !== null)

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)}/>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Listings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[260px] truncate">{property.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Property Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin size={14} className="text-blue-500 flex-shrink-0"/>
                <span>{[property.address?.street, property.address?.city].filter(Boolean).join(', ')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-full border-2 border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex-shrink-0 font-medium"
                  >
                    {copied ? <Check size={15} className="text-green-500"/> : <Share2 size={15}/>}
                    {copied ? 'Copied!' : 'Share'}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Copy link to clipboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-full border-2 transition-all flex-shrink-0 font-medium ${
                      isFavorite
                        ? 'border-red-400 bg-red-50 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50'
                    }`}
                  >
                    <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'}/>
                    {isFavorite ? 'Saved' : 'Save'}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              <Home size={11}/>{property.type}
            </span>
            {property.rooms && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <Bed size={11}/>{property.rooms} rooms
              </span>
            )}
            {property.area && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <Maximize2 size={11}/>{property.area} m²
              </span>
            )}
            {property.popularity > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full">
                <Eye size={11}/>{property.popularity} views
              </span>
            )}
            {listedDate && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full">
                <Calendar size={11}/>Listed {listedDate}
              </span>
            )}
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* ── LEFT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            {/* Gallery */}
            <div className="relative">
              {/* Main image — Aceternity Parallax */}
              <ParallaxImageContainer
                className="relative h-[320px] sm:h-[420px] lg:h-[480px] bg-gray-100 rounded-3xl overflow-hidden cursor-zoom-in shadow-sm mb-3 group"
                onClick={() => images.length > 0 && setLightboxIndex(activeImage)}
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={property.title}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Fullscreen hint */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Expand size={12}/> Fullscreen
                  </div>
                </div>

                {/* Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/55 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium pointer-events-none">
                    {activeImage + 1} / {images.length}
                  </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage() }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-800 opacity-0 group-hover:opacity-100"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={18}/>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage() }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-800 opacity-0 group-hover:opacity-100"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={18}/>
                    </button>
                  </>
                )}

                {/* No image fallback */}
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home size={48} className="text-gray-300"/>
                  </div>
                )}
              </ParallaxImageContainer>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => goImage(i)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex-shrink-0 w-20 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === i
                          ? 'border-blue-600 shadow-md shadow-blue-100'
                          : 'border-transparent opacity-55 hover:opacity-90'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Tabs: Description / Details / Map / Similar ── */}
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="w-full h-11 mb-6">
                <TabsTrigger value="overview" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="details"  className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="map"      className="flex-1">Map</TabsTrigger>
                <TabsTrigger value="similar"  className="flex-1">Similar</TabsTrigger>
              </TabsList>

              {/* ── Overview tab ── */}
              <TabsContent value="overview">
                {property.description ? (
                  <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
                    <p className="text-gray-600 text-sm leading-7">{displayDesc}</p>
                    {descShort && (
                      <button
                        onClick={() => setShowMore(v => !v)}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {showMore ? 'Show less ↑' : 'Show more ↓'}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No description provided.</p>
                )}
              </TabsContent>

              {/* ── Details tab ── */}
              <TabsContent value="details" className="space-y-5">
                <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Rent</h2>
                  <table className="w-full mt-4">
                    <tbody>
                      {[
                        { label: 'Monthly rent', value: property.price ? `$${property.price.toLocaleString()} / month` : null },
                        { label: 'Yearly rent',  value: property.price ? `$${(property.price * 12).toLocaleString()} / year` : null },
                      ].filter(r => r.value).map((row, i, arr) => (
                        <tr key={row.label} className={i < arr.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="py-3.5 text-sm text-gray-500 w-1/2">{row.label}</td>
                          <td className="py-3.5 text-sm font-semibold text-gray-900">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Details</h2>
                  <table className="w-full mt-4">
                    <tbody>
                      {[
                        { label: 'Property type',    value: property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : null },
                        { label: 'Number of rooms',  value: property.rooms ? `${property.rooms} rooms` : null },
                        { label: 'Living space',     value: property.area ? `${property.area} m²` : null },
                        { label: 'Floor',            value: property.floor ? `${property.floor}${property.floor === 1 ? 'st' : property.floor === 2 ? 'nd' : property.floor === 3 ? 'rd' : 'th'} floor` : null },
                        { label: 'Furnished',        value: property.furnished === true ? 'Yes' : property.furnished === false ? 'No' : null },
                        { label: 'Air conditioning', value: property.ac === true ? 'Yes' : property.ac === false ? 'No' : null },
                        { label: 'Parking',          value: property.parking === true ? 'Available' : property.parking === false ? 'Not available' : null },
                        { label: 'Balcony',          value: property.balcony === true ? 'Yes' : property.balcony === false ? 'No' : null },
                        { label: 'Pets allowed',     value: property.pets === true ? 'Yes' : property.pets === false ? 'No' : null },
                        { label: 'Available from',   value: property.availableFrom ? new Date(property.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'By agreement' },
                        { label: 'Listed on',        value: listedDate || null },
                      ].filter(r => r.value).map((row, i, arr) => (
                        <tr key={row.label} className={i < arr.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="py-3.5 text-sm text-gray-500 w-1/2 pr-4">{row.label}</td>
                          <td className="py-3.5 text-sm font-semibold text-gray-900">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* ── Map tab ── */}
              <TabsContent value="map">
                <PropertyMap property={property} />
              </TabsContent>

              {/* ── Similar tab ── */}
              <TabsContent value="similar">
                {similar.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {similar.map(p => <PropertyCard key={p._id} property={p}/>)}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No similar properties found.</p>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ── SIDEBAR ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="lg:sticky lg:top-8"
          >
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">

              {/* Price block */}
              <div className="px-7 pt-7 pb-6 border-b border-gray-50">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-blue-600 tracking-tight">
                    ${property.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">/month</span>
                </div>
                <p className="text-xs text-gray-400">
                  ≈ ${property.price ? Math.round(property.price * 12).toLocaleString() : '—'} / year
                </p>
              </div>

              {/* Owner block */}
              <div className="px-7 py-5 border-b border-gray-50">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">Listed by</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={property.owner?.avatar} alt={property.owner?.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-sm">
                      {property.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/users/${property.owner?._id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                      {property.owner?.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-green-500"/>
                      <span className="text-xs text-gray-400">Verified owner</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="px-7 py-6 flex flex-col gap-3">
                {user && property.owner && String(property.owner._id) !== String(user._id) ? (
                  <motion.a
                    href={`/messages?to=${property.owner._id}&property=${property._id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
                  >
                    <MessageCircle size={16}/>
                    Message the owner
                  </motion.a>
                ) : !user ? (
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <MessageCircle size={16}/>
                    Sign in to message
                  </Link>
                ) : null}

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-3 rounded-2xl text-sm font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Phone size={15}/>
                  Request a call
                </button>
              </div>
            </div>

            {/* Safety note */}
            <p className="text-xs text-gray-400 text-center mt-4 px-2 leading-relaxed">
              🔒 Your data is protected. Never wire money before visiting the property in person.
            </p>
          </motion.div>
        </div>
      </main>
    </>
  )
}
