import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './store/AppContext'
import LoginPage        from './pages/LoginPage'
import PatientListPage  from './pages/PatientListPage'
import PatientDetailPage from './pages/PatientDetailPage'
import MapOverviewPage  from './pages/MapOverviewPage'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace/>
  return children
}

function PublicRoute({ children }) {
  const { user } = useApp()
  if (user) return <Navigate to="/patients" replace/>
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><LoginPage/></PublicRoute>
      }/>
      <Route path="/patients" element={
        <ProtectedRoute><PatientListPage/></ProtectedRoute>
      }/>
      <Route path="/patients/:id" element={
        <ProtectedRoute><PatientDetailPage/></ProtectedRoute>
      }/>
      <Route path="/map" element={
        <ProtectedRoute><MapOverviewPage/></ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/patients" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AppProvider>
  )
}
