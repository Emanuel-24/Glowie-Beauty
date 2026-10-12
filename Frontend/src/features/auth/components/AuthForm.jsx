import { useState } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'

export default function AuthForm({
  mode,
  copy,
  form,
  touched,
  nameValid,
  nameHasInvalidChars,
  emailValid,
  passwordValid,
  passwordsMatch,
  isFormValid,
  submitting,
  setField,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {mode === 'register' && (
        <div>
          <label htmlFor="auth-name" className="block text-xs font-semibold text-glowe-dark mb-1.5">
            Nombre completo
          </label>
          <div
            className={`rounded-2xl border bg-white/70 transition-all ${
              (touched.name && !nameValid) || nameHasInvalidChars
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
              placeholder="Ej: Maria Gomez"
              value={form.name}
              onChange={setField}
              aria-invalid={(touched.name && !nameValid) || nameHasInvalidChars}
              className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
            />
          </div>
          {nameHasInvalidChars ? (
            <p className="mt-1.5 px-2 text-xs text-rose-600">El nombre solo puede contener letras y espacios.</p>
          ) : touched.name && !nameValid ? (
            <p className="mt-1.5 px-2 text-xs text-rose-600">Tu nombre debe tener al menos 2 caracteres.</p>
          ) : null}
        </div>
      )}

      <div>
        <label htmlFor="auth-email" className="block text-xs font-semibold text-glowe-dark mb-1.5">
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
            placeholder="tucorreo@gmail.com"
            value={form.email}
            onChange={setField}
            aria-invalid={touched.email && !emailValid}
            className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
          />
        </div>
        {touched.email && !emailValid && (
          <p className="mt-1.5 px-2 text-xs text-rose-600">Introduce un correo válido (ej: tucorreo@gmail.com).</p>
        )}
      </div>

      <div>
        <label htmlFor="auth-password" className="block text-xs font-semibold text-glowe-dark mb-1.5">
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
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={setField}
            aria-invalid={touched.password && !passwordValid}
            className="!w-full !rounded-r-none !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="mr-2 rounded-full p-2 text-glowe-muted transition-colors hover:bg-white/80 hover:text-glowe-dark cursor-pointer"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </button>
        </div>
        {touched.password && !passwordValid && (
          <p className="mt-1.5 px-2 text-xs text-rose-600">La contraseña debe tener al menos 8 caracteres.</p>
        )}
      </div>

      {mode === 'register' ? (
        <div>
          <label htmlFor="auth-confirm" className="block text-xs font-semibold text-glowe-dark mb-1.5">
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
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={setField}
              aria-invalid={touched.confirmPassword && !passwordsMatch}
              className="!w-full !rounded-2xl border-0 bg-transparent !shadow-none ring-0 focus:!ring-0"
            />
          </div>
          {touched.confirmPassword && !passwordsMatch && (
            <p className="mt-1.5 px-2 text-xs text-rose-600">Las contraseñas deben coincidir y tener al menos 8 caracteres.</p>
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

      <Button
        type="submit"
        fullWidth
        loading={submitting}
        disabled={!isFormValid || submitting}
        variant="gradient"
        className={!isFormValid ? '!opacity-50 !cursor-not-allowed' : ''}
      >
        {copy.submit}
      </Button>
    </form>
  )
}
