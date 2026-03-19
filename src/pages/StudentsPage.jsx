import { useState } from 'react'
import { Plus, Trash2, QrCode, RefreshCw, X, Download, Users, Search } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import useStore from '../store'
import { useToast } from '../components/Toast'

function StudentModal({ student, onClose }) {
  const addStudent = useStore(s => s.addStudent)
  const updateStudent = useStore(s => s.updateStudent)
  const classes = useStore(s => s.classes)
  const { show } = useToast()
  const isEdit = !!student?.id

  const [form, setForm] = useState({
    name: student?.name || '',
    studentId: student?.studentId || '',
    email: student?.email || '',
    classId: student?.classId || (classes[0]?.id || ''),
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (isEdit) { updateStudent(student.id, form); show('Student updated') }
    else { addStudent(form); show('Student added') }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ display: 'flex', flexDirection: 'column', padding: 0, maxHeight: '85dvh' }}>
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 24px 8px', WebkitOverflowScrolling: 'touch' }}>
          <div className="modal-title">
            {isEdit ? 'Edit Student' : 'Add Student'}
            <button onClick={onClose} style={{ color: 'var(--text2)' }}><X size={18} /></button>
          </div>
          <form id="student-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full name *</label>
              <input placeholder="e.g. Juan dela Cruz" value={form.name} onChange={e => update('name', e.target.value)} required autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input placeholder="e.g. 2024-0001" value={form.studentId} onChange={e => update('studentId', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" placeholder="student@school.edu" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ paddingBottom: 8 }}>
              <label className="form-label">Class *</label>
              <select value={form.classId} onChange={e => update('classId', e.target.value)} required>
                <option value="">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section && `(${c.section})`}</option>)}
              </select>
            </div>
          </form>
        </div>
        <div style={{
          padding: '12px 24px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <button type="submit" form="student-form" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {isEdit ? 'Save changes' : 'Add student'}
          </button>
        </div>
      </div>
    </div>
  )
}

function QRModal({ student, onClose }) {
  const regenerateQR = useStore(s => s.regenerateQR)
  const { show } = useToast()
  const classes = useStore(s => s.classes)
  const cls = classes.find(c => c.id === student.classId)

  const qrData = JSON.stringify({ id: student.id, token: student.qrToken, name: student.name })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ textAlign: 'center' }}>
        <div className="modal-title">
          Student QR Code
          <button onClick={onClose} style={{ color: 'var(--text2)' }}><X size={18} /></button>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          display: 'inline-block',
          marginBottom: 16,
        }}>
          <QRCodeSVG value={qrData} size={200} level="H" />
        </div>
        <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 16 }}>{student.name}</div>
        {student.studentId && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>ID: {student.studentId}</div>}
        {cls && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>{cls.name} {cls.section && `· ${cls.section}`}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            regenerateQR(student.id)
            show('QR code regenerated')
          }}>
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
        <div style={{
          marginTop: 16, padding: '8px 12px',
          background: 'var(--bg)',
          borderRadius: 6,
          fontSize: 11,
          color: 'var(--text3)',
          fontFamily: 'var(--font-mono)',
          wordBreak: 'break-all',
        }}>{student.qrToken}</div>
      </div>
    </div>
  )
}

export default function StudentsPage() {
  const students = useStore(s => s.students)
  const classes = useStore(s => s.classes)
  const deleteStudent = useStore(s => s.deleteStudent)
  const { show } = useToast()
  const [modal, setModal] = useState(null)
  const [qrModal, setQrModal] = useState(null)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId?.includes(search)
    const matchClass = !filterClass || s.classId === filterClass
    return matchSearch && matchClass
  })

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} enrolled</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Filters */}
      {students.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            <input placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }} />
          </div>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: 'auto', flexShrink: 0 }}>
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          <Users size={40} />
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text2)' }}>No students yet</p>
          <p>Add students and generate QR codes for attendance</p>
          {classes.length === 0 && <p style={{ marginTop: 8, fontSize: 12 }}>⚠️ Create a class first</p>}
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('new')} disabled={classes.length === 0}>
            <Plus size={15} /> Add student
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={32} />
          <p>No students match your search</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(student => {
            const cls = classes.find(c => c.id === student.classId)
            return (
              <div key={student.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${cls?.color || 'var(--accent)'}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cls?.color || 'var(--accent)', fontWeight: 700, fontSize: 13,
                }}>
                  {student.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{student.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', gap: 8 }}>
                    {student.studentId && <span>{student.studentId}</span>}
                    {cls && <span style={{ color: cls.color }}>{cls.name}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setQrModal(student)} title="View QR">
                    <QrCode size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(student)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (confirm(`Remove "${student.name}"?`)) {
                      deleteStudent(student.id); show('Student removed', 'error')
                    }
                  }}><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && <StudentModal student={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
      {qrModal && <QRModal student={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  )
}