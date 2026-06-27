'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { user, login, logout } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  // ── Profile fields ──
  const [form, setForm] = useState({ name: '', phone: '' })
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Password change ──
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwShow, setPwShow] = useState({ current: false, new: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // ── Delete account ──
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user === null) router.push('/login')
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' })
      setAvatarUrl(user.avatar || '')
    }
  }, [user])

  if (!user) return null

  // ── Profile handlers ──
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      let finalAvatar = avatarUrl
      if (avatarFile) {
        const fd = new FormData()
        fd.append('image', avatarFile)
        const { data } = await api.post('/upload', fd)
        finalAvatar = data.url
      }
      const res = await api.put('/users/profile', { ...form, avatar: finalAvatar })
      login(localStorage.getItem('token'), res.data)
      setAvatarUrl(finalAvatar)
      setAvatarFile(null)
      setAvatarPreview('')
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Password handlers ──
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value })

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters')
      return
    }
    setPwLoading(true)
    try {
      await api.put('/users/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await api.delete('/users/me')
      logout()
      router.push('/')
    } catch (err) {
      console.error(err)
      setDeleteLoading(false)
    }
  }

  const displayAvatar = avatarPreview || avatarUrl
  const input = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-sm text-gray-400 mb-8">{user.email}</p>

      {/* ── Profile info ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Personal info</h2>

        <div className="flex items-center gap-5 mb-8">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center group flex-shrink-0"
          >
            {displayAvatar ? (
              <Image src={displayAvatar} alt="avatar" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-400 capitalize mb-1">{user.role}</p>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-blue-600 hover:underline">
              Change photo
            </button>
          </div>
        </div>

        {profileSuccess && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" className={input} />
          </div>
          <button type="submit" disabled={profileLoading}
            className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {profileLoading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* ── Change password — hidden for Google users ── */}
      {!user.googleId && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Change password</h2>

          {pwSuccess && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
              Password changed successfully!
            </div>
          )}
          {pwError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {[
              { name: 'currentPassword', label: 'Current password',     key: 'current' },
              { name: 'newPassword',     label: 'New password',          key: 'new' },
              { name: 'confirmPassword', label: 'Confirm new password',  key: 'confirm' },
            ].map(({ name, label, key }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <div className="relative">
                  <input
                    type={pwShow[key] ? 'text' : 'password'}
                    name={name}
                    value={pwForm[name]}
                    onChange={handlePwChange}
                    required
                    className={`${input} pr-10`}
                  />
                  <button type="button"
                    onClick={() => setPwShow(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <EyeIcon open={pwShow[key]} />
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
              {pwLoading ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Danger zone ── */}
      <div className="bg-white border border-red-100 rounded-2xl p-8">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-2">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account and all your listings. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="text-sm font-medium text-red-500 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
        >
          Delete my account
        </button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all your property listings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
