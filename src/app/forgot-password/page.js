'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [devLink, setDevLink] = useState(null)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSent(true)
      if (res.data.devLink) setDevLink(res.data.devLink)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-[420px]">

        {!sent ? (
          <>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700 block">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm mt-1"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-[18px] font-bold text-gray-900 mb-1">Check your inbox</h2>
            <p className="text-sm text-gray-500">
              If <span className="font-medium text-gray-700">{email}</span> is registered,
              you'll receive a reset link shortly.
            </p>

            {devLink && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-[11px] font-semibold text-amber-700 mb-1 uppercase tracking-wide">Dev mode — Reset link:</p>
                <Link href={devLink} className="text-xs text-blue-600 break-all hover:underline">
                  {devLink}
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
          <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  )
}
