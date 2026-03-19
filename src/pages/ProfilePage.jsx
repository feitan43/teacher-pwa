import { useState } from 'react'
import { User, Save, LogOut, BookOpen, Users, ClipboardList } from 'lucide-react'
import useStore from '../store'
import { useToast } from '../components/Toast'

export default function ProfilePage() {
  const teacher = useStore(s => s.teacher)
  const updateTeacher = useStore(s => s.updateTeacher)
  const setTeacher = useStore(s => s.setTeacher)
  const classes = useStore(s => s.classes)
  const students = useStore(s => s.students)
  const attendance = useStore(s => s.attendance)
  const { show } = useToast()

  const [form, setForm] = useState({ ...teacher })
  const [editing, setEditing] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    updateTeacher(form)
    setEditing(false)
    show('Profile updated')
  }

  const reset = () => {
    if (confirm('Reset all app data? This cannot be undone.')) {
      setTeacher(null)
      localStorage.removeItem('classpulse-store')
      window.location.reload()
    }
  }

  const stats = [
    { label: 'Classes', value: classes.length, icon: BookOpen, color: '#3b82f6' },
    { label: 'Students', value: students.length, icon: Users, color: '#06b6d4' },
    { label: 'Attendance records', value: attendance.length, icon: ClipboardList, color: '#10b981' },
  ]

  return (
    <div className="page fade-up">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>}
      </div>

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 12px',
          boxShadow: '0 0 0 4px var(--surface), 0 0 0 6px var(--accent)',
        }}>
          {teacher?.name?.charAt(0) || '?'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{teacher?.name}</div>
        {teacher?.subject && <div style={{ fontSize: 13, color: 'var(--accent)', marginTop: 2 }}>{teacher.subject}</div>}
        {teacher?.school && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{teacher.school}</div>}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 14 }}>
            <Icon size={16} color={color} style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input value={form.subject || ''} onChange={e => update('subject', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">School</label>
            <input value={form.school || ''} onChange={e => update('school', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={save}>
              <Save size={14} /> Save
            </button>
            <button className="btn btn-ghost" onClick={() => { setForm({...teacher}); setEditing(false) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Name', value: teacher?.name },
            { label: 'Subject', value: teacher?.subject },
            { label: 'School', value: teacher?.school },
            { label: 'Email', value: teacher?.email },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: 70 }}>{label}</span>
              <span style={{ fontSize: 14 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Danger zone */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Danger zone</div>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={reset}>
          <LogOut size={14} /> Reset all data
        </button>
        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>This will erase all classes, students, and attendance records.</p>
      </div>

      {/* PWA install hint */}
      <div style={{ marginTop: 24, padding: 14, borderRadius: 10, border: '1px dashed var(--border)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>📲 Install as app</div>
        <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
          On Android: tap ⋮ → "Add to Home Screen"<br />
          On iOS Safari: tap ⎦ → "Add to Home Screen"
        </p>
      </div>
    </div>
  )
}
