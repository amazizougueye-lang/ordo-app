import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, Upload, User, LogOut } from 'lucide-react'
import { OrdoLogo } from '../OrdoLogo'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/today', icon: CalendarClock, label: "Aujourd'hui" },
  { to: '/upload', icon: Upload, label: 'Nouveau dossier' },
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
      style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #E2E8F0' }}>
        <OrdoLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #E2E8F0' }}>
        <NavLink
          to="/profil"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={16} strokeWidth={1.75} />
          Profil
        </NavLink>
        <button
          onClick={handleSignOut}
          className="nav-item w-full text-left mt-0.5"
          style={{ color: '#94A3B8' }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          Déconnexion
        </button>
        {user?.email && (
          <p
            className="text-[11px] mt-3 px-3 truncate"
            style={{ color: '#CBD5E1' }}
          >
            {user.email}
          </p>
        )}
      </div>
    </aside>
  )
}
