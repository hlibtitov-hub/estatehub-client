'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Pencil, Trash2, Plus, ImageIcon, Users, Building2, TrendingUp, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ property, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       property.title       || '',
    price:       property.price       || '',
    description: property.description || '',
    type:        property.type        || 'apartment',
    rooms:       property.rooms       || '',
    area:        property.area        || '',
    status:      property.status      || 'active',
    dealType:    property.dealType    || 'rent',
    city:        property.address?.city   || '',
    street:      property.address?.street || '',
  })
  const [images,    setImages]    = useState(property.images || [])
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('image', file)
      const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImages(prev => [...prev, res.data.url])
    } catch { setError('Photo upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const res = await api.put(`/properties/${property._id}`, {
        title: form.title, price: Number(form.price), description: form.description,
        type: form.type, rooms: Number(form.rooms), area: form.area ? Number(form.area) : null,
        status: form.status, dealType: form.dealType, images,
        address: { ...property.address, city: form.city, street: form.street },
      })
      onSave(res.data); onClose()
    } catch (err) { setError(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">Edit property</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <Field label={`Photos (${images.length})`}>
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  <button onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50 flex-shrink-0">
                {uploading ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <><Plus size={18} /><span className="text-[10px]">Add</span></>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
            </div>
          </Field>
          <Field label="Title">
            <input value={form.title} onChange={e => set('title', e.target.value)} className="inp" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price">
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="inp" />
            </Field>
            <Field label="Deal type">
              <select value={form.dealType} onChange={e => set('dealType', e.target.value)} className="inp">
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} className="inp">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)} className="inp">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="villa">Villa</option>
              </select>
            </Field>
            <Field label="Rooms">
              <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)} className="inp" />
            </Field>
            <Field label="Area m²">
              <input type="number" value={form.area} onChange={e => set('area', e.target.value)} className="inp" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City"><input value={form.city} onChange={e => set('city', e.target.value)} className="inp" /></Field>
            <Field label="Street"><input value={form.street} onChange={e => set('street', e.target.value)} className="inp" /></Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="inp resize-none" />
          </Field>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
  }
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user }     = useAuth()
  const router       = useRouter()
  const [users,      setUsers]      = useState([])
  const [properties, setProperties] = useState([])
  const [stats,      setStats]      = useState(null)
  const [tab,        setTab]        = useState('stats')
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState(null)
  const [confirmUser,     setConfirmUser]     = useState(null)
  const [confirmProperty, setConfirmProperty] = useState(null)

  useEffect(() => {
    if (user === null)                { router.push('/login'); return }
    if (user && user.role !== 'admin') { router.push('/');    return }
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [usersRes, propsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/properties'),
        api.get('/admin/stats'),
      ])
      setUsers(usersRes.data)
      setProperties(propsRes.data)
      setStats(statsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
    } catch (err) { console.error(err) }
    setConfirmUser(null)
  }

  const changeRole = async (userId, role) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.role } : u))
    } catch (err) { console.error(err) }
  }

  const deleteProperty = async (id) => {
    try {
      await api.delete(`/admin/properties/${id}`)
      setProperties(prev => prev.filter(p => p._id !== id))
    } catch (err) { console.error(err) }
    setConfirmProperty(null)
  }

  const handleSaved = (updated) => {
    setProperties(prev => prev.map(p => p._id === updated._id ? updated : p))
  }

  if (!user || user.role !== 'admin') return null

  const STATUS_COLORS = {
    active:   'bg-green-50 text-green-600',
    inactive: 'bg-gray-100 text-gray-500',
    sold:     'bg-blue-50 text-blue-600',
    rented:   'bg-purple-50 text-purple-600',
  }

  const ROLE_COLORS = {
    admin: 'bg-red-50 text-red-600',
    owner: 'bg-blue-50 text-blue-600',
    user:  'bg-gray-100 text-gray-500',
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="stats">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : (
          <>
          {/* ── Stats Tab ── */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users}      label="Total users"       value={stats?.totalUsers}      sub={`+${stats?.newUsers} last 30 days`} color="blue" />
              <StatCard icon={ShieldCheck} label="Owners"           value={stats?.owners}          color="purple" />
              <StatCard icon={Building2}  label="Total listings"    value={stats?.totalProperties} color="green" />
              <StatCard icon={TrendingUp} label="Active listings"   value={stats?.activeProperties} color="amber" />
            </div>

            {/* By city */}
            {stats?.byCity?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-4">Top cities</h3>
                <div className="flex flex-col gap-3">
                  {stats.byCity.map(({ _id, count }) => (
                    <div key={_id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-28 truncate">{_id || 'Unknown'}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round((count / stats.totalProperties) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By type */}
            {stats?.byType?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Property types</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.byType.map(({ _id, count }) => (
                    <div key={_id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{_id}</span>
                      <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Users Tab ── */}
          <TabsContent value="users">
            <div className="flex flex-col gap-3">
              {users.map(u => (
                <div key={u._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Role selector */}
                    {u._id !== user._id && (
                      <select
                        value={u.role}
                        onChange={e => changeRole(u._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none focus:border-blue-400 bg-white"
                      >
                        <option value="user">user</option>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                    {u._id !== user._id && (
                      <button onClick={() => setConfirmUser(u._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Properties Tab ── */}
          <TabsContent value="properties">
            <div className="flex flex-col gap-3">
              {properties.map(p => (
                <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-3">
                    {p.images?.[0] && (
                      <Image src={p.images[0]} alt="" width={48} height={48} className="rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                      <p className="text-sm text-gray-400 truncate">{p.address?.city} · {p.owner?.name || 'No owner'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                    <button onClick={() => setEditing(p)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmProperty(p._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          </>
        )}
      </Tabs>

      {/* AlertDialog: delete user */}
      <AlertDialog open={!!confirmUser} onOpenChange={open => !open && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the user and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser(confirmUser)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: delete property */}
      <AlertDialog open={!!confirmProperty} onOpenChange={open => !open && setConfirmProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the listing.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteProperty(confirmProperty)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing && (
        <EditModal property={editing} onClose={() => setEditing(null)} onSave={handleSaved} />
      )}

      <style jsx global>{`
        .inp {
          width: 100%; border: 1px solid #e5e7eb; border-radius: 8px;
          padding: 8px 12px; font-size: 14px; outline: none; background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .inp:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1); }
      `}</style>
    </main>
  )
}
