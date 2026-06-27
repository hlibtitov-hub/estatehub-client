import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { ToastProvider } from '@/context/ToastContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'EstateHub — Find Your Perfect Home in Cyprus',
    template: '%s | EstateHub',
  },
  description: 'Browse thousands of verified apartments, houses and studios for rent and sale in Cyprus. EstateHub — the fastest way to find your next home.',
  keywords: ['real estate', 'Cyprus', 'apartments', 'houses', 'rent', 'buy', 'Limassol', 'Nicosia', 'Paphos'],
  authors: [{ name: 'EstateHub' }],
  creator: 'EstateHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://estatehub.cy',
    siteName: 'EstateHub',
    title: 'EstateHub — Find Your Perfect Home in Cyprus',
    description: 'Browse thousands of verified apartments, houses and studios for rent and sale in Cyprus.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EstateHub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstateHub — Find Your Perfect Home in Cyprus',
    description: 'Browse thousands of verified properties for rent and sale in Cyprus.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <TooltipProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
                <Footer />
                <Toaster position="bottom-right" richColors closeButton />
              </TooltipProvider>
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}