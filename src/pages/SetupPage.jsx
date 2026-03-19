import { useState } from 'react'
import useStore from '../store'

export default function SetupPage() {
  const setTeacher = useStore(s => s.setTeacher)
  const [form, setForm] = useState({ name: '', subject: '', school: '', email: '' })
  const [step, setStep] = useState(1)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setTeacher({ ...form, createdAt: new Date().toISOString() })
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>⚡</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>ClassPulse</h1>
          <p style={{ color: 'var(--text2)', marginTop: 6, fontSize: 14 }}>Set up your teacher profile to get started</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Your full name *</label>
              <input
                placeholder="e.g. Maria Santos"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Department</label>
              <input placeholder="e.g. Mathematics" value={form.subject} onChange={e => update('subject', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">School</label>
              <input placeholder="e.g. Mindanao State University" value={form.school} onChange={e => update('school', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" placeholder="teacher@school.edu" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
            Launch ClassPulse →
          </button>
        </form>
      </div>
    </div>
  )
}
