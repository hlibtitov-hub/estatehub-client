'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, SlidersHorizontal, Check, MapPin, ChevronDown, Euro } from 'lucide-react'
import Pagination from '@/components/Pagination'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const CYPRUS_CITIES = [
  { name: 'Limassol',  lat: 34.6851, lng: 33.0329 },
  { name: 'Nicosia',   lat: 35.1856, lng: 33.3823 },
  { name: 'Larnaca',   lat: 34.9229, lng: 33.6233 },
  { name: 'Paphos',    lat: 34.7754, lng: 32.4242 },
  { name: 'Ayia Napa', lat: 34.9841, lng: 33.9999 },
  { name: 'Protaras',  lat: 35.0135, lng: 34.0569 },
]

const PRICE_OPTIONS = [
  { label: 'Any Price',       value: '0-10000'    },
  { label: 'Under €500',      value: '0-500'      },
  { label: '€500 – €1,000',   value: '500-1000'   },
  { label: '€1,000 – €2,000', value: '1000-2000'  },
  { label: '€2,000 – €5,000', value: '2000-5000'  },
  { label: '€5,000+',         value: '5000-10000' },
]

const LIMASSOL_CENTER = { lat: 34.6851, lng: 33.0329 }
const LIMASSOL_ZOOM   = 13

// ─── Leaflet Map ──────────────────────────────────────────────────────────────
function CyprusMap({ properties, selectedCity, onMarkerClick }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const mapObjRef  = useRef(null)

  // Load Leaflet from CDN once
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return }

        // CSS
        if (!document.querySelector('#leaflet-css')) {
          const link = document.createElement('link')
          link.id    = 'leaflet-css'
          link.rel   = 'stylesheet'
          link.href  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // JS
        const script = document.createElement('script')
        script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => resolve(window.L)
        document.head.appendChild(script)
      })
    }

    loadLeaflet().then((L) => {
      leafletRef.current = L

      if (mapObjRef.current || !mapRef.current) return

      const map = L.map(mapRef.current, {
        center:      [LIMASSOL_CENTER.lat, LIMASSOL_CENTER.lng],
        zoom:        LIMASSOL_ZOOM,
        zoomControl: true,
      })

      // CartoDB Voyager — English labels, clean design
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapObjRef.current = map
    })

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove()
        mapObjRef.current = null
      }
    }
  }, [])

  // Fly to selected city
  useEffect(() => {
    if (!mapObjRef.current || !selectedCity) return
    const city = CYPRUS_CITIES.find(c => c.name === selectedCity)
    if (city) {
      mapObjRef.current.flyTo([city.lat, city.lng], 13, { duration: 1.2 })
    }
  }, [selectedCity])

  // Render property markers
  useEffect(() => {
    const L   = leafletRef.current
    const map = mapObjRef.current
    if (!L || !map) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        background:#2563eb;color:#fff;font-size:11px;font-weight:700;
        padding:4px 8px;border-radius:20px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(37,99,235,0.35);
        border:2px solid #fff;
        transform:translateX(-50%) translateY(-100%);
        position:relative;
      ">€</div>`,
      iconSize:   [0, 0],
      iconAnchor: [0, 0],
    })

    properties.slice(0, 50).forEach((p) => {
      // Use real coordinates from DB, fallback to city center
      let lat = p.lat
      let lng = p.lng

      if (!lat || !lng) {
        const cityName = p.address?.city || ''
        const city = CYPRUS_CITIES.find(c =>
          cityName.toLowerCase().includes(c.name.toLowerCase())
        ) || CYPRUS_CITIES[0]
        const jitter = () => (Math.random() - 0.5) * 0.03
        lat = city.lat + jitter()
        lng = city.lng + jitter()
      }

      const priceLabel = p.price
        ? `<div style="background:#2563eb;color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(37,99,235,0.35);border:2px solid #fff;transform:translateX(-50%) translateY(-100%);position:relative;">€${Number(p.price).toLocaleString()}</div>`
        : `<div style="background:#2563eb;color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(37,99,235,0.35);border:2px solid #fff;transform:translateX(-50%) translateY(-100%);position:relative;">•</div>`

      const markerIcon = L.divIcon({ className: '', html: priceLabel, iconSize: [0, 0], iconAnchor: [0, 0] })

      const img = p.images?.[0] || ''
      const address = [p.address?.street, p.address?.city].filter(Boolean).join(', ') || 'Cyprus'
      const price = `€${Number(p.price || 0).toLocaleString()}`

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <a href="/properties/${p._id}" style="display:block;font-family:system-ui,sans-serif;width:200px;text-decoration:none;color:inherit;cursor:pointer;">
            ${img ? `<img src="${img}" alt="${p.title || ''}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block;margin:-14px -14px 10px -14px;width:calc(100% + 28px);" />` : ''}
            <p style="font-weight:600;font-size:13px;margin:0 0 3px;color:#111">${p.title || 'Property'}</p>
            <p style="font-size:11px;color:#9ca3af;margin:0 0 6px">${address}</p>
            <p style="font-weight:700;color:#2563eb;font-size:15px;margin:0">${price}</p>
          </a>
        `, { maxWidth: 220, className: 'property-popup' })

      marker.on('click', () => onMarkerClick && onMarkerClick(p._id))
      markersRef.current.push(marker)
    })
  }, [properties])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#e8eef2' }}>
      {/* loading placeholder */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none select-none">
        Loading map…
      </div>
    </div>
  )
}

// ─── Property Grid Card ───────────────────────────────────────────────────────
function ListCard({ property, highlighted, favIds, onFavToggle }) {
  const img = property.images?.[0]
    || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=75'

  const statusLabel = property.dealType === 'rent' ? 'For Rent' : 'For Sale'
  const isFav = favIds?.includes(property._id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`rounded-2xl border overflow-hidden transition-all relative ${
        highlighted
          ? 'border-blue-400 shadow-md'
          : 'border-gray-100 bg-white hover:shadow-md hover:border-gray-200'
      }`}
    >
    {/* Favourite button */}
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavToggle(property._id) }}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill={isFav ? '#ef4444' : 'none'}
        stroke={isFav ? '#ef4444' : '#6b7280'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>

    <Link href={`/properties/${property._id}`} className="block">
      {/* Photo */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img
          src={img}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Price badge */}
        <div className="absolute bottom-0 left-0 right-0 p-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-white/80 font-medium leading-none mb-0.5">{statusLabel}</p>
              <p className="text-white font-bold text-base leading-none">
                €{Number(property.price || 0).toLocaleString()}
                {property.dealType === 'rent' && <span className="text-xs font-normal opacity-80"> /mo</span>}
              </p>
            </div>
            {property.type && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full capitalize">
                {property.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <p className="text-sm font-semibold text-gray-900 truncate">{property.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {[property.address?.street, property.address?.city].filter(Boolean).join(', ')}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {property.rooms && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              {property.rooms} bed
            </span>
          )}
          {property.area && (
            <span className="text-xs text-gray-500">{property.area} m²</span>
          )}
        </div>
      </div>
    </Link>
    </motion.div>
  )
}

// ─── Search Page ──────────────────────────────────────────────────────────────
export default function SearchPage() {
  const { user } = useAuth()
  const urlParams = useSearchParams()
  const router = useRouter()
  const [properties,    setProperties]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [selectedCity,  setSelectedCity]  = useState('')
  const [propertyType,  setPropertyType]  = useState('')
  const [priceRange,    setPriceRange]    = useState([0, 5000])
  const [bedrooms,      setBedrooms]      = useState('')
  const [listingStatus, setListingStatus] = useState(() => {
    // will be set by useEffect from URL
    return 'all'
  })
  const [sort,          setSort]          = useState('newest')
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [totalCount,    setTotalCount]    = useState(0)
  const [highlighted,   setHighlighted]   = useState(null)
  const [favIds,        setFavIds]        = useState([])
  const [sheetOpen,       setSheetOpen]       = useState(false)
  const [cityOpen,        setCityOpen]        = useState(false)
  const [mobileCityOpen,  setMobileCityOpen]  = useState(false)
  const listRef = useRef(null)

  // Sync status filter from URL (?status=rent / ?status=sale)
  useEffect(() => {
    const s = urlParams.get('status')
    if (s === 'rent' || s === 'sale') setListingStatus(s)
    else setListingStatus('all')
  }, [urlParams])

  const handleListingStatus = (v) => {
    setListingStatus(v)
    if (v === 'all') router.replace('/search', { scroll: false })
    else router.replace(`/search?status=${v}`, { scroll: false })
  }

  // Load user favourites
  useEffect(() => {
    if (!user) return
    api.get('/favorites').then(res => {
      setFavIds(res.data.map(p => p._id))
    }).catch(() => {})
  }, [user])

  const handleFavToggle = async (id) => {
    if (!user) return
    try {
      const res = await api.post(`/favorites/${id}`)
      setFavIds(res.data.favorites)
    } catch (err) {
      console.error(err)
    }
  }

  const activeCount = [
    propertyType,
    (priceRange[0] > 0 || priceRange[1] < 5000) ? 'price' : '',
    bedrooms,
    listingStatus !== 'all' ? listingStatus : '',
  ].filter(Boolean).length

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, selectedCity, propertyType, listingStatus, priceRange, bedrooms, sort])

  useEffect(() => {
    let cancelled = false
    const doFetch = async () => {
      setLoading(true)
      try {
        const params = { sort, limit: 12, page }
        if (search)                  params.search = search
        if (selectedCity)            params.city = selectedCity
        if (propertyType)            params.type = propertyType
        if (listingStatus !== 'all') params.dealType = listingStatus
        if (priceRange[0] > 0)       params.minPrice = priceRange[0]
        if (priceRange[1] < 5000)    params.maxPrice = priceRange[1]
        if (bedrooms)                params.rooms = bedrooms
        const res = await api.get('/properties', { params })
        if (!cancelled) {
          setProperties(res.data.properties || [])
          setTotalPages(res.data.pagination?.pages || 1)
          setTotalCount(res.data.pagination?.total || 0)
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setProperties([]) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    doFetch()
    return () => { cancelled = true }
  }, [search, selectedCity, propertyType, listingStatus, priceRange, bedrooms, sort, page])

  const handleSearch = (e) => {
    e.preventDefault()
    // search state already triggers the effect above
  }

  const handleCitySelect = (city) => {
    const next = selectedCity === city ? '' : city
    setSelectedCity(next)
    setSearch(next)
  }

  const handleClearAll = () => {
    setSearch('')
    setSelectedCity('')
    setPropertyType('')
    setPriceRange([0, 5000])
    setBedrooms('')
    setSort('newest')
    router.replace('/search', { scroll: false })
  }

  const priceLabel = priceRange[0] === 0 && priceRange[1] >= 5000
    ? 'Any price'
    : `€${priceRange[0].toLocaleString()} – ${priceRange[1] >= 5000 ? '5k+' : '€' + priceRange[1].toLocaleString()}`
  const priceActive = priceRange[0] > 0 || priceRange[1] < 5000

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Filter panel ─────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 flex-shrink-0"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="px-4 sm:px-6 py-3 flex flex-col gap-2">

          {/* ── Row 1: Search ── */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city, street or district in Cyprus…"
                className="w-full h-10 pl-9 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 text-gray-800"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <button type="submit"
              className="h-10 px-5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0 flex items-center gap-1.5">
              <Search size={14} />
              Search
            </button>
          </form>

          {/* ── Row 2: Filters (desktop) ── */}
          <div className="hidden md:flex items-center gap-1.5">

            {/* Deal type toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
              {[{ v: 'all', l: 'All' }, { v: 'rent', l: 'Rent' }, { v: 'sale', l: 'Buy' }].map(({ v, l }) => (
                <button key={v} onClick={() => handleListingStatus(v)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    listingStatus === v
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />

            {/* City */}
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <button className={`h-8 px-3 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                  selectedCity
                    ? 'border-blue-400 text-blue-600 bg-blue-50'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}>
                  <MapPin size={11} className={selectedCity ? 'text-blue-500' : 'text-gray-400'} />
                  {selectedCity || 'Any city'}
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search city…" className="h-8 text-sm" />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => { setSelectedCity(''); setSearch(''); setCityOpen(false) }}>
                        <Check className={cn('mr-2 h-3.5 w-3.5', !selectedCity ? 'opacity-100' : 'opacity-0')} />
                        All cities
                      </CommandItem>
                      {CYPRUS_CITIES.map(({ name }) => (
                        <CommandItem key={name} value={name}
                          onSelect={() => { handleCitySelect(name); setCityOpen(false) }}>
                          <Check className={cn('mr-2 h-3.5 w-3.5', selectedCity === name ? 'opacity-100' : 'opacity-0')} />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />

            {/* Property type */}
            <Select value={propertyType || '__all'} onValueChange={v => setPropertyType(v === '__all' ? '' : v)}>
              <SelectTrigger className="h-8 text-xs border-gray-200 rounded-lg w-[120px] bg-white hover:border-gray-300 transition-colors">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            {/* Price range popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`h-8 px-3 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                  priceActive
                    ? 'border-blue-400 text-blue-600 bg-blue-50'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}>
                  <Euro size={11} />
                  {priceLabel}
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 shadow-lg" align="start">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price range</p>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-3">
                  <span>€{priceRange[0].toLocaleString()}</span>
                  <span>{priceRange[1] >= 5000 ? '€5,000+' : '€' + priceRange[1].toLocaleString()}</span>
                </div>
                <Slider min={0} max={5000} step={100} value={priceRange} onValueChange={setPriceRange} />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>€0</span><span>€5,000+</span>
                </div>
                {priceActive && (
                  <button onClick={() => setPriceRange([0, 5000])}
                    className="mt-3 text-xs text-blue-600 hover:underline w-full text-center">
                    Reset price
                  </button>
                )}
              </PopoverContent>
            </Popover>

            {/* Bedrooms */}
            <Select value={bedrooms || '__any'} onValueChange={v => setBedrooms(v === '__any' ? '' : v)}>
              <SelectTrigger className="h-8 text-xs border-gray-200 rounded-lg w-[110px] bg-white hover:border-gray-300 transition-colors">
                <SelectValue placeholder="Any beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any beds</SelectItem>
                <SelectItem value="1">1+ bed</SelectItem>
                <SelectItem value="2">2+ beds</SelectItem>
                <SelectItem value="3">3+ beds</SelectItem>
                <SelectItem value="4">4+ beds</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-8 text-xs border-gray-200 rounded-lg w-[120px] bg-white hover:border-gray-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price_asc">Price ↑</SelectItem>
                <SelectItem value="price_desc">Price ↓</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear */}
            {activeCount > 0 && (
              <button onClick={handleClearAll}
                className="h-8 px-3 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors flex items-center gap-1 flex-shrink-0 ml-auto">
                <X size={12} />
                Clear
                <span className="ml-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">{activeCount}</span>
              </button>
            )}
          </div>

          {/* ── Row 2: Mobile filters button ── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile city */}
            <Popover open={mobileCityOpen} onOpenChange={setMobileCityOpen}>
              <PopoverTrigger asChild>
                <button className={`h-8 px-3 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition-colors ${
                  selectedCity ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 bg-white'
                }`}>
                  <MapPin size={11} className={selectedCity ? 'text-blue-500' : 'text-gray-400'} />
                  {selectedCity || 'Any city'}
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search city…" className="h-8 text-sm" />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => { setSelectedCity(''); setSearch(''); setMobileCityOpen(false) }}>
                        <Check className={cn('mr-2 h-3.5 w-3.5', !selectedCity ? 'opacity-100' : 'opacity-0')} />
                        All cities
                      </CommandItem>
                      {CYPRUS_CITIES.map(({ name }) => (
                        <CommandItem key={name} value={name}
                          onSelect={() => { handleCitySelect(name); setMobileCityOpen(false) }}>
                          <Check className={cn('mr-2 h-3.5 w-3.5', selectedCity === name ? 'opacity-100' : 'opacity-0')} />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Mobile filters sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="relative h-8 px-3 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <SlidersHorizontal size={13} />
                  Filters
                  {activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {activeCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[88vh] rounded-t-2xl flex flex-col">
                <SheetHeader className="px-5 pt-5 pb-0">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Listing type</p>
                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                      {[{ v: 'all', l: 'All' }, { v: 'rent', l: 'Rent' }, { v: 'sale', l: 'Buy' }].map(({ v, l }) => (
                        <button key={v} onClick={() => handleListingStatus(v)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${listingStatus === v ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-500'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Property type</p>
                    <Select value={propertyType || '__all'} onValueChange={v => setPropertyType(v === '__all' ? '' : v)}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-xl">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Price range</p>
                      <span className="text-xs font-medium text-gray-700">{priceLabel}</span>
                    </div>
                    <Slider min={0} max={5000} step={100} value={priceRange} onValueChange={setPriceRange} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>€0</span><span>€5,000+</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bedrooms</p>
                    <div className="flex gap-2">
                      {['', '1', '2', '3', '4'].map((v) => (
                        <button key={v} onClick={() => setBedrooms(v)}
                          className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
                            bedrooms === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          }`}>
                          {v === '' ? 'Any' : `${v}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort by</p>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="price_asc">Price: low → high</SelectItem>
                        <SelectItem value="price_desc">Price: high → low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 pt-4 pb-6 border-t border-gray-100">
                  {activeCount > 0 && (
                    <button onClick={() => { handleClearAll(); setSheetOpen(false) }}
                      className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-red-200 hover:text-red-500 transition-colors">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setSheetOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Show results
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>

      {/* ── Content: list + map ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — map */}
        {/* zIndex: 0 creates a new stacking context so Leaflet's internal z-indices (200-800)
            stay contained within it and don't bleed above the Sheet (z-50 at root) */}
        <div className="flex-shrink-0 relative" style={{ width: '35%', zIndex: 0 }}>
          <CyprusMap
            properties={properties}
            selectedCity={selectedCity}
            onMarkerClick={(id) => {
              setHighlighted(id)
              const el = listRef.current?.querySelector(`[data-id="${id}"]`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          />
        </div>

        {/* RIGHT — property list */}
        <div ref={listRef} className="overflow-y-auto bg-gray-50" style={{ width: '65%' }}>
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-100 px-4 py-3 z-10">
            <p className="text-sm font-semibold text-gray-700">
              {loading ? 'Searching…' : `${totalCount} properties`}
              {selectedCity && <span className="text-gray-400 font-normal"> in {selectedCity}</span>}
            </p>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mx-auto mb-3">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <p className="text-sm font-medium text-gray-500">No properties found</p>
                <button onClick={handleClearAll} className="mt-3 text-xs text-blue-600 hover:underline">Reset filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {properties.map((p) => (
                      <ListCard
                        key={p._id}
                        property={p}
                        highlighted={highlighted === p._id}
                        onClick={() => setHighlighted(highlighted === p._id ? null : p._id)}
                        favIds={favIds}
                        onFavToggle={handleFavToggle}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="pb-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setPage(p)
                      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
