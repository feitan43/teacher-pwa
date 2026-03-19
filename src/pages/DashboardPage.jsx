import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, QrCode, TrendingUp, ChevronRight, Zap } from 'lucide-react'
import useStore from '../store'
import { format } from 'date-fns'

export default function DashboardPage() {
  const navigate = useNavigate()
  const teacher = useStore(s => s.teacher)
  const classes = useStore(s => s.classes)
  const students = useStore(s => s.students)
  const attendance = useStore(s => s.attendance)
  const setActiveSession = useStore(s => s.setActiveSession)

  const today = format(new Date(), 'EEEE, MMM d')
  const todayStr = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter(a => a.date === todayStr)

  const recentClasses = [...classes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)

  const startQuickScan = (cls) => {
    const sessionId = `${cls.id}-${todayStr}`
    setActiveSession({ classId: cls.id, sessionId, className: cls.name })
    navigate('/scan')
  }

  return (
    <div className="page fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{today}</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Hey, {teacher?.name?.split(' ')[0]} 👋</h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Classes', value: classes.length, icon: BookOpen, color: '#3b82f6' },
          { label: 'Students', value: students.length, icon: Users, color: '#06b6d4' },
          { label: 'Today', value: todayAttendance.length, icon: TrendingUp, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <Icon size={18} color={color} style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick scan */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quick Scan</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/classes')}>Manage →</button>
        </div>
        {classes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 28, color: 'var(--text3)' }}>
            <BookOpen size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: 13 }}>No classes yet. <button onClick={() => navigate('/classes')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Add one →</button></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentClasses.map(cls => {
              const classStudents = students.filter(s => s.classId === cls.id)
              const sessionId = `${cls.id}-${todayStr}`
              const scanned = attendance.filter(a => a.sessionId === sessionId).length
              return (
                <div key={cls.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg, ${cls.color || 'var(--accent)'}33, ${cls.color || 'var(--accent)'}11)`,
                    border: `1px solid ${cls.color || 'var(--accent)'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cls.color || 'var(--accent)', fontWeight: 700, fontSize: 13,
                  }}>
                    {cls.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{scanned}/{classStudents.length} scanned today</div>
                  </div>
                  <button onClick={() => startQuickScan(cls)} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                    <QrCode size={13} /> Scan
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Add Class', icon: BookOpen, color: '#3b82f6', to: '/classes' },
            { label: 'Add Student', icon: Users, color: '#06b6d4', to: '/students' },
            { label: 'View QR Codes', icon: QrCode, color: '#8b5cf6', to: '/students' },
            { label: 'Attendance Log', icon: TrendingUp, color: '#10b981', to: '/attendance' },
          ].map(({ label, icon: Icon, color, to }) => (
            <button key={label} onClick={() => navigate(to)} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, textAlign: 'left', width: '100%', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
