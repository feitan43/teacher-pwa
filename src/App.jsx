import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import SetupPage from './pages/SetupPage'
import DashboardPage from './pages/DashboardPage'
import ClassesPage from './pages/ClassesPage'
import StudentsPage from './pages/StudentsPage'
import AttendancePage from './pages/AttendancePage'
import ProfilePage from './pages/ProfilePage'
import QRScanPage from './pages/QRScanPage'

export default function App() {
  const teacher = useStore(s => s.teacher)

  if (!teacher) return (
    <BrowserRouter>
      <SetupPage />
      <Toast />
    </BrowserRouter>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/scan" element={<QRScanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
      <Toast />
    </BrowserRouter>
  )
}
