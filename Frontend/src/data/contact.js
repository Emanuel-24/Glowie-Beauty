/**
 * Configuración y utilidades de contacto e integración WhatsApp para Glowe Beauty
 * Soporte garantizado para caracteres UTF-8 de 4 bytes, secuencias Unicode y emojis (ADR-008).
 */

export const CONTACT_CONFIG = {
  // Número de WhatsApp (configurable vía variable de entorno VITE_WHATSAPP_NUMBER o fallback estándar)
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER,
  // Mensaje predeterminado de bienvenida y asesoría
  defaultMessage: '¡Hola Glowe Beauty! Me gustaría consultar sobre productos, cotizar y hacer un pedido 💖',
}

/**
 * Sanitiza y normaliza cadenas Unicode (NFC), garantizando que no existan
 * surrogate pairs aislados o corruptos antes de codificar en UTF-8.
 * @param {string} text - Texto a sanitizar
 * @returns {string} Cadena bien formada en UTF-16 / Unicode NFC
 */
export const sanitizeUnicodeString = (text) => {
  if (typeof text !== 'string') return ''

  // Normalización estándar Unicode NFC (Canonical Composition)
  const normalized = text.normalize('NFC')

  // Soporte nativo para strings bien formadas (ECMAScript 2024 / Node 20+)
  if (typeof normalized.toWellFormed === 'function') {
    return normalized.toWellFormed()
  }

  // Fallback para entornos antiguos (sustituye surrogates huérfanos con el caracter de reemplazo Unicode)
  return normalized.replace(
    /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))|(?:[^\uD800-\uDBFF]|^)([\uDC00-\uDFFF])/g,
    '\uFFFD'
  )
}

/**
 * Codifica texto para URLs de WhatsApp asegurando preservación de 4 bytes UTF-8 y emojis
 * @param {string} text - Texto en plano
 * @returns {string} Texto percent-encoded seguro para URI
 */
export const encodeWhatsAppText = (text) => {
  const safeText = sanitizeUnicodeString(text)
  return encodeURIComponent(safeText)
}

/**
 * Limpia y normaliza un número de teléfono a solo dígitos
 * @param {string|number} phone - Número de teléfono
 * @returns {string} Teléfono numérico limpio
 */
export const cleanPhoneNumber = (phone) => {
  return String(phone || '').replace(/[^0-9]/g, '')
}

/**
 * Genera el enlace oficial a WhatsApp con número y mensaje codificado en UTF-8
 * @param {string} [message] - Mensaje personalizado con soporte completo de emojis
 * @param {string} [phone] - Número de teléfono opcional
 * @param {object} [options] - Opciones adicionales ({ useApi, useWeb })
 * @returns {string} URL formateada para WhatsApp (wa.me o api.whatsapp.com)
 */
export const getWhatsAppUrl = (
  message = CONTACT_CONFIG.defaultMessage,
  phone = CONTACT_CONFIG.whatsappNumber,
  options = {}
) => {
  const cleanPhone = cleanPhoneNumber(phone) || cleanPhoneNumber(CONTACT_CONFIG.whatsappNumber)
  const encodedText = encodeWhatsAppText(message)

  if (options.useApi) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
  }

  if (options.useWeb) {
    return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
  }

  // Estándar oficial wa.me
  return `https://wa.me/${cleanPhone}?text=${encodedText}`
}

/**
 * Formatea un mensaje estructurado de pedido para WhatsApp con emojis UTF-8 (ADR-008)
 * @param {object} orderData - Datos de la orden
 * @returns {string} Mensaje estructurado listo para codificar
 */
export const formatOrderWhatsAppMessage = ({
  orderId,
  customerName,
  items = [],
  total,
  paymentMethod,
  address,
  city,
}) => {
  const formattedTotal = total != null ? `$${Number(total).toLocaleString('es-CO')} COP` : ''
  const paymentLabels = {
    efectivo: 'Efectivo contra entrega 💵',
    tarjeta: 'Tarjeta débito / crédito 💳',
    nequi: 'Nequi / Daviplata 📱',
    transferencia: 'Transferencia Bancaria 🏦',
    CONTRA_ENTREGA: 'Contra entrega 💵',
    TRANSFERENCIA: 'Transferencia 🏦',
    EFECTIVO: 'Efectivo 💵',
    ABONOS: 'Plan de Abonos 📝',
  }
  const paymentText = paymentLabels[paymentMethod] || paymentMethod || 'A coordinar'

  const itemsList = items
    .map((item) => {
      const qty = item.qty || item.quantity || 1
      const name = item.name || item.title || 'Producto'
      const price = item.price ? ` ($${Number(item.price * qty).toLocaleString('es-CO')})` : ''
      return `• ${qty}x ${name}${price}`
    })
    .join('\n')

  const lines = [
    '🛍️ *¡Hola Glowe Beauty! Acabo de registrar mi pedido.*',
    '',
    `📋 *Orden:* #${orderId || 'PENDIENTE'}`,
    `👤 *Cliente:* ${customerName || 'Cliente'}`,
    city || address ? `📍 *Entrega:* ${[city, address].filter(Boolean).join(' - ')}` : null,
    `💳 *Método de pago:* ${paymentText}`,
    '',
    '📦 *Productos:*',
    itemsList || '• Sin productos detallados',
    '',
    formattedTotal ? `✨ *Total:* ${formattedTotal}` : null,
    '',
    '¿Podrían confirmarme la disponibilidad y fecha estimada de entrega? ¡Muchas gracias! 💖',
  ].filter((line) => line !== null)

  return lines.join('\n')
}

/**
 * Genera la URL completa de WhatsApp para un pedido registrado
 * @param {object} orderData - Datos de la orden
 * @param {string} [phone] - Número de teléfono opcional
 * @returns {string} URL de WhatsApp con el mensaje del pedido
 */
export const getOrderWhatsAppUrl = (orderData, phone = CONTACT_CONFIG.whatsappNumber) => {
  const message = formatOrderWhatsAppMessage(orderData)
  return getWhatsAppUrl(message, phone)
}
