/**
 * Utilidades de sanitización, Unicode y manipulación de texto para Glowe Beauty.
 * Soporte garantizado para caracteres UTF-8 de 4 bytes, secuencias Unicode y emojis (ADR-008).
 */

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
 * Limpia y normaliza un número de teléfono a solo dígitos
 * @param {string|number} phone - Número de teléfono
 * @returns {string} Teléfono numérico limpio
 */
export const cleanPhoneNumber = (phone) => {
  return String(phone || '').replace(/[^0-9]/g, '')
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
