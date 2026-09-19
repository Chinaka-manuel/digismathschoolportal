import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LogOut, Menu, Search, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../hooks/useTheme'

export default function PortalLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'

  const signOut = async () => { await logout() }

  return (
    <div className={isDark ? 'min-h-screen bg-[#18231f] text-[#edf1e7]' : 'min-h-screen bg-[#f5f3ed] text-ink'}>
      <aside className={sidebarOpen ? 'fixed inset-y-0 left-0 z-20 w-72 bg-[#192a24] p-6 text-white shadow-xl' : 'fixed inset-y-0 left-0 z-20 hidden w-72 bg-[#192a24] p-6 text-white lg:block'}>
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-sun text-forest">N</span> northbridge</div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X size={18} /></button>
        </div>
        <p className="mb-4 text-[10px] uppercase tracking-[.15em] text-sun">Portal</p>
        <nav className="space-y-1 text-sm text-white/70">
          {[
            { to: '/portal', label: 'Overview', end: true },
            { to: '/portal/profile', label: 'Profile' },
            { to: '/portal/results', label: 'Results' },
            { to: '/portal/id-card', label: 'ID Card' },
            { to: '/portal/notifications', label: 'Notifications' },
            { to: '/portal/payments', label: 'Payments' },
          ].map((item, index) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 ${index === 0 && !item.end ? 'bg-white/10 text-white hover:bg-white/10' : isActive ? 'bg-white/10 text-white hover:bg-white/10' : 'hover:bg-white/10 hover:text-white'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-sun opacity-70" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-5">
          <button className="flex w-full items-center gap-3 border-t border-white/15 px-3 pt-5 text-sm text-white/70 hover:text-white" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      {sidebarOpen && <button className="fixed inset-0 z-10 bg-black/30 lg:hidden" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:pl-72">
        <header className={`flex h-20 items-center justify-between border-b px-6 lg:px-10 ${isDark ? 'border-[#3a4b43] bg-[#18231f]' : 'border-[#d8d9d0] bg-[#f5f3ed]'}`}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
            <div>
              <p className={`text-[10px] uppercase tracking-[.15em] ${isDark ? 'text-[#a3b0a5]' : 'text-forest'}`}>Northbridge portal</p>
              <h1 className={`font-display text-2xl ${isDark ? 'text-white' : 'text-ink'}`}>Good morning, {user?.name?.split(' ')[0] || 'there'}.</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={`rounded-full border p-2 ${isDark ? 'border-[#3a4b43] text-[#edf1e7]' : 'border-[#d8d9d0] text-ink'}`} aria-label="Search"><Search size={16} /></button>
            <span className={`grid h-9 w-9 place-items-center rounded-full text-sm ${isDark ? 'bg-forest text-white' : 'bg-forest text-white'}`}>{user?.name?.[0] || 'U'}</span>
          </div>
        </header>
        <main className={`p-6 lg:p-10 ${isDark ? 'text-[#edf1e7]' : 'text-ink'}`}>{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
