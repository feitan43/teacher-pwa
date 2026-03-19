import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import useStore from '../store'
import { useToast } from '../components/Toast'

export default function QRScanPage() {
  const navigate = useNavigate()
  const { show } = useToast()

  const students = useStore(s => s.students)
  const classes = useStore(s => s.classes)
  const attendance = useStore(s => s.attendance)
  const markAttendance = useStore(s => s.markAttendance)
  const activeSession = useStore(s => s.activeSession)

  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [selectedClass, setSelectedClass] = useState(activeSession?.classId || '')
  const [camError, setCamError] = useState(null)

  const scannerRef = useRef(null)

  // Always-fresh ref so the scan callback never goes stale
  const stateRef = useRef({})
  stateRef.current = { students, attendance, selectedClass, markAttendance }

  const todayStr = new Date().toISOString().split('T')[0]
  const sessionId = selectedClass ? `${selectedClass}-${todayStr}` : null
  const scannedToday = sessionId ? attendance.filter(a => a.sessionId === sessionId) : []
  const classStudents = selectedClass ? students.filter(s => s.classId === selectedClass) : []

  const onScanSuccess = (decodedText) => {
    const { students, attendance, selectedClass, markAttendance } = stateRef.current
    const sid = selectedClass ? `${selectedClass}-${todayStr}` : null
    if (!sid) return
    try {
      const data = JSON.parse(decodedText)
      const student = students.find(s => s.id === data.id && s.qrToken === data.token)
      if (!student) { setLastScan({ success: false, msg: 'Unknown QR code' }); return }
      const alreadyMarked = attendance.find(a => a.studentId === student.id && a.sessionId === sid)
      if (alreadyMarked) { setLastScan({ success: false, msg: `${student.name} already marked` }); return }
      markAttendance(student.id, selectedClass, sid, 'present')
      setLastScan({ success: true, msg: `${student.name} marked present` })
      if (navigator.vibrate) navigator.vibrate(100)
    } catch {
      setLastScan({ success: false, msg: 'Invalid QR code' })
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch { /* already stopped */ }
      scannerRef.current = null
    }
    setScanning(false)
    setCamError(null)
  }

  const startScanner = async () => {
    if (!selectedClass) {
      show('Select a class first', 'error')
      return
    }
    if (scannerRef.current) return

    setCamError(null)

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5Qrcode

      // Get rear camera if available, else default
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        setCamError('No camera found on this device.')
        scannerRef.current = null
        return
      }
      // Prefer back/environment camera
      const cam = cameras.find(c =>
        c.label.toLowerCase().includes('back') ||
        c.label.toLowerCase().includes('rear') ||
        c.label.toLowerCase().includes('environment')
      ) || cameras[cameras.length - 1]

      await html5Qrcode.start(
        cam.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => { } // ignore per-frame scan errors (no QR in frame yet)
      )
      setScanning(true)
    } catch (err) {
      scannerRef.current = null
      if (err?.name === 'NotAllowedError' || String(err).includes('NotAllowedError')) {
        setCamError('Camera permission denied. Please allow camera access and try again.')
      } else {
        setCamError(`Could not start camera: ${err?.message || err}`)
      }
    }
  }

  // Stop scanner when class changes
  useEffect(() => {
    if (scanning) stopScanner()
  }, [selectedClass])

  // Cleanup on unmount
  useEffect(() => () => { stopScanner() }, [])

  return (
    <div className="page fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Scanner</h1>
          <p className="page-subtitle">Scan student QR codes for attendance</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { stopScanner(); navigate(-1) }}>
          <X size={15} /> Close
        </button>
      </div>

      {/* Class selector */}
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Scanning for class</label>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Select class...</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>
          ))}
        </select>
      </div>

      {/* Scanner area */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>

        {/* Idle state */}
        {!scanning && !camError && (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              border: '2px dashed var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text3)',
            }}>
              <Camera size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Ready to scan</p>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                {selectedClass ? 'Tap below to open the camera' : 'Select a class first'}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={startScanner}
              disabled={!selectedClass}
              style={{ opacity: !selectedClass ? 0.5 : 1 }}
            >
              <Camera size={15} /> Start scanning
            </button>
          </div>
        )}

        {/* Camera error state */}
        {camError && (
          <div style={{
            padding: '32px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <AlertCircle size={32} color="var(--danger)" />
            <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>{camError}</p>
            <button className="btn btn-primary" onClick={startScanner}>
              <Camera size={15} /> Try again
            </button>
          </div>
        )}

        {/*
          #qr-reader must ALWAYS stay in the DOM.
          Html5Qrcode mounts a <video> element directly into this div.
          Hidden when not scanning so it takes up no visual space.
        */}
        <div
          id="qr-reader"
          style={{ width: '100%', display: scanning ? 'block' : 'none' }}
        />
      </div>

      {/* Stop button */}
      {scanning && (
        <button
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          onClick={stopScanner}
        >
          <X size={15} /> Stop scanner
        </button>
      )}

      {/* Last scan result */}
      {lastScan && (
        <div className="card" style={{
          marginBottom: 16,
          borderColor: lastScan.success ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {lastScan.success
            ? <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            : <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: lastScan.success ? 'var(--success)' : 'var(--danger)' }}>
              {lastScan.success ? 'Marked present!' : 'Scan failed'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{lastScan.msg}</div>
          </div>
        </div>
      )}

      {/* Session progress */}
      {selectedClass && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Session progress</span>
            <span className="badge badge-green">{scannedToday.length}/{classStudents.length}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              height: '100%',
              width: `${classStudents.length ? (scannedToday.length / classStudents.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
              borderRadius: 3, transition: 'width 0.3s ease',
            }} />
          </div>
          {scannedToday.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scannedToday.map(a => {
                const student = students.find(s => s.id === a.studentId)
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{student?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{a.time}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>No students scanned yet</p>
          )}
        </div>
      )}
    </div>
  )
}