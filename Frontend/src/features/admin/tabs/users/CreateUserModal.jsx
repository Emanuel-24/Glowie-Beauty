import { useState, useEffect } from 'react'
import { Eye, EyeOff, UserPlus, AlertCircle, Sparkles } from 'lucide-react'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, Input, Select, ButtonLoading } from '@/shared/components/ui'
import { createUser } from '@/features/admin/services/userService'
import { useToast } from '@/shared/toast'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'

const roleOptions = [
  { value: 'user', label: 'Cliente (Usuario de tienda)' },
  { value: 'editor', label: 'Colaborador / Ventas (Catálogo y Ofertas)' },
  { value: 'soporte', label: 'Soporte (Pedidos y Pagos)' },
  { value: 'admin', label: 'Administrador (Control total)' },
]

export const generateEmailSuggestion = (fullName = '') => {
  const cleanParts = String(fullName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  if (cleanParts.length === 0) return ''
  if (cleanParts.length === 1) return `${cleanParts[0]}@glowe.com`
  return `${cleanParts[0]}.${cleanParts[cleanParts.length - 1]}@glowe.com`
}

export default function CreateUserModal({
  isOpen,
  onClose,
  existingUsers = [],
  onUserCreated,
}) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('user')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const hasChanges = Boolean(name || email || password)
  useUnsavedChangesWarning(hasChanges && isOpen)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      setIsEmailManuallyEdited(false)
      setPassword('')
      setShowPassword(false)
      setRole('user')
      setError('')
      setSubmitting(false)
    }
  }, [isOpen])

  const handleNameChange = (e) => {
    const newName = e.target.value
    setName(newName)
    if (!isEmailManuallyEdited) {
      setEmail(generateEmailSuggestion(newName))
    }
    if (error) setError('')
  }

  const handleEmailChange = (e) => {
    setIsEmailManuallyEdited(true)
    setEmail(e.target.value)
    if (error) setError('')
  }

  // Validación de duplicado
  const isDuplicateEmail = Boolean(
    email.trim() &&
      existingUsers.some(
        (u) => (u.email || '').toLowerCase().trim() === email.toLowerCase().trim(),
      ),
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedName) {
      setError('El nombre completo es requerido.')
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    if (isDuplicateEmail) {
      setError('Este correo electrónico ya se encuentra registrado.')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role,
        status: 'Activo',
      }

      const res = await createUser(payload)
      const saved = res?.data ?? payload
      showToast('Usuario creado', `Se registró a ${trimmedName} correctamente.`, '👤')
      onUserCreated?.(saved)
      onClose()
    } catch (err) {
      setError(err?.message || 'No se pudo crear el usuario.')
      showToast('Error', err?.message || 'No se pudo crear el usuario.', '❌')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Usuario"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            Nombre Completo *
          </label>
          <Input
            value={name}
            onChange={handleNameChange}
            placeholder="Ej. Valentina Gómez"
            required
            className="w-full text-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
              Correo Electrónico *
            </label>
            {!isEmailManuallyEdited && name.trim() && (
              <span className="text-[10px] text-glowe-pink-accent font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sugerido automáticamente
              </span>
            )}
          </div>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="nombre.apellido@glowe.com"
            required
            className={`w-full text-xs ${isDuplicateEmail ? 'border-rose-400 focus:ring-rose-400' : ''}`}
          />
          {isDuplicateEmail && (
            <p className="mt-1 text-[11px] font-semibold text-rose-600">
              ⚠️ Ya existe un usuario con este correo electrónico.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            Contraseña Inicial *
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-glowe-muted hover:text-glowe-dark transition"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-muted">
            Rol Asignado
          </label>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roleOptions}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="glass" type="button" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <ButtonLoading
            type="submit"
            variant="gradient"
            loading={submitting}
            disabled={submitting || isDuplicateEmail}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Guardar usuario
          </ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
