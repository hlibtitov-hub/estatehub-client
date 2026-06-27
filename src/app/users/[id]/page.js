'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Calendar, Building2, MessageCircle, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function PropertyMini({ p }) {
  const price = p.price ? `€${Number(p.price).toLocaleString()}` : '—'
  const suffix = p.dealType === 'rent' ? '/mo' : ''

  return (
    <Link href={`/properties/${p._id}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Building2 size={32} />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 font-bold text-sm px-3 py-1 rounded-full shadow-sm">
            {price}{suffix}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
          {p.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={11} />
          {p.address?.city || 'Cyprus'}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {p.rooms && <span>{p.rooms} bed</span>}
          {p.area  && <span>· {p.area} m²</span>}
          <span className="ml-auto capitalize text-blue-600 font-medium">{p.dealType}</span>
        </div>
      </div>
    </Link>
  )
}

export default function OwnerProfilePage() {
  const { id }                  = useParams()
  const { user: me }            = useAuth()
  const [owner,    setOwner]    = useState(null)
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!id) return
    api.get(`/users/${id}/public`)
      .then(res => { setOwner(res.data.user); setListings(res.data.listings) })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false))
  }, [id])

  const initials = owner?.name
    ? owner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const memberSince = owner?.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
      <Building2 size={40} className="text-gray-300" />
      <p>{error}</p>
      <Link href="/" className="text-blue-600 hover:underline text-sm">Go home</Link>
    </div>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Profile Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 shadow-sm">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {owner?.avatar ? (
            <Image src={owner.avatar} alt={owner.name} width={96} height={96}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-400 rounded-full border-2 border-white" title="Active" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{owner?.name}</h1>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
            {memberSince && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Member since {memberSince}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Building2 size={14} /> {listings.length} active listing{listings.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {owner?.phone && (
              <a href={`tel:${owner.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                <Phone size={15} /> {owner.phone}
              </a>
            )}
            {me && me._id !== id && (
              <Link href={`/messages?userId=${id}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                <MessageCircle size={15} /> Send message
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Active listings
          <span className="ml-2 text-sm font-normal text-gray-400">({listings.length})</span>
        </h2>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 bg-gray-50 rounded-2xl">
          <Building2 size={36} className="text-gray-300" />
          <p>No active listings at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(p => <PropertyMini key={p._id} p={p} />)}
        </div>
      )}
    </main>
  )
}
