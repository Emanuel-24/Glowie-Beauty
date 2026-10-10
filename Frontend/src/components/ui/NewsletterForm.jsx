import { useState } from 'react'
import { subscribeNewsletter } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Input from './Input'
import Button from './Button'

export default function NewsletterForm({
  id = 'newsletter-email',
  size = 'md',
  stack = false,
  source = 'newsletter',
  placeholder = 'Tu correo electrónico',
  buttonText = 'Quiero mi Glow',
  buttonVariant = 'primary',
  successMessage = '💚 ¡Suscripción exitosa! Bienvenida al Glow 💫',
  toastTitle = '¡Bienvenida a la familia Glow! ✨',
  toastMessage = 'Te notificaremos cuando tengamos nuevas ofertas exclusivas.',
  toastEmoji = '💌',
  className = '',
}) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return

    const cleanEmail = email.trim()
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.')
      showToast('Correo inválido', 'Verifica el formato del correo (ej. nombre@correo.com)', '⚠️')
      return
    }

    setErrorMsg('')
    setSending(true)

    try {
      const result = await subscribeNewsletter(cleanEmail, source)
      setSending(false)

      if (result?.success !== false) {
        setSubscribed(true)
        showToast(toastTitle, result?.message || toastMessage, toastEmoji)
        setEmail('')
        setTimeout(() => setSubscribed(false), 6000)
      } else {
        setErrorMsg(result?.message || 'No se pudo registrar la suscripción.')
        showToast('Atención', result?.message || 'Ocurrió un error al registrar el correo.', '⚠️')
      }
    } catch (err) {
      setSending(false)
      setErrorMsg('Error de conexión. Inténtalo de nuevo.')
      showToast('Error', 'No pudimos conectar con el servidor. Inténtalo más tarde.', '❌')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 ${stack ? 'sm:flex-col sm:gap-3' : 'sm:flex-row sm:items-start'} ${className}`}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">
          Correo electrónico
        </label>
        <Input
          id={id}
          type="email"
          required
          size={size}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errorMsg) setErrorMsg('')
          }}
          placeholder={placeholder}
          aria-invalid={Boolean(errorMsg)}
          className="w-full"
        />
        {errorMsg && (
          <p className="mt-1 text-left text-xs font-semibold text-rose-500" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size={size}
        variant={buttonVariant}
        loading={sending}
        disabled={sending}
        className="w-full shrink-0 sm:w-auto"
      >
        {sending ? 'Registrando…' : buttonText}
      </Button>
      {subscribed && (
        <p className="text-[12px] text-teal-700 font-semibold sm:basis-full" role="status">
          {successMessage}
        </p>
      )}
    </form>
  )
}
