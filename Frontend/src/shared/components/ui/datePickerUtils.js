export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const DAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

/**
 * Sanitiza y parsea cualquier valor de fecha a un objeto Date seguro (a las 00:00:00 locales).
 * Maneja cadenas ISO, fechas Date, números (timestamps), y objetos con propiedad `.value`.
 */
export const parseISODate = (value) => {
  if (value === null || value === undefined || value === '') return null

  // Si es un objeto contenedor (ej. evento sintético o { value: '...' })
  if (typeof value === 'object' && !(value instanceof Date)) {
    if (typeof value.value === 'string' || value.value instanceof Date) {
      return parseISODate(value.value)
    }
    if (value.target && (typeof value.target.value === 'string' || value.target.value instanceof Date)) {
      return parseISODate(value.target.value)
    }
    return null
  }

  // Si ya es una instancia de Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  // Si es un timestamp numérico
  if (typeof value === 'number') {
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  // Si no es string a este punto, retornar null
  if (typeof value !== 'string') return null

  const cleanStr = value.split('T')[0].trim()
  if (!cleanStr) return null

  const parts = cleanStr.split('-').map(Number)
  if (parts.length < 3) return null

  const [year, month, day] = parts
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return null

  return new Date(year, month - 1, day)
}

/**
 * Formatea un objeto Date a cadena ISO plana 'YYYY-MM-DD'.
 */
export const formatISODate = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : parseISODate(date)
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para visualización en español: 'DD de Mes, YYYY'.
 */
export const formatDisplayDate = (val) => {
  const d = parseISODate(val)
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear()
  return `${day} de ${month}, ${year}`
}
