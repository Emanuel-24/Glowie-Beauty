import { useState } from 'react'
import { subscribeNewsletter } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Input from './Input'
import Button from './Button'

export default function NewsletterForm({
  id = 'newsletter-email',
  size = 'md',
  stack = false,
  successMessage = '💚 ¡Suscripción exitosa! Bienvenida al Glow 💫',
  className = '',
}) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    const result = await subscribeNewsletter(email)
    setSending(false)
    if (result.success) {
      setSubscribed(true)
      showToast(
        '¡Bienvenida a la familia Glow! ✨',
        'Revisa tu correo para recibir tu sorpresa de bienvenida.',
        '💌',
      )
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 sm:flex-row sm:items-start ${stack ? 'sm:gap-3' : ''} ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Correo electrónico
      </label>
      <Input
        id={id}
        type="email"
        required
        size={size}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu correo electrónico"
        className="min-w-0 flex-1"
      />
      <Button
        type="submit"
        size={size}
        variant="primary"
        loading={sending}
        disabled={sending}
        className="w-full shrink-0 sm:w-auto"
      >
        {sending ? 'Enviando…' : 'Quiero mi Glow'}
      </Button>
      {subscribed && (
        <p className="text-[11px] text-glowe-blue-accent font-semibold sm:basis-full">{successMessage}</p>
      )}
    </form>
  )
}
