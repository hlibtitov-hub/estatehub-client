'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { useToast } from '@/context/ToastContext'
import api from '@/lib/api'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'

// ─── Shared form fields ───────────────────────────────────────────────────────
function PropertyFields({ form, onChange }) {
  const input = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white'
  const toggle = (name, value) => onChange({ target: { name, value } })
  const [calOpen, setCalOpen] = useState(false)

  const BoolToggle = ({ name, label }) => {
    const isNA  = form[name] === '' || form[name] === null || form[name] === undefined
    const isYes = String(form[name]) === 'true'
    return (
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium w-6 text-right ${isNA ? 'text-gray-300' : isYes ? 'text-green-600' : 'text-gray-400'}`}>
            {isNA ? '—' : isYes ? 'Yes' : 'No'}
          </span>
          <Switch
            checked={!isNA && isYes}
            disabled={isNA}
            onCheckedChange={(v) => toggle(name, v ? 'true' : 'false')}
          />
          <button
            type="button"
            onClick={() => toggle(name, isNA ? 'false' : '')}
            className={`text-xs underline transition-colors w-6 ${isNA ? 'text-blue-500 hover:text-blue-700' : 'text-gray-300 hover:text-gray-500'}`}
          >
            {isNA ? 'Set' : 'N/A'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Basic info ── */}
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-1">Basic info</p>
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
        <input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Cozy 2-bedroom apartment in Limassol" className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
        <textarea name="description" value={form.description} onChange={onChange} required rows={3}
          placeholder="Describe the property..." className={`${input} resize-none`} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Price ($/month)</label>
        <input name="price" type="number" value={form.price} onChange={onChange} required placeholder="1200" className={input} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Listing type</label>
        <Select value={form.dealType} onValueChange={(v) => toggle('dealType', v)}>
          <SelectTrigger className={input}>
            <SelectValue placeholder="Rent or Sale?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Property type</label>
        <Select value={form.type} onValueChange={(v) => toggle('type', v)}>
          <SelectTrigger className={input}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
        <input name="city" value={form.city} onChange={onChange} required placeholder="Limassol" className={input} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Street</label>
        <input name="street" value={form.street} onChange={onChange} placeholder="Makarios Avenue 45" className={input} />
      </div>

      {/* ── Details ── */}
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-2">Details</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Rooms</label>
        <input name="rooms" type="number" value={form.rooms} onChange={onChange} placeholder="2" className={input} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Living space (m²)</label>
        <input name="area" type="number" value={form.area} onChange={onChange} placeholder="60" className={input} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Floor</label>
        <input name="floor" type="number" value={form.floor} onChange={onChange} placeholder="3" className={input} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Available from</label>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(input, 'flex items-center justify-between text-left', !form.availableFrom && 'text-gray-400')}
            >
              <span>{form.availableFrom ? format(new Date(form.availableFrom), 'PPP') : 'Pick a date'}</span>
              <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={form.availableFrom ? new Date(form.availableFrom) : undefined}
              onSelect={(date) => {
                toggle('availableFrom', date ? format(date, 'yyyy-MM-dd') : '')
                setCalOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Facilities ── */}
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-2">Facilities</p>
      </div>
      <BoolToggle name="furnished"  label="Furnished" />
      <BoolToggle name="ac"         label="Air conditioning" />
      <BoolToggle name="parking"    label="Parking" />
      <BoolToggle name="balcony"    label="Balcony" />
      <BoolToggle name="pets"       label="Pets allowed" />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', price: '', type: 'apartment', dealType: 'rent',
  city: '', street: '', rooms: '', area: '', floor: '',
  furnished: '', ac: '', parking: '', balcony: '', pets: '', availableFrom: '',
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router    = useRouter()
  const toast     = useToast()

  const [properties,    setProperties]    = useState([])
  const [loading,       setLoading]       = useState(true)

  // Create form
  const [showForm,      setShowForm]      = useState(false)
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [imageFiles,    setImageFiles]    = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading,     setUploading]     = useState(false)
  const [uploadProgress,setUploadProgress]= useState(0)
  const [isDragging,    setIsDragging]    = useState(false)

  // Edit form
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [editingId,      setEditingId]      = useState(null)
  const [editForm,       setEditForm]       = useState(EMPTY_FORM)
  const [editSaving,     setEditSaving]     = useState(false)
  const [editImages,     setEditImages]     = useState([])      // existing image URLs
  const [editNewFiles,   setEditNewFiles]   = useState([])      // new File objects
  const [editNewPreviews,setEditNewPreviews] = useState([])     // new image previews

  useEffect(() => {
    if (authLoading) return                     // wait for auth to resolve
    if (!user) { router.push('/login'); return }
    fetchMyProperties()
  }, [user, authLoading])

  const fetchMyProperties = async () => {
    try {
      const res = await api.get('/properties/my')
      setProperties(res.data.properties)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // ── Create helpers ──────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addFiles = (files) => {
    const valid = files.filter(f => f.type.startsWith('image/'))
    if (!valid.length) return
    setImageFiles(prev => [...prev, ...valid])
    setImagePreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))])
  }
  const handleImageChange = (e) => { addFiles(Array.from(e.target.files)); e.target.value = '' }
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)) }
  const removeImage     = (i) => {
    setImageFiles(prev => prev.filter((_, j) => j !== i))
    setImagePreviews(prev => prev.filter((_, j) => j !== i))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      let images = []
      if (imageFiles.length > 0) {
        setUploading(true)
        setUploadProgress(0)
        let done = 0
        const results = await Promise.all(imageFiles.map(async file => {
          const fd = new FormData(); fd.append('image', file)
          const result = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          done++
          setUploadProgress(Math.round((done / imageFiles.length) * 100))
          return result
        }))
        images = results.map(r => r.data.url)
        setUploading(false)
      }
      const boolVal = (v) => v === 'true' ? true : v === 'false' ? false : null
      await api.post('/properties', {
        title: form.title, description: form.description,
        price: Number(form.price), type: form.type, dealType: form.dealType,
        address: { city: form.city, street: form.street },
        rooms:         form.rooms         ? Number(form.rooms)  : null,
        area:          form.area          ? Number(form.area)   : null,
        floor:         form.floor         ? Number(form.floor)  : null,
        furnished:     boolVal(form.furnished),
        ac:            boolVal(form.ac),
        parking:       boolVal(form.parking),
        balcony:       boolVal(form.balcony),
        pets:          boolVal(form.pets),
        availableFrom: form.availableFrom || null,
        images,
      })
      setShowForm(false); setForm(EMPTY_FORM); setImageFiles([]); setImagePreviews([])
      toast('Listing created!', 'success')
      fetchMyProperties()
    } catch (err) {
      console.error(err); setUploading(false)
      toast('Failed to create listing', 'error')
    }
  }

  // ── Edit helpers ────────────────────────────────────────────────────────────
  const openEdit = (property) => {
    if (editingId === property._id) { setEditingId(null); return }
    setEditingId(property._id)
    const bStr = (v) => v === true ? 'true' : v === false ? 'false' : ''
    setEditForm({
      title:         property.title             || '',
      description:   property.description       || '',
      price:         property.price             || '',
      type:          property.type              || 'apartment',
      dealType:      property.dealType          || 'rent',
      city:          property.address?.city     || '',
      street:        property.address?.street   || '',
      rooms:         property.rooms             || '',
      area:          property.area              || '',
      floor:         property.floor             || '',
      furnished:     bStr(property.furnished),
      ac:            bStr(property.ac),
      parking:       bStr(property.parking),
      balcony:       bStr(property.balcony),
      pets:          bStr(property.pets),
      availableFrom: property.availableFrom     || '',
    })
    setEditImages(property.images || [])
    setEditNewFiles([])
    setEditNewPreviews([])
  }

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const handleEditAddFiles = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    setEditNewFiles(prev => [...prev, ...files])
    setEditNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeEditExisting = (i) => setEditImages(prev => prev.filter((_, j) => j !== i))
  const removeEditNew      = (i) => {
    setEditNewFiles(prev => prev.filter((_, j) => j !== i))
    setEditNewPreviews(prev => prev.filter((_, j) => j !== i))
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      // Upload new photos first
      let uploadedUrls = []
      if (editNewFiles.length > 0) {
        const results = await Promise.all(editNewFiles.map(file => {
          const fd = new FormData(); fd.append('image', file)
          return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        }))
        uploadedUrls = results.map(r => r.data.url)
      }

      const boolVal = (v) => v === 'true' ? true : v === 'false' ? false : null
      await api.put(`/properties/${editingId}`, {
        title:         editForm.title,
        description:   editForm.description,
        price:         Number(editForm.price),
        type:          editForm.type,
        dealType:      editForm.dealType,
        address:       { city: editForm.city, street: editForm.street },
        rooms:         editForm.rooms         ? Number(editForm.rooms)  : null,
        area:          editForm.area          ? Number(editForm.area)   : null,
        floor:         editForm.floor         ? Number(editForm.floor)  : null,
        furnished:     boolVal(editForm.furnished),
        ac:            boolVal(editForm.ac),
        parking:       boolVal(editForm.parking),
        balcony:       boolVal(editForm.balcony),
        pets:          boolVal(editForm.pets),
        availableFrom: editForm.availableFrom || null,
        images:        [...editImages, ...uploadedUrls],
      })
      setEditingId(null)
      toast('Changes saved!', 'success')
      fetchMyProperties()
    } catch (err) {
      console.error(err)
      toast('Failed to save changes', 'error')
    } finally { setEditSaving(false) }
  }

  // ── Status toggle ───────────────────────────────────────────────────────────
  const handleStatusToggle = async (property) => {
    const isDone = property.status === 'sold' || property.status === 'rented'
    const newStatus = isDone
      ? 'active'
      : property.dealType === 'sale' ? 'sold' : 'rented'
    try {
      await api.put(`/properties/${property._id}`, { status: newStatus })
      setProperties(prev => prev.map(p => p._id === property._id ? { ...p, status: newStatus } : p))
      toast(`Marked as ${newStatus}`, 'success')
    } catch (err) { console.error(err) }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/properties/${id}`)
      setProperties(prev => prev.filter(p => p._id !== id))
      toast('Listing deleted', 'info')
    } catch (err) { console.error(err) }
    setConfirmDelete(null)
  }

  if (authLoading || !user) return null

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setEditingId(null) }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New listing'}
        </button>
      </div>

      {/* ── Aceternity: Bento Grid Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Active listings', value: properties.filter(p => p.status !== 'inactive').length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              ),
              color: '#3b82f6', bg: '#eff6ff', span: 'col-span-1',
            },
            {
              label: 'Total listings', value: properties.length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              ),
              color: '#8b5cf6', bg: '#f5f3ff', span: 'col-span-1',
            },
            {
              label: 'For rent', value: properties.filter(p => p.dealType === 'rent').length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              ),
              color: '#10b981', bg: '#ecfdf5', span: 'col-span-1',
            },
            {
              label: 'For sale', value: properties.filter(p => p.dealType === 'sale').length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              ),
              color: '#f59e0b', bg: '#fffbeb', span: 'col-span-1',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className={`${stat.span} bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Listings label */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">My Listings</h2>
        <p className="text-sm text-gray-400">{properties.length} total</p>
      </div>

      {/* ── Create form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">New listing</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PropertyFields form={form} onChange={handleChange} />

                {/* Photos */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Photos {imagePreviews.length > 0 && <span className="text-gray-400 font-normal">({imagePreviews.length} selected)</span>}
                  </label>
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="relative h-24 rounded-xl overflow-hidden group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                          {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md">Main</span>}
                        </div>
                      ))}
                      <div onClick={() => document.getElementById('photo-input').click()}
                        className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors text-gray-400">
                        <span className="text-2xl leading-none">+</span>
                        <span className="text-xs mt-1">Add more</span>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
                      onClick={() => document.getElementById('photo-input').click()}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      role="button" aria-label="Upload photos" tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && document.getElementById('photo-input').click()}
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        isDragging ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#3b82f6' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2" aria-hidden="true">
                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                      <span className={`text-sm font-medium ${isDragging ? 'text-blue-600' : 'text-gray-500'}`}>
                        {isDragging ? 'Drop photos here' : 'Click or drag & drop photos'}
                      </span>
                      <span className="text-xs text-gray-300 mt-1">JPG, PNG, WebP</span>
                    </motion.div>
                  )}
                  <input id="photo-input" type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple
                    onChange={handleImageChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-3">
                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uploading {imageFiles.length} photo{imageFiles.length !== 1 ? 's' : ''}…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}
                  <button type="submit" disabled={uploading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 w-fit">
                    {uploading ? 'Uploading…' : 'Create listing'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">No listings yet</p>
          <p className="text-sm text-gray-400 mb-4">Create your first listing to get started</p>
          <button onClick={() => setShowForm(true)}
            className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Create listing
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map(property => (
            <div key={property._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

              {/* ── Row ── */}
              <div className={`p-5 flex items-center gap-4 ${property.status === 'sold' || property.status === 'rented' ? 'opacity-60' : ''}`}>
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {(property.status === 'sold' || property.status === 'rented') && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wide">
                        {property.status}
                      </span>
                    </div>
                  )}
                  {property.images?.length > 0 ? (
                    <Image src={property.images[0]} alt={property.title} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-0.5 truncate">{property.title}</h3>
                  <p className="text-sm text-gray-400">
                    {property.address?.city} · {property.type} · ${property.price?.toLocaleString()}
                    {property.images?.length > 1 && (
                      <span className="ml-2 text-xs text-blue-500">{property.images.length} photos</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/properties/${property._id}`)}
                    aria-label={`View ${property.title}`}
                    className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { openEdit(property); setShowForm(false) }}
                    aria-label={`Edit ${property.title}`}
                    aria-expanded={editingId === property._id}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      editingId === property._id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {editingId === property._id ? 'Close' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleStatusToggle(property)}
                    aria-label={`Toggle status for ${property.title}`}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border ${
                      property.status === 'sold' || property.status === 'rented'
                        ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {property.status === 'sold' ? '✓ Sold'
                     : property.status === 'rented' ? '✓ Rented'
                     : property.dealType === 'sale' ? 'Mark sold'
                     : 'Mark rented'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(property._id)}
                    aria-label={`Delete ${property.title}`}
                    className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* ── Inline edit form ── */}
              <AnimatePresence>
                {editingId === property._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Edit listing</p>
                      <form onSubmit={handleEditSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PropertyFields form={editForm} onChange={handleEditChange} />

                        {/* Photos */}
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Photos</label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">

                            {/* Existing photos */}
                            {editImages.map((url, i) => (
                              <div key={`ex-${i}`} className="relative h-24 rounded-xl overflow-hidden group">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md">Main</span>}
                                <button type="button" onClick={() => removeEditExisting(i)}
                                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  ×
                                </button>
                              </div>
                            ))}

                            {/* New photo previews */}
                            {editNewPreviews.map((url, i) => (
                              <div key={`new-${i}`} className="relative h-24 rounded-xl overflow-hidden group ring-2 ring-blue-400">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-md">New</span>
                                <button type="button" onClick={() => removeEditNew(i)}
                                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  ×
                                </button>
                              </div>
                            ))}

                            {/* Add button */}
                            <label className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors text-gray-400">
                              <span className="text-2xl leading-none">+</span>
                              <span className="text-xs mt-1">Add photo</span>
                              <input type="file" accept="image/*" multiple onChange={handleEditAddFiles} className="hidden" />
                            </label>

                          </div>
                        </div>

                        <div className="sm:col-span-2 flex gap-3">
                          <button
                            type="submit"
                            disabled={editSaving}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                          >
                            {editSaving ? 'Saving...' : 'Save changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(confirmDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  )
}
