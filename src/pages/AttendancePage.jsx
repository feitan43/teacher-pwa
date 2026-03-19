import { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle, XCircle, ClipboardList, ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store'

export default function AttendancePage() {
  const navigate = useNavigate()
  const attendance = useStore(s => s.attendance)
  const students = useStore(s => s.students)
  const classes = useStore(s => s.classes)
  const setActiveSession = useStore(s => s.setActiveSession)

  const [filterClass, setFilterClass] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const filtered = attendance.filter(a => {
    const matchClass = !filterClass || a.classId === filterClass
    const matchDate = !filterDate || a.date === filterDate
    return matchClass && matchDate
  })

  // Group by date then class
  const grouped = filtered.reduce((acc, a) => {
    const key = `${a.date}::${a.classId}`
    if (!acc[key]) acc[key] = { date: a.date, classId: a.classId, records: [] }
    acc[key].records.push(a)
    return acc
  }, {})

  const sortedGroups = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{attendance.length} total records</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/scan')}>
          <ScanLine size={14} /> Scan
        </button>
      </div>

      {/* Filters */}
      {attendance.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ flex: '0 0 auto', width: 'auto' }} />
        </div>
      )}

      {attendance.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} />
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text2)' }}>No attendance records</p>
          <p>Scan student QR codes to record attendance</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/scan')}>
            <ScanLine size={14} /> Start scanning
          </button>
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="empty-state"><p>No records match your filter</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedGroups.map(group => {
            const cls = classes.find(c => c.id === group.classId)
            const classStudents = students.filter(s => s.classId === group.classId)
            const attendedIds = group.records.map(r => r.studentId)
            const absent = classStudents.filter(s => !attendedIds.includes(s.id))
            const rate = classStudents.length ? Math.round((attendedIds.length / classStudents.length) * 100) : 0

            return (
              <div key={`${group.date}-${group.classId}`} className="card">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${cls?.color || 'var(--accent)'}22`,
                    border: `1px solid ${cls?.color || 'var(--accent)'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cls?.color || 'var(--accent)', fontWeight: 700, fontSize: 11,
                  }}>
                    {cls?.name?.slice(0,2).toUpperCase() || '??'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{cls?.name || 'Unknown class'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                      {format(new Date(group.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: rate >= 75 ? 'var(--success)' : 'var(--warning)' }}>{rate}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{attendedIds.length}/{classStudents.length}</div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{
                    height: '100%',
                    width: `${rate}%`,
                    background: rate >= 75 ? 'var(--success)' : 'var(--warning)',
                    borderRadius: 2,
                  }} />
                </div>

                {/* Present */}
                {group.records.length > 0 && (
                  <div style={{ marginBottom: absent.length > 0 ? 10 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Present ({group.records.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {group.records.map(r => {
                        const student = students.find(s => s.id === r.studentId)
                        return (
                          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={12} color="var(--success)" />
                            <span style={{ flex: 1, fontSize: 13 }}>{student?.name || 'Unknown'}</span>
                            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{r.time}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Absent */}
                {absent.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Absent ({absent.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {absent.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <XCircle size={12} color="var(--danger)" />
                          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
