import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const getFirstName = (fullName) => {
  const value = (fullName || 'Usuario').trim()

  if (!value) return 'Usuario'

  const firstWord = value.split(/\s+/)[0]
  if (!firstWord) return 'Usuario'

  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const isAdmin = user?.role === 'admin'
  const firstName = getFirstName(user?.name)

  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="plain"
          size="icon"
          onClick={() => navigate('/login')}
          className="shrink-0 text-glowe-dark hover:bg-white/80 xl:hidden"
          title="Iniciar sesión"
          aria-label="Iniciar sesión"
        >
          <CircleUserRound className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="hidden items-center gap-2 xl:flex">
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate('/login')}
            className="px-4 shadow-md shadow-pink-200/60 backdrop-blur-md bg-white/70 border border-white/40"
          >
            Iniciar sesión
          </Button>
          <Button variant="gradient" size="sm" onClick={() => navigate('/registro')} className="px-4 shadow-none">
            Registrarse
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Button
        variant="plain"
        size="icon"
        onClick={() => navigate(isAdmin ? '/admin' : '/perfil')}
        className="shrink-0 text-glowe-dark hover:bg-white/80 xl:hidden"
        title={isAdmin ? 'Abrir panel administrativo' : 'Abrir perfil'}
        aria-label={isAdmin ? 'Abrir panel administrativo' : 'Abrir perfil'}
      >
        <CircleUserRound className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="hidden items-center gap-2 xl:flex">
      {isAdmin && (
        <Button variant="glass" size="sm" onClick={() => navigate('/admin')} className="px-4 shadow-sm backdrop-blur-md bg-white/70 border border-white/40 shadow-xl">
          Panel
        </Button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="hidden items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-left text-xs font-semibold text-glowe-dark shadow-xl backdrop-blur-md transition hover:bg-white/85 sm:flex"
          aria-label="Abrir menú de perfil"
          aria-expanded={profileMenuOpen}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink-accent to-glowe-blue-accent text-[10px] font-black text-white">
            {(user?.name || 'U').slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[110px] truncate">{firstName}</span>
        </button>

        {profileMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false)
                navigate('/perfil')
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-glowe-dark transition hover:bg-glowe-pink/10"
            >
              <span>Editar perfil</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
