import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, User, LogOut, Calendar, BarChart3, Plus } from 'lucide-react'
import { OrdoLogo } from '../OrdoLogo'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/today', icon: CalendarClock, label: "Aujourd'hui" },
  { to: '/calendar', icon: Calendar, label: 'Calendrier' },
  { to: '/stats', icon: BarChart3, label: 'Statistiques' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: '#FAFAFA', borderRight: '1px solid #EBEBEB' }}
    >
      {/* Logo area */}
      <div className="h-[56px] px-6 flex items-center">
        <OrdoLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col overflow-y-auto">

        {/* New dossier — top CTA */}
        <NavLink to="/upload" end>
          {({ isActive }) => (
            <span
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium mb-4 transition-all duration-150 cursor-pointer"
              style={{
                background: isActive ? '#1E293B' : '#0F172A',
                color: '#FFFFFF',
                boxShadow: isActive ? 'none' : '0 1px 3px rgba(15,23,42,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1E293B'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0F172A'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.2)'
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouveau dossier
            </span>
          )}
        </NavLink>

        {/* Nav section label */}
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#C4C4C4' }}>
          Navigation
        </p>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}>
            {({ isActive }) => (
              <span
                className="flex items-center gap-3 px-3 rounded-lg text-[13px] font-medium transition-all duration-100 cursor-pointer relative"
                style={{
                  height: 36,
                  background: isActive ? '#F0F0F0' : 'transparent',
                  color: isActive ? '#0F172A' : '#9B9B9B',
                  marginBottom: 1,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F5F5F5'
                    e.currentTarget.style.color = '#3F3F3F'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#9B9B9B'
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-sm"
                    style={{ width: 3, height: 18, background: '#0F172A' }}
                  />
                )}
                <Icon size={14} strokeWidth={isActive ? 2 : 1.75} style={{ flexShrink: 0 }} />
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 flex flex-col gap-0.5" style={{ borderTop: '1px solid #EBEBEB' }}>
        <NavLink to="/profil">
          {({ isActive }) => (
            <span
              className="flex items-center gap-3 px-3 rounded-lg text-[13px] font-medium transition-all duration-100 cursor-pointer"
              style={{
                height: 36,
                background: isActive ? '#F0F0F0' : 'transparent',
                color: isActive ? '#0F172A' : '#9B9B9B',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F5F5F5'
                  e.currentTarget.style.color = '#3F3F3F'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#9B9B9B'
                }
              }}
            >
              <User size={14} strokeWidth={1.75} />
              Profil
            </span>
          )}
        </NavLink>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 rounded-lg text-[13px] font-medium transition-all duration-100 w-full text-left"
          style={{ height: 36, color: '#C4C4C4', background: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#EF4444'
            e.currentTarget.style.background = '#FFF5F5'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#C4C4C4'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Déconnexion
        </button>

        {user?.email && (
          <p className="text-[10px] px-3 pt-2 truncate" style={{ color: '#D4D4D4' }}>
            {user.email}
          </p>
        )}
      </div>
    </aside>
  )
}
