import { useState } from 'react'
import { Plus, Trash2, BookOpen, Clock, Users, X } from 'lucide-react'
import useStore from '../store'
import { useToast } from '../components/Toast'

const COLORS = ['#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function ClassModal({ cls, onClose }) {
  const addClass = useStore(s => s.addClass)
  const updateClass = useStore(s => s.updateClass)
  const { show } = useToast()
  const isEdit = !!cls?.id

  const [form, setForm] = useState({
    name: cls?.name || '',
    section: cls?.section || '',
    room: cls?.room || '',
    schedule: cls?.schedule || '',
    days: cls?.days || [],
    timeStart: cls?.timeStart || '',
    timeEnd: cls?.timeEnd || '',
    color: cls?.color || COLORS[0],
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = (d) => setForm(f => ({
    ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d]
  }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (isEdit) { updateClass(cls.id, form); show('Class updated') }
    else { addClass(form); show('Class created') }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ display: 'flex', flexDirection: 'column', padding: 0, maxHeight: '85dvh' }}>
        {/* Scrollable form area */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 24px 8px', WebkitOverflowScrolling: 'touch' }}>
          <div className="modal-title">
            {isEdit ? 'Edit Class' : 'New Class'}
            <button onClick={onClose} style={{ color: 'var(--text2)' }}><X size={18} /></button>
          </div>
          <form id="class-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Class name *</label>
              <input placeholder="e.g. Mathematics 101" value={form.name} onChange={e => update('name', e.target.value)} required autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Section</label>
                <input placeholder="e.g. BSIT-2A" value={form.section} onChange={e => update('section', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <input placeholder="e.g. Room 204" value={form.room} onChange={e => update('room', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start time</label>
                <input type="time" value={form.timeStart} onChange={e => update('timeStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End time</label>
                <input type="time" value={form.timeEnd} onChange={e => update('timeEnd', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Days</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS.map(d => (
                  <button type="button" key={d} onClick={() => toggleDay(d)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      border: '1px solid',
                      borderColor: form.days.includes(d) ? form.color : 'var(--border)',
                      background: form.days.includes(d) ? `${form.color}22` : 'transparent',
                      color: form.days.includes(d) ? form.color : 'var(--text2)',
                      transition: 'all 0.15s',
                    }}>{d}</button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ paddingBottom: 8 }}>
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <button type="button" key={c} onClick={() => update('color', c)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, background: c,
                      border: form.color === c ? '2px solid white' : '2px solid transparent',
                      outline: form.color === c ? `2px solid ${c}` : 'none',
                      transition: 'all 0.15s',
                    }} />
                ))}
              </div>
            </div>
          </form>
        </div>
        {/* Sticky footer — always visible */}
        <div style={{
          padding: '12px 24px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <button type="submit" form="class-form" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {isEdit ? 'Save changes' : 'Create class'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClassesPage() {
  const classes = useStore(s => s.classes)
  const students = useStore(s => s.students)
  const deleteClass = useStore(s => s.deleteClass)
  const { show } = useToast()
  const [modal, setModal] = useState(null) // null | 'new' | class object

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-subtitle">{classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
          <Plus size={15} /> Add
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} />
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text2)' }}>No classes yet</p>
          <p>Create your first class to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('new')}>
            <Plus size={15} /> Create class
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classes.map(cls => {
            const count = students.filter(s => s.classId === cls.id).length
            return (
              <div key={cls.id} className="card" style={{ display: 'flex', gap: 14, padding: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${cls.color}22`, border: `1px solid ${cls.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cls.color, fontWeight: 800, fontSize: 13,
                }}>
                  {cls.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{cls.name}</div>
                  {cls.section && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{cls.section}</div>}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {cls.days?.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {cls.days.join(', ')}
                        {cls.timeStart && ` · ${cls.timeStart}${cls.timeEnd ? '–'+cls.timeEnd : ''}`}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Users size={10} /> {count} student{count !== 1 ? 's' : ''}
                    </span>
                    {cls.room && <span style={{ fontSize: 11, color: 'var(--text2)' }}>📍 {cls.room}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(cls)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (confirm(`Delete "${cls.name}"? This will also remove ${count} student(s).`)) {
                      deleteClass(cls.id); show('Class deleted', 'error')
                    }
                  }}><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ClassModal cls={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}