'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const { token }               = useParams()
  const router                  = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [showCf, setShowCf]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-[420px]">

        {!done ? (
          <>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">Set new password</h1>
            <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700 block">New password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700 block">Confirm password</label>
                <div className="relative">
                  <input
                    type={showCf ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-slate-100'
                      }`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {password.length < 4 ? 'Too short' : password.length < 7 ? 'Weak' : password.length < 10 ? 'Fair' : 'Strong'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm mt-1"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-[18px] font-bold text-gray-900 mb-1">Password updated!</h2>
            <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  )
}
