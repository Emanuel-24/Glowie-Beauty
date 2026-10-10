const metaEnv =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (typeof process !== 'undefined' && process.env) || {}

const defaultApiUrl = 'http://localhost:5000/api'
const configuredApiUrl =
  metaEnv.VITE_API_URL || metaEnv.VITE_API_BASE_URL || defaultApiUrl

export const env = {
  API_URL: String(configuredApiUrl).replace(/\/+$/, ''),
  WHATSAPP_NUMBER: metaEnv.VITE_WHATSAPP_NUMBER || '',
}
