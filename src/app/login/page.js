'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

const GOOGLE_ERRORS = {
  google_failed: 'Google sign-in failed. Please try again.',
  no_code:       'Google sign-in was cancelled.',
}

function LoginForm() {
  const [form,       setForm]       = useState({ email: '', password: '' })
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [showPass,   setShowPass]   = useState(false)
  const [gLoading,   setGLoading]   = useState(false)

  const { login }    = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Show error from Google OAuth redirect (?error=google_failed)
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(GOOGLE_ERRORS[urlError] || 'Authentication failed. Please try again.')
  }, [searchParams])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-[420px]">

        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline underline-offset-2">
            Get started
          </Link>
        </p>

        {/* Google */}
        <a
          href={`${BACKEND}/api/auth/google`}
          onClick={() => setGLoading(true)}
          className={`flex items-center justify-center gap-2.5 w-full border rounded-xl py-2.5 text-sm font-medium transition-all duration-150 mb-4
            ${gLoading
              ? 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed text-slate-400'
              : 'border-slate-200 text-gray-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:bg-slate-100'
            }`}
        >
          {gLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          {gLoading ? 'Redirecting...' : 'Continue with Google'}
        </a>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <X size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700 block">Email address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-[12px] text-blue-600 hover:underline underline-offset-2">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange} required placeholder="Your password"
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400 pr-10"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm mt-1">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
