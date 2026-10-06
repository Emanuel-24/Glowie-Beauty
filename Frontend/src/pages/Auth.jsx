import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, resolveUserRoute } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import MosaicLens from '../components/ui/MosaicLens'
import { usePageMeta } from '@/hooks'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const messages = {
  login: {
    title: 'Hola, belleza',
    subtitle: 'Descubre una versión más luminosa de ti.',
    submit: 'Entrar a mi cuenta',
    footer: '¿Aún no tienes cuenta?',
    footerLink: 'Regístrate gratis',
    footerTo: '/registro',
  },
  register: {
    title: 'Crea tu cuenta',
    subtitle: 'Guarda tus favoritos y repite tu rutina ideal.',
    submit: 'Crear mi cuenta',
    footer: '¿Ya tienes cuenta?',
    footerLink: 'Inicia sesión',
    footerTo: '/login',
  },
}

export default function Auth() {
  const { login, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.pathname === '/registro' ? 'register' : 'login'
  const copy = messages[mode]

  usePageMeta({
    title: mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión',
    description: copy.subtitle,
    noindex: true,
  })

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const nameValid = form.name.trim().length >= 2
  const emailValid = useMemo(() => emailPattern.test(form.email.trim()), [form.email])
  const passwordValid = form.password.length >= 6
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    setError('')
    setShowPassword(false)
  }, [mode])

  const setField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const validate = () => {
    if (mode === 'register') {
      if (!nameValid) return 'Tu nombre debe tener al menos 2 caracteres.'
      if (!passwordValid) return 'La contraseña debe tener al menos 6 caracteres.'
      if (!passwordsMatch) return 'Las contraseñas no coinciden.'
    }
    if (!emailValid) return 'Revisa tu correo y contraseña antes de continuar.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setTouched({ name: true, email: true, password: true, confirmPassword: true })

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    const result =
      mode === 'login'
        ? await login(form.email, form.password)
        : await register({ name: form.name, email: form.email, password: form.password })
    setSubmitting(false)

    if (!result.ok) {
      setError(
        result.error ||
          (mode === 'login'
            ? 'No pudimos iniciar sesión. Revisa tus credenciales.'
            : 'No pudimos crear tu cuenta.'),
      )
      return
    }

    const destination = resolveUserRoute(result.user)
    showToast(
      mode === 'login' ? '¡Bienvenida de nuevo!' : '¡Cuenta creada!',
      mode === 'login' ? 'Sesión iniciada correctamente.' : 'Bienvenida a Glowe, tu sesión ya está activa.',
    )
    const from = location.state?.from
    navigate(from && from !== '/login' && from !== '/registro' ? from : destination, { replace: true })
  }

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden">
      <div className="absolute inset-0">
        <MosaicLens background="#FFD1E1" color1="#8DE2F7" color2="#FFE7A3" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-6 sm:py-10">
        <section className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-[0_28px_90px_rgba(101,73,107,0.18)] backdrop-blur-2xl sm:p-8">
            <div className="relative mb-7 grid grid-cols-2 rounded-full bg-white/60 p-1 shadow-inner shadow-white/60">
              <div
                aria-hidden
                className={`absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                  mode === 'register' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <Link
                to="/login"
                className={`relative z-10 rounded-full px-3 py-2.5 text-center text-sm transition-colors ${
                  mode === 'login' ? 'font-semibold text-glowe-dark' : 'font-medium text-glowe-muted hover:text-glowe-dark'
                }`}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className={`relative z-10 rounded-full px-3 py-2.5 text-center text-sm transition-colors ${
                  mode === 'register' ? 'font-semibold text-glowe-dark' : 'font-medium text-glowe-muted hover:text-glowe-dark'
                }`}
              >
                Crear cuenta
              </Link>
            </div>

            <div key={mode} className="animate-[fadeIn_0.4s_ease-out]">
              <div className="mb-7 text-center">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-glowe-pink-accent">Tu ritual empieza aquí</p>
                <h1 className="font-serif text-3xl text-glowe-dark">{copy.title}</h1>
                <p className="mt-2 text-sm text-glowe-muted">{copy.subtitle}</p>
              </div>

              {error && (
                <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {mode === 'register' && (
                  <div>
                    <label htmlFor="auth-name" className="sr-only">
                      Nombre completo
                    </label>
                    <div
                      className={`rounded-2xl border bg-white/70 transition-all ${
                        touched.name && !nameValid
                          ? 'border-rose-300 ring-2 ring-rose-100'
                          : nameValid && form.name
                            ? 'border-emerald-300 ring-2 ring-emerald-100'
                            : 'border-white/80 focus-within:border-glowe-pink-accent focus-within:ring-2 focus-within:ring-glowe-pink/20'
                      }`}
                    >
                      <Input
                        id="auth-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Nombre completo"
                        value={form.name}
                        onChange={setField}
                        aria-invalid={touched.name && !nameValid}
                        className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
                      />
                    </div>
                    {touched.name && !nameValid && (
                      <p className="mt-1.5 px-2 text-xs text-rose-600">Tu nombre debe tener al menos 2 caracteres.</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <div
                    className={`rounded-2xl border bg-white/70 transition-all ${
                      touched.email && !emailValid
                        ? 'border-rose-300 ring-2 ring-rose-100'
                        : emailValid && form.email
                          ? 'border-emerald-300 ring-2 ring-emerald-100'
                          : 'border-white/80 focus-within:border-glowe-pink-accent focus-within:ring-2 focus-within:ring-glowe-pink/20'
                    }`}
                  >
                    <Input
                      id="auth-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Correo electrónico"
                      value={form.email}
                      onChange={setField}
                      aria-invalid={touched.email && !emailValid}
                      className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
                    />
                  </div>
                  {touched.email && !emailValid && (
                    <p className="mt-1.5 px-2 text-xs text-rose-600">Introduce un correo válido.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="auth-password" className="sr-only">
                    Contraseña
                  </label>
                  <div
                    className={`flex items-center rounded-2xl border bg-white/70 transition-all ${
                      touched.password && !passwordValid
                        ? 'border-rose-300 ring-2 ring-rose-100'
                        : passwordValid && form.password
                          ? 'border-emerald-300 ring-2 ring-emerald-100'
                          : 'border-white/80 focus-within:border-glowe-pink-accent focus-within:ring-2 focus-within:ring-glowe-pink/20'
                    }`}
                  >
                    <Input
                      id="auth-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="Contraseña"
                      value={form.password}
                      onChange={setField}
                      aria-invalid={touched.password && !passwordValid}
                      className="!w-full !rounded-r-none !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="mr-2 rounded-full p-2 text-glowe-muted transition-colors hover:bg-white/80 hover:text-glowe-dark"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  {touched.password && !passwordValid && (
                    <p className="mt-1.5 px-2 text-xs text-rose-600">Usa al menos 6 caracteres.</p>
                  )}
                </div>

                {mode === 'register' ? (
                  <div>
                    <label htmlFor="auth-confirm" className="sr-only">
                      Confirmar contraseña
                    </label>
                    <div
                      className={`rounded-2xl border bg-white/70 transition-all ${
                        touched.confirmPassword && !passwordsMatch
                          ? 'border-rose-300 ring-2 ring-rose-100'
                          : passwordsMatch && form.confirmPassword
                            ? 'border-emerald-300 ring-2 ring-emerald-100'
                            : 'border-white/80 focus-within:border-glowe-pink-accent focus-within:ring-2 focus-within:ring-glowe-pink/20'
                      }`}
                    >
                      <Input
                        id="auth-confirm"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirmar contraseña"
                        value={form.confirmPassword}
                        onChange={setField}
                        aria-invalid={touched.confirmPassword && !passwordsMatch}
                        className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
                      />
                    </div>
                    {touched.confirmPassword && !passwordsMatch && (
                      <p className="mt-1.5 px-2 text-xs text-rose-600">Las contraseñas deben coincidir.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2 px-1 text-xs text-glowe-muted min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 accent-glowe-pink-accent" />
                      Recordarme
                    </label>
                    <a href="#forgot-password" className="font-medium text-glowe-pink-accent hover:underline">
                      Olvidé mi contraseña
                    </a>
                  </div>
                )}

                <Button type="submit" fullWidth loading={submitting} disabled={submitting} variant="gradient">
                  {copy.submit}
                </Button>
              </form>

              {mode === 'login' && (
                <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-glowe-muted">
                  <div className="h-px flex-1 bg-white/70" />
                  <span>o</span>
                  <div className="h-px flex-1 bg-white/70" />
                </div>
              )}

              <p className="mt-5 text-center text-sm text-glowe-muted">
                {copy.footer}{' '}
                <Link to={copy.footerTo} className="font-bold text-glowe-pink-accent hover:underline">
                  {copy.footerLink}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
