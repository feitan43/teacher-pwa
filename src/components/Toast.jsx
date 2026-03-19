import { create } from 'zustand'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export const useToast = create((set) => ({
  toasts: [],
  show: (msg, type = 'success') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000)
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}))

export default function Toast() {
  const { toasts, remove } = useToast()
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {t.msg}
          <button onClick={() => remove(t.id)} style={{ marginLeft: 'auto', color: 'inherit', opacity: 0.6 }}>
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
