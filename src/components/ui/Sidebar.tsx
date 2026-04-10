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
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: '#FFFFFF', borderRight: '1px solid #F1F5F9' }}
    >
      {/* Logo */}
      <div className="px-5 h-[60px] flex items-center" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <OrdoLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
          >
            {({ isActive }) => (
              <span
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? '#F1F5F9' : 'transparent',
                  color: isActive ? '#0F172A' : '#94A3B8',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.color = '#475569'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
                {label}
              </span>
            )}
          </NavLink>
        ))}

        {/* Separator */}
        <div className="my-3" style={{ height: 1, background: '#F1F5F9' }} />

        {/* New case CTA */}
        <NavLink to="/upload">
          {({ isActive }) => (
            <span
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: isActive ? '#EFF6FF' : 'transparent',
                color: isActive ? '#2563EB' : '#3B82F6',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#EFF6FF'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Plus size={15} strokeWidth={1.75} />
              Nouveau dossier
            </span>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
        <NavLink to="/profil">
          {({ isActive }) => (
            <span
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer mb-0.5"
              style={{
                background: isActive ? '#F1F5F9' : 'transparent',
                color: isActive ? '#0F172A' : '#94A3B8',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.color = '#475569'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94A3B8'
                }
              }}
            >
              <User size={15} strokeWidth={1.75} />
              Profil
            </span>
          )}
        </NavLink>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 w-full text-left"
          style={{ color: '#CBD5E1' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#EF4444'
            e.currentTarget.style.background = '#FFF5F5'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#CBD5E1'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={15} strokeWidth={1.75} />
          Déconnexion
        </button>

        {user?.email && (
          <p className="text-[10px] mt-3 px-3 truncate" style={{ color: '#E2E8F0' }}>
            {user.email}
          </p>
        )}
      </div>
    </aside>
  )
}
