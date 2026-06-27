'use client'

import { useState } from 'react'
import api from '@/lib/api'

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/contact/general', form)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const CONTACTS = [
    {
      label: 'Email',
      value: 'support@estatehub.cy',
      href: 'mailto:support@estatehub.cy',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: 'Phone',
      value: '+357 25 123 456',
      href: 'tel:+35725123456',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
    {
      label: 'Office',
      value: 'Limassol, Cyprus',
      href: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact us</h1>
        <p className="text-gray-500">Have a question or need help? We typically respond within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Contact info */}
        <div className="flex flex-col gap-4">
          {CONTACTS.map((c) => (
            <div key={c.label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {c.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{c.value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-2">
            <p className="text-sm font-semibold text-blue-800 mb-1">Working hours</p>
            <p className="text-sm text-blue-600">Mon – Fri: 9:00 – 18:00</p>
            <p className="text-sm text-blue-600">Sat: 10:00 – 14:00</p>
          </div>
        </div>

        {/* Form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mb-3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Message sent!</h3>
            <p className="text-sm text-gray-500">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            {[
              { name: 'name', label: 'Your name', type: 'text', placeholder: 'John Doe' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
              { name: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input
                  type={type}
                  value={form[name]}
                  onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={4}
                placeholder="Tell us more…"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-10 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

      </div>
    </main>
  )
}
