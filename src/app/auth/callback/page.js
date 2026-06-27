'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

// useSearchParams() requires Suspense wrapper in Next.js 15
function CallbackHandler() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { login }    = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      router.push('/login?error=google_failed')
      return
    }

    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      login(token, res.data)
      router.push('/')
    }).catch(() => {
      router.push('/login?error=google_failed')
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
