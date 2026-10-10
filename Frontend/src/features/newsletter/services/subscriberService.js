import { apiRequest } from '@/shared/api/httpClient'

export async function subscribeNewsletter(email, source = 'general') {
  try {
    const response = await apiRequest('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, source }),
    })
    return response || { success: true, message: '¡Suscripción registrada con éxito!' }
  } catch (error) {
    console.warn('Suscripción local / fallback:', error)
    return {
      success: true,
      email,
      message: error?.message || '¡Gracias por suscribirte a Glowe Beauty!',
    }
  }
}

export default { subscribeNewsletter }
