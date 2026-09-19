import { useState, useRef, useEffect } from 'react'
import { ArrowRight, BookOpen, Menu, MessageCircle, Moon, Sparkles, Sun, X } from 'lucide-react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../hooks/useTheme'

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(true)
  const bannerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user } = useAuthStore()
  const { theme, setTheme, resolved } = useTheme()
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: async () => (await api.get('/v1/settings/public')).data })
  const social = settings.data?.data?.socialLinks || {}
  const whatsapp = settings.data?.data?.whatsappNumber || ''
  const whatsappMessage = settings.data?.data?.whatsappDefaultMessage || 'Hello, I am interested in Northbridge International School.'

  useEffect(() => {
    const banner = bannerRef.current
    if (!banner) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setBannerVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(banner)
    return () => observer.disconnect()
  }, [])

  const navItems = [
    { label: 'About', to: '/about' },
    { label: 'Academics', to: '/academics' },
    { label: 'Admissions', to: '/admissions' },
    { label: 'News', to: '/news' },
    { label: 'Contact', to: '/contact' },
  ]

  return (
    <main className={resolved === 'dark' ? 'min-h-screen bg-[#18231f] text-[#edf1e7]' : 'min-h-screen bg-paper text-ink'}>
      <div ref={bannerRef} className="flex justify-center gap-8 bg-sun px-[5.5%] py-2 text-[10px] uppercase tracking-[.08em] max-sm:text-center overflow-hidden">
        <div className="marquee-track items-center gap-8">
          <span className="flex items-center gap-2">Admissions for 2026-27 are open <ArrowRight size={14} /></span>
          <span className="max-sm:hidden">{settings.data?.data?.schoolName || 'Northbridge International School'}</span>
          <span className="flex items-center gap-2">Admissions for 2026-27 are open <ArrowRight size={14} /></span>
          <span className="max-sm:hidden">{settings.data?.data?.schoolName || 'Northbridge International School'}</span>
        </div>
      </div>
      <header className={`fixed left-0 right-0 z-50 flex h-[78px] items-center justify-between border-b border-[#d8d9d0] px-[5.5%] backdrop-blur-md transition-all duration-300 max-sm:h-[68px] dark:border-[#3a4b43] ${bannerVisible ? 'top-8' : 'top-0'}`} style={{ backgroundColor: resolved === 'dark' ? 'rgba(24,35,31,0.85)' : 'rgba(245,243,237,0.85)' }}>
        <Link className="flex items-center gap-2 text-xl font-semibold tracking-[-.04em]" to="/" aria-label="Northbridge home">
          <span className="grid h-[31px] w-[31px] place-items-center rounded-full bg-forest text-sun"><Sparkles size={17} /></span>
          <span>northbridge<small className="block text-[7px] font-medium tracking-[.2em]">INTERNATIONAL SCHOOL</small></span>
        </Link>
        <nav className={menuOpen ? 'absolute left-0 right-0 top-[68px] z-10 flex flex-col gap-5 border-b border-[#d8d9d0] bg-paper px-[8%] py-5 text-sm text-[#69736c] md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0 dark:border-[#3a4b43] dark:bg-[#18231f]' : 'hidden items-center gap-7 text-sm text-[#69736c] md:flex'}>
          {navItems.map((item) => (
            <Link key={item.label} className={`flex items-center gap-1 hover:text-forest ${location.pathname === item.to ? 'text-forest' : ''}`} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="p-2" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link to="/login"><button className="hidden items-center gap-2 border-l border-[#d8d9d0] pl-5 text-sm md:flex">{user ? user.name : 'Portal login'} <ArrowRight size={16} /></button></Link>
          <button className="p-2 md:hidden" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      <div className={`transition-all duration-300 ${bannerVisible ? 'h-[110px]' : 'h-[78px]'} max-sm:h-auto`} aria-hidden="true" />
      {children ?? <Outlet />}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-green-600 text-white shadow-xl"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      )}
      <footer className="bg-[#192a24] px-[5.5%] pb-5 pt-16 text-[#eef0e5]" id="contact">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1.2fr_1fr]">
          <div className="flex items-start gap-2 text-xl font-semibold tracking-[-.04em]">
            <span className="grid h-[31px] w-[31px] place-items-center rounded-full bg-forest text-sun"><Sparkles size={17} /></span>
            <span>{settings.data?.data?.schoolName || 'northbridge'}<small className="block text-[7px] font-medium tracking-[.2em]">INTERNATIONAL SCHOOL</small></span>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[.15em] text-sun">Visit us</p>
            <p className="text-sm leading-relaxed text-[#bdc9c0]">{settings.data?.data?.address || '14 Orchard Lane'}<br />{settings.data?.data?.phone || '+234 800 555 0198'}</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[.15em] text-sun">Say hello</p>
            <p className="text-sm leading-relaxed text-[#bdc9c0]">{settings.data?.data?.email || 'hello@northbridge.edu'}<br />{whatsapp || '+234 800 555 0198'}</p>
            <div className="mt-3 flex gap-3">
              {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="text-[#bdc9c0] hover:text-sun" aria-label="Facebook">Facebook</a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-[#bdc9c0] hover:text-sun" aria-label="Instagram">Instagram</a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="text-[#bdc9c0] hover:text-sun" aria-label="Twitter">X</a>}
              {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="text-[#bdc9c0] hover:text-sun" aria-label="YouTube">YouTube</a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-[#bdc9c0] hover:text-sun" aria-label="LinkedIn">LinkedIn</a>}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[.15em] text-sun">Explore</p>
            <Link className="block text-sm leading-relaxed text-[#bdc9c0] hover:text-sun" to="/about">About us</Link>
            <Link className="block text-sm leading-relaxed text-[#bdc9c0] hover:text-sun" to="/admissions">Admissions</Link>
            <Link className="block text-sm leading-relaxed text-[#bdc9c0] hover:text-sun" to="/academics">Academics</Link>
          </div>
        </div>
        <div className="mt-14 flex justify-between gap-4 border-t border-[#3a4b43] pt-4 text-[11px] text-[#819188] max-sm:flex-col">
          <span>© 2026 {settings.data?.data?.schoolName || 'Northbridge International School'}</span>
          <span className="flex items-center gap-2">Designed for curious minds <BookOpen size={15} /></span>
        </div>
      </footer>
    </main>
  )
}
