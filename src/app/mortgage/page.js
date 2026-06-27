'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useSpring } from 'motion/react'
import {
  Star, Check, ArrowRight, Building2, ShieldCheck,
  Clock, Users, ChevronDown, Home, FileText, BadgeCheck,
  Zap, X, ChevronRight, Calculator, Briefcase,
  TrendingDown, RefreshCw, Landmark, List,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose,
} from '@/components/ui/sheet'
import api from '@/lib/api'

// ─── Data ────────────────────────────────────────────────────────────────────

const LOAN_TYPES = [
  {
    title: '30-Year Fixed',
    badge: 'Most popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    highlighted: true,
    rate: '6.490%',
    apr: '6.658%',
    points: '1.722 (€4,735)',
    perks: ['3% minimum down payment', 'Lower monthly payments', 'Ideal for first-time buyers'],
  },
  {
    title: '20-Year Fixed',
    badge: 'Save on interest',
    badgeColor: 'bg-slate-100 text-slate-700',
    highlighted: false,
    rate: '6.500%',
    apr: '6.727%',
    points: '1.766 (€4,856)',
    perks: ['Lower total interest paid', 'Build equity faster', 'Moderate monthly payments'],
  },
  {
    title: '15-Year Fixed',
    badge: 'Faster payoff',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    highlighted: false,
    rate: '5.875%',
    apr: '6.181%',
    points: '1.938 (€5,349)',
    perks: ['Lowest interest rate overall', 'Own your home sooner', 'Less interest over time'],
  },
]

const STEPS = [
  {
    n: '01', icon: FileText,
    title: 'Get pre-approved',
    desc: "Answer a few questions and we'll confirm how much you're eligible to borrow in minutes.",
  },
  {
    n: '02', icon: Home,
    title: 'Shop with confidence',
    desc: 'Know your budget before you start. Stand out with a verified pre-approval letter.',
  },
  {
    n: '03', icon: BadgeCheck,
    title: 'Apply for a mortgage',
    desc: 'After your offer is accepted, complete your full loan application fully online.',
  },
  {
    n: '04', icon: Building2,
    title: 'Close on your home',
    desc: "Sign the closing paperwork and we'll finalise the sale. Welcome home!",
  },
]

const ARTICLES = [
  {
    cat: 'Guide',
    catColor: 'bg-blue-100 text-blue-700',
    title: "Pre-qualified vs. pre-approved: What's the difference?",
    desc: 'Understanding the difference can help you move faster when you find the right property.',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
  },
  {
    cat: 'Tips',
    catColor: 'bg-amber-100 text-amber-700',
    title: 'How your credit score affects your mortgage rate',
    desc: 'Even a small improvement in your score can save you thousands over the life of a loan.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    cat: 'Learn',
    catColor: 'bg-slate-100 text-slate-700',
    title: 'How are mortgage rates determined?',
    desc: 'Rates are influenced by the economy, inflation, and your personal financial profile.',
    img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80',
  },
]

const FAQS = [
  {
    q: 'What is EstateHub Home Loans?',
    a: 'EstateHub Home Loans is a mortgage service built into the EstateHub platform. We partner with licensed lenders in Cyprus to offer competitive mortgage options with transparent rates and step-by-step guidance from application to closing.',
  },
  {
    q: 'How do I purchase a home with EstateHub Home Loans?',
    a: "Start by getting pre-approved — fill out a short form and we'll show you the loan amounts and rates you qualify for. Once you find a property, your pre-approval letter helps you make a strong offer. After acceptance, complete the full application and close with our team.",
  },
  {
    q: 'How does EstateHub protect my information?',
    a: 'We use bank-level 256-bit encryption for all data in transit and at rest. Your personal and financial information is never sold to third parties. We comply with EU GDPR regulations.',
  },
  {
    q: 'What type of loan options does EstateHub offer?',
    a: 'We offer 30-year fixed, 20-year fixed, and 15-year fixed mortgages. Each has different rate and payment structures. Our mortgage advisor will help you choose the right one based on your financial situation.',
  },
  {
    q: 'How can I get in contact with a mortgage advisor?',
    a: 'Click "Get pre-approved" on this page or visit any property listing and tap "Get financing". Our advisors respond within one business day.',
  },
]

const REVIEWS = [
  {
    quote: 'The mortgage advisor walked me through every step. As a first-time buyer, I felt completely supported throughout the process.',
    name: 'Anastasia M.', city: 'Limassol', initials: 'AM',
  },
  {
    quote: 'Got pre-approved in 20 minutes. EstateHub made buying my apartment in Paphos so much smoother than I expected.',
    name: 'Dmitri K.', city: 'Paphos', initials: 'DK',
  },
  {
    quote: 'The 15-year fixed rate was the best I found anywhere. Closed in 6 weeks — incredibly fast for Cyprus.',
    name: 'Elena V.', city: 'Nicosia', initials: 'EV',
  },
]

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({ principal, totalInterest }) {
  const total = principal + totalInterest
  if (total <= 0) return null
  const r = 46, cx = 55, cy = 55
  const circ = 2 * Math.PI * r
  const pLen = (principal / total) * circ
  const iLen = (totalInterest / total) * circ

  return (
    <div className="relative flex-shrink-0">
      <svg viewBox="0 0 110 110" width="110" height="110" className="block -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="13" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="13"
          strokeDasharray={`${pLen} ${circ - pLen}`} strokeDashoffset="0" strokeLinecap="butt" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="13"
          strokeDasharray={`${iLen} ${circ - iLen}`} strokeDashoffset={`${-pLen}`} strokeLinecap="butt" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-400 leading-none">P+I</span>
        <span className="text-xs font-bold text-gray-700">split</span>
      </div>
    </div>
  )
}

// ─── Mortgage Calculator ──────────────────────────────────────────────────────

function MortgageCalculator({ onPreApprove }) {
  const [mode, setMode]             = useState('payment')   // 'payment' | 'afford'
  const [homePrice,    setHomePrice]    = useState(280000)
  const [downPayment,  setDownPayment]  = useState(56000)
  const [interestRate, setInterestRate] = useState(6.49)
  const [loanTerm,     setLoanTerm]     = useState(30)
  const [showAmort,    setShowAmort]    = useState(false)
  // Affordability mode
  const [monthlyBudget, setMonthlyBudget] = useState(2000)

  const principal = Math.max(homePrice - downPayment, 0)
  const r  = interestRate / 100 / 12
  const n  = loanTerm * 12
  const monthly = principal > 0 && r > 0
    ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : principal / n
  const totalCost     = monthly * n
  const totalInterest = Math.max(totalCost - principal, 0)

  // Affordability: max principal from a monthly budget
  const affordPrincipal = r > 0
    ? monthlyBudget * ((1 - Math.pow(1 + r, -n)) / r)
    : monthlyBudget * n
  const affordHomePrice = affordPrincipal + downPayment

  // Amortization first 12 months
  const amortRows = (() => {
    if (!showAmort) return []
    const rows = []
    let bal = principal
    for (let i = 1; i <= Math.min(12, n); i++) {
      const imt = bal * r
      const pmt = monthly - imt
      bal = Math.max(0, bal - pmt)
      rows.push({ month: i, payment: monthly, principal: pmt, interest: imt, balance: bal })
    }
    return rows
  })()

  const fmt = (v) => v.toLocaleString('en-EU', { maximumFractionDigits: 0 })

  const Slider = ({ label, value, onChange, min, max, step, prefix = '€', suffix = '' }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-semibold text-gray-800">{prefix}{typeof value === 'number' ? fmt(value) : value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-gray-200 appearance-none cursor-pointer accent-blue-600" />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>{prefix}{fmt(min)}{suffix}</span><span>{prefix}{fmt(max)}{suffix}</span>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 w-full">

      {/* Mode tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {[
          { id: 'payment', label: 'Monthly payment', icon: Calculator },
          { id: 'afford',  label: 'Affordability',   icon: Landmark },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'payment' ? (
          <motion.div key="payment"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-5">

            <Slider label="Home price"    value={homePrice}    onChange={setHomePrice}    min={50000}    max={2000000} step={5000} />
            <Slider label="Down payment"  value={downPayment}  onChange={v => setDownPayment(Math.min(v, homePrice))}  min={0} max={homePrice} step={1000} />
            <Slider label="Interest rate" value={interestRate} onChange={setInterestRate} min={1} max={15} step={0.05} prefix="" suffix="%" />

            {/* Loan term pills */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Loan term</p>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(y => (
                  <button key={y} onClick={() => setLoanTerm(y)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      loanTerm === y
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {y}yr
                  </button>
                ))}
              </div>
            </div>

            {/* Result block */}
            <div className="bg-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-4">
                <DonutChart principal={principal} totalInterest={totalInterest} />
                <div className="flex-1">
                  <p className="text-xs opacity-70 mb-0.5">Monthly payment</p>
                  <p className="text-2xl font-bold">€{fmt(monthly)}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs opacity-75">
                      <span className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0" />
                      Principal €{fmt(principal)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-75">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      Total interest €{fmt(totalInterest)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90 border-t border-blue-500 pt-1 mt-1">
                      Total cost €{fmt(totalCost)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization toggle */}
            <button
              onClick={() => setShowAmort(v => !v)}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline">
              <List size={12} />
              {showAmort ? 'Hide' : 'Show'} amortization schedule (first 12 months)
            </button>

            <AnimatePresence>
              {showAmort && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden">
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500">
                          {['Mo', 'Payment', 'Principal', 'Interest', 'Balance'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {amortRows.map(row => (
                          <tr key={row.month} className="border-t border-gray-50">
                            <td className="px-3 py-1.5 text-gray-500">{row.month}</td>
                            <td className="px-3 py-1.5 font-medium">€{fmt(row.payment)}</td>
                            <td className="px-3 py-1.5 text-blue-600">€{fmt(row.principal)}</td>
                            <td className="px-3 py-1.5 text-amber-600">€{fmt(row.interest)}</td>
                            <td className="px-3 py-1.5 text-gray-600">€{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pre-approve CTA */}
            <button onClick={onPreApprove}
              className="relative w-full overflow-hidden bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-sweep" />
              <span className="relative z-10">Get pre-approved at this rate</span>
              <ChevronRight size={14} className="relative z-10" />
            </button>
          </motion.div>
        ) : (
          <motion.div key="afford"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-5">

            <Slider label="Monthly budget" value={monthlyBudget} onChange={setMonthlyBudget} min={200} max={20000} step={50} />
            <Slider label="Down payment"   value={downPayment}   onChange={setDownPayment}   min={0}   max={500000} step={1000} />
            <Slider label="Interest rate"  value={interestRate}  onChange={setInterestRate}  min={1}   max={15}     step={0.05} prefix="" suffix="%" />

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Loan term</p>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(y => (
                  <button key={y} onClick={() => setLoanTerm(y)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      loanTerm === y
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {y}yr
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 rounded-xl p-4 text-white text-center">
              <p className="text-xs opacity-70 mb-1">You can afford up to</p>
              <p className="text-3xl font-bold">€{fmt(affordHomePrice)}</p>
              <p className="text-xs opacity-60 mt-1">
                Max loan €{fmt(affordPrincipal)} · {loanTerm}-year term
              </p>
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Assumes your €{fmt(monthlyBudget)}/mo covers principal & interest only. Property taxes,
              insurance and HOA fees will increase your actual monthly obligation.
            </p>

            <button onClick={onPreApprove}
              className="relative w-full overflow-hidden bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-sweep" />
              <span className="relative z-10">Check if I qualify</span>
              <ChevronRight size={14} className="relative z-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-gray-400 mt-3 text-center leading-relaxed">
        For illustrative purposes only. Contact an advisor for accurate rates.
      </p>
    </div>
  )
}

// ─── Pre-Approval Sheet ───────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: Building2 },
  { id: 'house',     label: 'House',     icon: Home },
  { id: 'villa',     label: 'Villa',     icon: Landmark },
  { id: 'commercial',label: 'Commercial',icon: Briefcase },
]

const EMPLOYMENT_OPTS = [
  { id: 'employed',     label: 'Employed' },
  { id: 'self-employed',label: 'Self-employed' },
  { id: 'retired',      label: 'Retired' },
  { id: 'other',        label: 'Other' },
]

function PreApprovalSheet({ open, onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    purpose: '', propertyType: '',
    homePrice: '', downPayment: '', income: '', employment: '',
    name: '', email: '', phone: '', agree: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClose = () => {
    onClose()
    setTimeout(() => { setStep(1); setForm({ purpose:'', propertyType:'', homePrice:'', downPayment:'', income:'', employment:'', name:'', email:'', phone:'', agree: false }) }, 400)
  }

  const [submitting, setSubmitting] = useState(false)

  const step1Valid  = form.purpose && form.propertyType
  const step2Valid  = form.homePrice && form.income && form.employment
  const step3Valid  = form.name && form.email && form.agree

  const fmt = v => Number(v).toLocaleString('en-EU', { maximumFractionDigits: 0 })

  const handleSubmit = async () => {
    if (!step3Valid || submitting) return
    setSubmitting(true)
    try {
      await api.post('/contact/general', {
        name:    form.name,
        email:   form.email,
        subject: `Mortgage pre-approval — ${form.purpose} / ${form.propertyType}`,
        message: `Phone: ${form.phone || '—'}
Purpose: ${form.purpose}
Property type: ${form.propertyType}
Home price: €${fmt(form.homePrice)}
Down payment: €${fmt(form.downPayment || 0)}
Annual income: €${fmt(form.income)}
Employment: ${form.employment}`,
      })
    } catch (e) {
      console.error('[Mortgage submit]', e)
    } finally {
      setSubmitting(false)
      setStep('success')
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:w-[480px] overflow-y-auto p-0">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <SheetTitle className="text-base font-bold text-gray-900">
              {step === 'success' ? 'Application received!' : 'Get pre-approved'}
            </SheetTitle>
            {step !== 'success' && (
              <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3 · No credit impact</p>
            )}
          </div>
          <SheetClose asChild>
            <button onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </SheetClose>
        </div>

        {/* Progress bar */}
        {step !== 'success' && (
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-blue-600 rounded-r-full"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}
              className="px-6 py-6 flex flex-col gap-6">

              {/* Purpose */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">What are you looking for?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'buy',       label: 'Buy a home',       icon: Home,     desc: 'Purchase a new property' },
                    { id: 'refinance', label: 'Refinance',        icon: RefreshCw,desc: 'Improve existing loan terms' },
                  ].map(({ id, label, icon: Icon, desc }) => (
                    <button key={id} onClick={() => set('purpose', id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.purpose === id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                        form.purpose === id ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        <Icon size={18} className={form.purpose === id ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Property type</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => set('propertyType', id)}
                      className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                        form.propertyType === id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        form.propertyType === id ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        <Icon size={15} className={form.propertyType === id ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!step1Valid}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                Continue <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}
              className="px-6 py-6 flex flex-col gap-5">

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Your finances</p>
                <p className="text-xs text-gray-400">This helps us find the right loan for you</p>
              </div>

              {[
                { label: 'Estimated home price (€)', key: 'homePrice', placeholder: 'e.g. 280,000' },
                { label: 'Down payment amount (€)',  key: 'downPayment', placeholder: 'e.g. 56,000' },
                { label: 'Annual household income (€)', key: 'income', placeholder: 'e.g. 45,000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input type="number" placeholder={placeholder} value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Employment status</label>
                <div className="grid grid-cols-2 gap-2">
                  {EMPLOYMENT_OPTS.map(({ id, label }) => (
                    <button key={id} onClick={() => set('employment', id)}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        form.employment === id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-blue-200'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} disabled={!step2Valid}
                  className="flex-[2] py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}
              className="px-6 py-6 flex flex-col gap-5">

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Contact info</p>
                <p className="text-xs text-gray-400">Your advisor will reach out within 1 business day</p>
              </div>

              {[
                { label: 'Full name',     key: 'name',  placeholder: 'John Smith',           type: 'text' },
                { label: 'Email address', key: 'email', placeholder: 'john@example.com',     type: 'email' },
                { label: 'Phone number',  key: 'phone', placeholder: '+357 99 000 000',      type: 'tel' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              ))}

              {/* Summary card */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                <p className="font-semibold text-gray-700 text-sm mb-2">Application summary</p>
                <div className="flex justify-between"><span>Purpose</span><span className="capitalize font-medium text-gray-800">{form.purpose}</span></div>
                <div className="flex justify-between"><span>Property type</span><span className="capitalize font-medium text-gray-800">{form.propertyType}</span></div>
                {form.homePrice && <div className="flex justify-between"><span>Home price</span><span className="font-medium text-gray-800">€{fmt(form.homePrice)}</span></div>}
                {form.income && <div className="flex justify-between"><span>Annual income</span><span className="font-medium text-gray-800">€{fmt(form.income)}</span></div>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)}
                  className="mt-0.5 accent-blue-600 w-4 h-4 rounded flex-shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <span className="text-blue-600 underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                  No credit check will be performed at this stage.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={handleSubmit} disabled={!step3Valid || submitting}
                  className="flex-[2] relative overflow-hidden py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                  <span className="relative z-10">{submitting ? 'Sending...' : 'Submit application'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="px-6 py-12 flex flex-col items-center text-center gap-5">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <Check size={36} className="text-emerald-600 stroke-[2.5]" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application received!</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  One of our mortgage advisors will reach out to {form.email || 'you'} within 1 business day
                  to discuss your options.
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-5 w-full text-left space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">What happens next</p>
                {[
                  'Advisor reviews your information',
                  'You receive a personalised rate quote',
                  'Pre-approval letter issued (same day)',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
              <button onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left gap-4 py-5">
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden">
            <p className="pb-5 text-gray-500 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Shared animation ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Aceternity: Tracing Beam ─────────────────────────────────────────────────
function TracingBeam({ children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Beam height tracks scroll
  const beamHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%'])
  const dotOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1])

  return (
    <div ref={ref} className="relative mx-auto max-w-4xl">
      {/* Left beam rail */}
      <div className="absolute left-0 top-0 bottom-0 hidden lg:flex flex-col items-center" style={{ width: '40px' }}>
        {/* Static rail */}
        <div className="flex-1 w-px bg-gray-200 relative overflow-hidden mt-2">
          <motion.div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{
              height: beamHeight,
              background: 'linear-gradient(to bottom, #3b82f6, #6366f1, #3b82f6)',
            }}
          />
        </div>
        {/* Dot at top */}
        <motion.div
          className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white absolute top-1.5"
          style={{ opacity: dotOpacity }}
        />
      </div>

      {/* Content offset on desktop */}
      <div className="lg:pl-14">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MortgagePage() {
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', y => setShowSticky(y > 600))

  const openSheet = () => setSheetOpen(true)

  return (
    <>
      <PreApprovalSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <div className="min-h-screen bg-white">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-14">

          {/* Left */}
          <motion.div className="flex-1" variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-5">
              <ShieldCheck size={12} /> Cyprus's #1 digital mortgage platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] mb-5">
              Get a mortgage that<br />
              <span className="text-blue-600">moves you home faster</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-lg leading-relaxed">
              Compare loan options, calculate your monthly payment, and get
              pre-approved in minutes with EstateHub Home Loans.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                <button onClick={openSheet}
                  className="relative flex items-center gap-2 overflow-hidden bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                  <span className="relative z-10">Get pre-approved</span>
                </button>
              </motion.div>
              <a href="#calculator"
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-7 py-3.5 rounded-full font-semibold text-sm hover:border-blue-300 hover:text-blue-600 transition-colors">
                Calculate payment
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <span className="text-sm font-semibold text-gray-900">4.9</span>
                <span className="text-sm text-gray-400">· 2,400+ reviews</span>
              </div>
              <span className="h-4 w-px bg-gray-200 hidden sm:block" />
              <span className="text-sm text-gray-500">🔒 No credit score impact</span>
              <span className="h-4 w-px bg-gray-200 hidden sm:block" />
              <span className="text-sm text-gray-500">⚡ 20 min pre-approval</span>
            </div>
          </motion.div>

          {/* Right — Calculator with Border Beam */}
          <motion.div
            id="calculator"
            className="flex-1 w-full max-w-md lg:max-w-[440px]"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
          >
            {/* Border Beam wrapper */}
            <div className="relative" style={{ padding: '1.5px', borderRadius: '1.1rem', background: 'rgba(147,197,253,0.4)' }}>
              {/* Spinning beam layer */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: '1.1rem' }}>
                <div className="absolute animate-border-beam" style={{
                  inset: '-100%',
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 72%, #3b82f6 82%, #93c5fd 90%, transparent 100%)',
                }} />
              </div>
              {/* Inner white card */}
              <div className="relative" style={{ borderRadius: 'calc(1.1rem - 1.5px)', overflow: 'hidden' }}>
                <MortgageCalculator onPreApprove={openSheet} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── TRUST CARDS ───────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-14 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users,      val: '12,000+', label: 'Home buyers helped', color: 'text-blue-600',    bg: 'bg-blue-50' },
                { icon: ShieldCheck,val: 'A+ Rating',label: 'Trusted lender',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Clock,      val: '20 min',  label: 'Pre-approval time',  color: 'text-amber-600',   bg: 'bg-amber-50' },
                { icon: Building2,  val: '€2B+',    label: 'Loans processed',    color: 'text-slate-600',   bg: 'bg-slate-100' },
              ].map(({ icon: Icon, val, label, color, bg }, i) => (
                <motion.div key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{val}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOAN OPTIONS ──────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Find the right mortgage for you
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">Compare our most popular loan options side by side</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LOAN_TYPES.map((loan, i) => (
              <motion.div key={i}
                className={`rounded-2xl border p-6 flex flex-col gap-5 transition-shadow cursor-default ${
                  loan.highlighted
                    ? 'border-blue-200 ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                    : 'border-gray-100 shadow-sm'
                }`}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                {loan.highlighted && (
                  <div className="text-xs text-center font-semibold text-blue-600 bg-blue-50 rounded-lg py-1 -mt-1">
                    ⭐ Recommended
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-900">{loan.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${loan.badgeColor}`}>
                    {loan.badge}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{loan.rate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">APR</p>
                    <p className="text-2xl font-bold text-gray-900">{loan.apr}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Points (cost)</p>
                    <p className="text-sm font-medium text-gray-600">{loan.points}</p>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {loan.perks.map((p, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-blue-600 stroke-[3]" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <button onClick={openSheet}
                    className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      loan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}>
                    Get pre-approved
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── COMPARISON ────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 border-y border-gray-100 py-24">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">EstateHub vs Traditional Bank</h2>
              <p className="text-gray-500">See why thousands of buyers choose us over traditional lenders</p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="grid grid-cols-3 bg-slate-50 border-b border-gray-100">
                <div className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide" />
                <div className="p-4 text-center">
                  <span className="text-sm font-bold text-blue-600">EstateHub</span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-sm font-semibold text-gray-400">Traditional Bank</span>
                </div>
              </div>
              {[
                { label: 'Approval time',    est: '20 minutes',       bank: '5–14 days' },
                { label: 'Process',          est: 'Fully digital',    bank: 'Often manual' },
                { label: 'Hidden fees',      est: 'None',             bank: 'Can vary' },
                { label: 'Advisor support',  est: 'Fast, dedicated',  bank: 'Office hours only' },
                { label: 'Rate comparison',  est: 'Multiple lenders', bank: 'One bank only' },
              ].map(({ label, est, bank }, i) => (
                <div key={i} className={`grid grid-cols-3 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <div className="px-5 py-4 text-sm text-gray-600 font-medium">{label}</div>
                  <div className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold text-blue-600 flex items-center justify-center gap-1">
                      <Check size={13} className="text-emerald-500 stroke-[3]" /> {est}
                    </span>
                  </div>
                  <div className="px-5 py-4 text-center text-sm text-gray-400">{bank}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        {/* ── Aceternity: Tracing Beam wraps the steps ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              How to get a mortgage with EstateHub
            </h2>
            <p className="text-gray-500">Four simple steps from start to close</p>
          </motion.div>

          <TracingBeam>
            <div className="flex flex-col gap-10">
              {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
                <motion.div key={i}
                  className="flex items-start gap-6 group"
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <motion.div
                    className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-shadow"
                    whileHover={{ scale: 1.08 }}>
                    <Icon size={24} className="text-white" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border-2 border-blue-600 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                      {n}
                    </span>
                  </motion.div>
                  <div className="pt-1">
                    <h3 className="font-bold text-gray-900 mb-1.5 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TracingBeam>
        </section>

        {/* ── ARTICLES ──────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 border-y border-gray-100 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div className="flex items-end justify-between mb-10"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Learn about home financing</h2>
                <p className="text-gray-500">Resources to help you make informed decisions</p>
              </div>
              <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                View all <ArrowRight size={14} />
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTICLES.map((a, i) => (
                <motion.div key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group"
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}>
                  <div className="overflow-hidden h-44">
                    <img src={a.img} alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start ${a.catColor}`}>
                      {a.cat}
                    </span>
                    <p className="font-semibold text-gray-900 leading-snug text-sm">{a.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                    <button className="mt-auto text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all group/btn">
                      Read article <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 py-24">
          <motion.div className="text-center mb-12"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently asked questions</h2>
            <p className="text-gray-500">
              Still have questions?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>
            </p>
          </motion.div>
          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </motion.div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
        <section className="bg-slate-50 border-y border-gray-100 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div className="text-center mb-12"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Buyers love EstateHub Home Loans
              </h2>
              <p className="text-gray-500">Real stories from real homeowners across Cyprus</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS.map((r, i) => (
                <motion.div key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(j => <Star key={j} size={14} fill="#f59e0b" className="text-amber-400" />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">"{r.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center bg-blue-600 rounded-3xl p-14 shadow-xl shadow-blue-200"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              Get pre-approved in minutes. No credit score impact, no commitment.
            </p>
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }} className="inline-block">
              <button onClick={openSheet}
                className="relative flex items-center gap-2 overflow-hidden bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-base hover:bg-blue-50 transition-colors">
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/40 to-transparent shimmer-sweep" />
                <span className="relative z-10">Get pre-approved — it's free</span>
                <ArrowRight size={16} className="relative z-10" />
              </button>
            </motion.div>
            <p className="text-blue-200 text-xs mt-5">
              🔒 Bank-level security · GDPR compliant · No commitment
            </p>
          </motion.div>
        </section>

        {/* ── STICKY CTA ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showSticky && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-6 right-6 z-40">
              <button onClick={openSheet}
                className="relative flex items-center gap-2 overflow-hidden bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-400/40 text-sm font-semibold hover:bg-blue-700 transition-colors">
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                <Zap size={14} className="relative z-10" />
                <span className="relative z-10">Get pre-approved</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
