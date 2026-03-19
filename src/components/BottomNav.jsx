import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, ClipboardList, User } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-h)',
      background: 'rgba(8,12,20,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '8px 0',
            color: isActive ? 'var(--accent)' : 'var(--text3)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          })}>
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
