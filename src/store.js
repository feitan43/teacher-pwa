import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const useStore = create(
  persist(
    (set, get) => ({
      // --- Teacher Profile ---
      teacher: null,
      setTeacher: (data) => set({ teacher: data }),
      updateTeacher: (data) => set((s) => ({ teacher: { ...s.teacher, ...data } })),

      // --- Classes ---
      classes: [],
      addClass: (cls) => set((s) => ({
        classes: [...s.classes, { ...cls, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateClass: (id, data) => set((s) => ({
        classes: s.classes.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteClass: (id) => set((s) => ({
        classes: s.classes.filter(c => c.id !== id),
        students: s.students.filter(st => st.classId !== id)
      })),

      // --- Students ---
      students: [],
      addStudent: (student) => set((s) => ({
        students: [...s.students, {
          ...student,
          id: uuidv4(),
          qrToken: uuidv4(),
          createdAt: new Date().toISOString()
        }]
      })),
      updateStudent: (id, data) => set((s) => ({
        students: s.students.map(st => st.id === id ? { ...st, ...data } : st)
      })),
      deleteStudent: (id) => set((s) => ({
        students: s.students.filter(st => st.id !== id),
        attendance: s.attendance.filter(a => a.studentId !== id)
      })),
      regenerateQR: (id) => set((s) => ({
        students: s.students.map(st => st.id === id ? { ...st, qrToken: uuidv4() } : st)
      })),

      // --- Attendance ---
      attendance: [],
      markAttendance: (studentId, classId, sessionId, status = 'present') => {
        const today = new Date().toISOString().split('T')[0]
        set((s) => {
          const existing = s.attendance.find(
            a => a.studentId === studentId && a.classId === classId && a.date === today && a.sessionId === sessionId
          )
          if (existing) return s
          return {
            attendance: [...s.attendance, {
              id: uuidv4(),
              studentId,
              classId,
              sessionId,
              status,
              date: today,
              time: new Date().toLocaleTimeString()
            }]
          }
        })
      },
      getAttendanceForSession: (sessionId) => {
        return get().attendance.filter(a => a.sessionId === sessionId)
      },
      getStudentAttendance: (studentId) => {
        return get().attendance.filter(a => a.studentId === studentId)
      },

      // --- Active session for QR scanning ---
      activeSession: null,
      setActiveSession: (session) => set({ activeSession: session }),
      clearActiveSession: () => set({ activeSession: null }),
    }),
    { name: 'classpulse-store' }
  )
)

export default useStore
