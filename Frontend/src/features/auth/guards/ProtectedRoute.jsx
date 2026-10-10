import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setChecking(false), 300)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/60 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
          <Orbit size={34} color="#ff758f" speed={1.4} />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-glowe-muted">Validando acceso</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (!requireAdmin && user?.role === 'admin' && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}
