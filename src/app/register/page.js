'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Check, X, ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

// ─── Roles ────────────────────────────────────────────────────────────────────
const ROLES = [
  {
    value: 'user',
    title: "User",
    desc: 'Browse & save properties',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    value: 'owner',
    title: "Owner",
    desc: 'List & manage properties',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 12L12 4l9 8"/>
        <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9"/>
      </svg>
    ),
  },
]

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  name:     z.string().min(2, 'At least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[a-z]/, 'One lowercase letter')
    .regex(/[0-9]/, 'One number')
    .regex(/[^A-Za-z0-9]/, 'One special character'),
  confirm: z.string(),
  terms:   z.boolean().refine(v => v === true, { message: 'You must accept the terms' }),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

// ─── Strength ─────────────────────────────────────────────────────────────────
const RULES = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'Uppercase letter',       test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',       test: p => /[a-z]/.test(p) },
  { label: 'Number',                 test: p => /[0-9]/.test(p) },
  { label: 'Special character',      test: p => /[^A-Za-z0-9]/.test(p) },
]
const STR_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
const STR_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [role,        setRole]        = useState('user')
  const [showForm,    setShowForm]    = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError,    setApiError]    = useState('')
  const [gLoading,    setGLoading]    = useState(false)

  const { login } = useAuth()
  const router    = useRouter()
  const BACKEND   = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '', terms: false },
    mode: 'onChange',
  })

  const password = form.watch('password') ?? ''
  const terms    = form.watch('terms')
  const results  = useMemo(() => RULES.map(r => ({ ...r, passed: r.test(password) })), [password])
  const score    = results.filter(r => r.passed).length

  const onSubmit = async (data) => {
    setApiError('')
    try {
      const res = await api.post('/auth/register', {
        name: data.name, email: data.email, password: data.password,
        role: role === 'owner' ? 'owner' : 'user',
      })
      login(res.data.token, res.data.user)
      router.push('/')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-[440px]">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
                Create your account
              </h1>
              <p className="text-sm text-gray-500">
                Already registered?{' '}
                <Link href="/login" className="text-blue-600 font-medium hover:underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>

            {/* ── Role selection ── */}
            <div className="mb-5">
              <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 block">
                Choose your account type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => {
                  const active = role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        'group relative flex flex-col gap-2.5 p-3.5 rounded-xl border-2 text-left',
                        'transition-all duration-200 outline-none',
                        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                        active
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-sm shadow-blue-100'
                          : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                      )}
                    >
                      {/* Aceternity: shimmer on hover */}
                      {!active && (
                        <span className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/40 to-transparent shimmer-sweep" />
                        </span>
                      )}

                      {/* Checkmark */}
                      <span className={cn(
                        'absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                        active ? 'border-blue-500 bg-blue-500' : 'border-gray-200'
                      )}>
                        {active && <Check size={9} className="text-white stroke-[3]" />}
                      </span>

                      {/* Icon */}
                      <span className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                        active
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                      )}>
                        {r.icon}
                      </span>

                      {/* Text */}
                      <span>
                        <p className={cn(
                          'text-sm font-semibold leading-tight transition-colors',
                          active ? 'text-blue-700' : 'text-gray-800'
                        )}>
                          {r.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{r.desc}</p>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Auth method / form ── */}
            <AnimatePresence mode="wait" initial={false}>

              {!showForm ? (
                /* Step 1 — choose method */
                <motion.div key="choice"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                  {/* Google — Aceternity outline button */}
                  <a
                    href={`${BACKEND}/api/auth/google`}
                    onClick={() => setGLoading(true)}
                    className={cn(
                      'relative flex items-center justify-center gap-2.5 w-full h-10',
                      'border border-gray-200 rounded-xl text-sm font-medium text-gray-700',
                      'bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm',
                      'transition-all duration-150 overflow-hidden',
                      gLoading && 'opacity-70 pointer-events-none'
                    )}
                  >
                    {/* Shimmer on hover */}
                    <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/60 to-transparent shimmer-sweep opacity-0 hover:opacity-100" />
                    </span>
                    {gLoading ? <Loader2 size={15} className="animate-spin text-gray-400" /> : <GoogleIcon />}
                    {gLoading ? 'Redirecting...' : 'Continue with Google'}
                  </a>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-3.5">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Email — Aceternity shimmer primary button */}
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="relative flex items-center justify-center gap-2.5 w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors overflow-hidden group"
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                    </span>
                    <Mail size={15} />
                    Continue with email
                  </button>

                  {/* Terms note */}
                  <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
                    By continuing you agree to our{' '}
                    <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600">Terms</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">Privacy Policy</Link>
                  </p>
                </motion.div>

              ) : (
                /* Step 2 — email form */
                <motion.div key="form"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>

                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setApiError(''); form.clearErrors() }}
                    className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 mb-5 transition-colors -ml-0.5 font-medium"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>

                  {/* API error */}
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-4"
                    >
                      <X size={14} className="shrink-0 mt-0.5" />
                      {apiError}
                    </motion.div>
                  )}

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">

                      {/* Full name */}
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-medium text-gray-600">Full name</FormLabel>
                          <FormControl>
                            <Input
                              {...field} placeholder="John Doe" autoComplete="name"
                              className="h-9 text-sm border-gray-200 input-glow rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />

                      {/* Email */}
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-medium text-gray-600">Email address</FormLabel>
                          <FormControl>
                            <Input
                              {...field} type="email" placeholder="you@example.com"
                              autoComplete="email" inputMode="email"
                              className="h-9 text-sm border-gray-200 input-glow rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />

                      {/* Password */}
                      <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-medium text-gray-600">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field} type={showPass ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                                className="h-9 text-sm border-gray-200 input-glow rounded-lg pr-9"
                              />
                              <button
                                type="button" onClick={() => setShowPass(v => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </FormControl>

                          {/* Aceternity strength meter */}
                          {password.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-2 pt-1"
                            >
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i}
                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                    style={{ background: i <= score ? STR_COLOR[score] : '#e2e8f0' }}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-[11px] font-semibold" style={{ color: score > 0 ? STR_COLOR[score] : '#94a3b8' }}>
                                  {score > 0 ? STR_LABEL[score] : 'Enter a password'}
                                </p>
                                <p className="text-[11px] text-gray-400">{score}/5</p>
                              </div>
                              {/* Aceternity: rules checklist with glass bg */}
                              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-2.5 grid gap-1.5">
                                {results.map((r, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className={cn(
                                      'shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors',
                                      r.passed ? 'bg-green-100' : 'bg-gray-200'
                                    )}>
                                      {r.passed
                                        ? <Check size={8} className="text-green-600 stroke-[3]" />
                                        : <X size={8} className="text-gray-400 stroke-[3]" />}
                                    </span>
                                    <span className={cn('text-[11px] transition-colors', r.passed ? 'text-green-700' : 'text-gray-400')}>
                                      {r.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />

                      {/* Confirm password */}
                      <FormField control={form.control} name="confirm" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-medium text-gray-600">Confirm password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field} type={showConfirm ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                className="h-9 text-sm border-gray-200 input-glow rounded-lg pr-9"
                              />
                              <button
                                type="button" onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />

                      {/* Terms */}
                      <FormField control={form.control} name="terms" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={field.value}
                              onClick={() => field.onChange(!field.value)}
                              className={cn(
                                'shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150',
                                field.value
                                  ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                                  : 'bg-white border-gray-300 hover:border-blue-400'
                              )}
                            >
                              {field.value && <Check size={9} className="text-white stroke-[3.5]" />}
                            </button>
                            <Label className="text-[12px] text-gray-500 leading-relaxed font-normal cursor-pointer">
                              I agree to the{' '}
                              <Link href="/terms" className="text-blue-600 hover:underline underline-offset-2 font-medium">Terms</Link>
                              {' '}and{' '}
                              <Link href="/privacy" className="text-blue-600 hover:underline underline-offset-2 font-medium">Privacy Policy</Link>
                            </Label>
                          </div>
                          <FormMessage className="text-xs ml-6" />
                        </FormItem>
                      )} />

                      {/* Submit — Aceternity shimmer button */}
                      <button
                        type="submit"
                        disabled={form.formState.isSubmitting || !form.formState.isValid}
                        className="relative flex items-center justify-center gap-2 w-full h-10 mt-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors overflow-hidden"
                      >
                        {!form.formState.isSubmitting && (
                          <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                          </span>
                        )}
                        {form.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                      </button>

                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>

      </div>
    </div>
  )
}
