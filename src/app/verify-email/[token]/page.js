'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  const { token }             = useParams()
  const [status, setStatus]   = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    api.get(`/auth/verify-email/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message) })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.') })
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-[420px] text-center">

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">Verifying your email…</h1>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">Email confirmed!</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link href="/login"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">Verification failed</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              <Link href="/login"
                className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Go to sign in
              </Link>
              <Link href="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Back to home
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
