'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from 'motion/react'
import {
  Menu, X, Home, Search, Heart, LayoutDashboard,
  User, LogOut, Info, Shield, ChevronDown,
  MessageCircle, Plus, Banknote, Bell,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useSocket } from '@/context/SocketContext'

// ─── Stagger variants for desktop nav links ───────────────────────────────────
const navContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
}
const navItemVariant = {
  hidden:  { opacity: 0, y: -10, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.3, ease: 'easeOut' } },
}

// ─── DealLink — URL-synced Rent/Buy, with layoutId animated indicator ─────────
function DealLink({ status, label }) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const active = pathname === '/search' && searchParams.get('status') === status
  return (
    <Link
      href={`/search?status=${status}`}
      className={`group relative flex items-center self-stretch px-1 text-base font-medium transition-colors ${
        active ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
      }`}
    >
      {/* Animated sliding indicator — shares layoutId across all NavLinks */}
      {active ? (
        <motion.span
          layoutId="nav-indicator"
          className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600 rounded-b-sm"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      ) : (
        <span className="absolute top-0 left-0 right-0 h-[2px] rounded-b-sm bg-transparent group-hover:bg-blue-200 transition-colors duration-200" />
      )}
      {label}
    </Link>
  )
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const { notifications, unreadNotifCount, markAllRead, clearNotifications } = useSocket() || {}
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(v => !v)
    if (!open && unreadNotifCount > 0) markAllRead?.()
  }

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60)  return 'just now'
    if (s < 3600) return `${Math.floor(s/60)}m ago`
    return `${Math.floor(s/3600)}h ago`
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:border-blue-300 transition-colors"
      >
        <Bell size={15} className="text-gray-600" />
        {unreadNotifCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {notifications?.length > 0 && (
                  <button onClick={clearNotifications}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {!notifications?.length ? (
                  <div className="py-10 text-center">
                    <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <Link key={n.id} href={n.href || '/'} onClick={() => setOpen(false)}
                      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle size={14} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                        <p className="text-xs text-gray-400 truncate">{n.body}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(n.time)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount }  = useSocket() || {}
  const router   = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Scroll-aware glassmorphism ────────────────────────────────────────────
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))

  const handleLogout = () => {
    logout()
    router.push('/')
    setMobileOpen(false)
  }

  // ── Desktop NavLink with layoutId indicator ───────────────────────────────
  const NavLink = ({ href, children }) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`group relative flex items-center self-stretch px-1 text-base font-medium transition-colors ${
          active ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
        }`}
      >
        {active ? (
          <motion.span
            layoutId="nav-indicator"
            className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600 rounded-b-sm"
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          />
        ) : (
          <span className="absolute top-0 left-0 right-0 h-[2px] rounded-b-sm bg-transparent group-hover:bg-blue-200 transition-colors duration-200" />
        )}
        {children}
      </Link>
    )
  }

  // ── Mobile sheet link ─────────────────────────────────────────────────────
  const MobileLink = ({ href, icon: Icon, label, red = false, badge = 0 }) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        red
          ? 'text-red-500 hover:bg-red-50'
          : pathname === href
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
      }`}
    >
      <Icon size={17} className="flex-shrink-0" />
      {label}
      {badge > 0 && (
        <span className="ml-auto bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-stretch justify-between gap-4"
        style={{ minHeight: '64px' }}
      >

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="EstateHub home">
            <motion.svg
              width="32" height="32" viewBox="0 0 38 38" fill="#2563eb"
              xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
              whileHover={{ rotate: [0, -8, 6, 0], transition: { duration: 0.4 } }}
            >
              <rect x="24" y="6" width="3" height="7"/>
              <polygon points="2,19 19,4 36,19"/>
              <rect x="6" y="19" width="26" height="16"/>
              <rect x="8.5" y="21.5" width="5" height="4.5" fill="white"/>
              <rect x="24.5" y="21.5" width="5" height="4.5" fill="white"/>
              <rect x="15.5" y="26" width="7" height="9" fill="white"/>
              <circle cx="21.5" cy="30.5" r="0.9" fill="#2563eb"/>
              <rect x="1" y="29" width="2.5" height="6"/>
              <rect x="1" y="31.5" width="7" height="1.8"/>
            </motion.svg>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">
              Estate<span className="text-gray-800">Hub</span>
            </span>
          </Link>
        </motion.div>

        {/* ── Desktop nav links (staggered entrance) ───────────────────────── */}
        <motion.div
          className="hidden md:flex items-stretch gap-5"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={navItemVariant} className="flex items-stretch">
            <DealLink status="rent" label="Rent" />
          </motion.div>
          <motion.div variants={navItemVariant} className="flex items-stretch">
            <DealLink status="sale" label="Buy" />
          </motion.div>

          {user ? (
            <>
              <motion.div variants={navItemVariant} className="flex items-stretch">
                <NavLink href="/favorites">Saved</NavLink>
              </motion.div>
              <motion.div variants={navItemVariant} className="flex items-stretch">
                <NavLink href="/mortgage">Get a mortgage</NavLink>
              </motion.div>
              <motion.div variants={navItemVariant} className="flex items-stretch">
                <NavLink href="/dashboard">Dashboard</NavLink>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={navItemVariant} className="flex items-stretch">
                <NavLink href="/mortgage">Get a mortgage</NavLink>
              </motion.div>
              <motion.div variants={navItemVariant} className="flex items-stretch">
                <NavLink href="/about">About us</NavLink>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* ── Desktop right ─────────────────────────────────────────────────── */}
        <motion.div
          className="hidden md:flex items-center gap-3 self-center"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        >
          {user ? (
            <>
              {/* + Add Listing — shimmer CTA (MagicUI-inspired) */}
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                <Link
                  href="/listings/create"
                  className="relative flex items-center gap-1.5 overflow-hidden bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  {/* Shimmer sweep */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent shimmer-sweep"
                  />
                  <Plus size={15} strokeWidth={2.5} className="relative z-10" />
                  <span className="relative z-10">Add listing</span>
                </Link>
              </motion.div>

              {/* Bell notifications */}
              <NotificationBell />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:border-blue-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[90px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} className="text-gray-400" />
                  </motion.button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="pb-1">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400 font-normal">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User size={14} /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer">
                      <MessageCircle size={14} /> Messages
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                          <Shield size={14} /> Admin panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer">
                    <LogOut size={14} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Sign in
              </Link>
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                <Link
                  href="/register"
                  className="relative flex items-center overflow-hidden text-base font-semibold bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep"
                  />
                  <span className="relative z-10">Get started</span>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* ── Mobile: burger / sheet ─────────────────────────────────────────── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden self-center flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] flex flex-col pt-8">

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 pb-5 mb-2 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
              <MobileLink href="/"        icon={Home}    label="Home" />
              <MobileLink href="/search"  icon={Search}  label="Search" />
              <MobileLink href="/mortgage" icon={Banknote} label="Get a mortgage" />

              {user ? (
                <>
                  <div className="my-1.5 border-t border-gray-100" />
                  <MobileLink href="/favorites"  icon={Heart}           label="Saved" />
                  <MobileLink href="/dashboard"  icon={LayoutDashboard} label="Dashboard" />
                  <MobileLink href="/messages"   icon={MessageCircle}   label="Messages" badge={unreadCount} />
                  <MobileLink href="/profile"    icon={User}            label="My account" />
                  {user.role === 'admin' && (
                    <MobileLink href="/admin" icon={Shield} label="Admin panel" red />
                  )}
                </>
              ) : (
                <MobileLink href="/about" icon={Info} label="About us" />
              )}
            </nav>

            {/* Bottom actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/listings/create"
                    onClick={() => setMobileOpen(false)}
                    className="relative flex items-center justify-center gap-2 h-10 overflow-hidden rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                    <Plus size={15} strokeWidth={2.5} className="relative z-10" />
                    <span className="relative z-10">Add listing</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={17} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="relative flex items-center justify-center h-10 overflow-hidden rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
                    <span className="relative z-10">Get started</span>
                  </Link>
                </>
              )}
            </div>

          </SheetContent>
        </Sheet>

      </div>
    </motion.nav>
  )
}
