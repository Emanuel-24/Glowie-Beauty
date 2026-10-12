/**
 * stringUtils.js — Utilidades puras para manipulación y normalización de texto.
 */

/**
 * Normaliza una cadena de texto para búsquedas insensibles a mayúsculas, minúsculas,
 * tildes y diacríticos (ej. "Pestañas" -> "pestanas", "Ácido" -> "acido").
 * @param {string} value
 * @returns {string}
 */
export const normalizeText = (value = '') => {
  if (value === null || value === undefined) return ''
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Evalúa si un objeto / fila coincide con un término de búsqueda ignorando diacríticos
 * y mayúsculas/minúsculas.
 * @param {Object} row - Fila o entidad
 * @param {string} query - Término de búsqueda
 * @param {string[]} [searchableKeys] - Claves prioritarias de búsqueda opcionales
 * @returns {boolean}
 */
export const rowMatchesQuery = (row, query = '', searchableKeys = []) => {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return true
  if (!row || typeof row !== 'object') return false

  // Si se definen claves explícitas para búsqueda
  if (Array.isArray(searchableKeys) && searchableKeys.length > 0) {
    return searchableKeys.some((key) => {
      const val = row[key]
      if (val === null || val === undefined) return false
      if (Array.isArray(val)) {
        return val.some((v) => normalizeText(v).includes(normalizedQuery))
      }
      return normalizeText(val).includes(normalizedQuery)
    })
  }

  // Filtrado universal multi-campo (omite data URLs base64 gigantes y campos técnicos)
  return Object.entries(row).some(([key, val]) => {
    // Excluir cadenas binarias pesadas o campos visuales internos
    if (key === 'image' && typeof val === 'string' && val.startsWith('data:')) return false
    if (key === 'rawProduct' || key === 'rawTag' || key === 'statusTone' || key === 'roleTone') return false

    if (val === null || val === undefined) return false
    if (typeof val === 'string' || typeof val === 'number') {
      return normalizeText(val).includes(normalizedQuery)
    }
    if (Array.isArray(val)) {
      return val.some((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return normalizeText(item).includes(normalizedQuery)
        }
        return false
      })
    }
    return false
  })
}

export default {
  normalizeText,
  rowMatchesQuery,
}
