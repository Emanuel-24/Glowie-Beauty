/**
 * imageOptimizer.js — Pipeline de optimización de imágenes en cliente mediante Canvas API.
 * Redimensiona a dimensiones máximas y comprime a WebP con calidad 80-85% (peso objetivo <= 150 KB).
 */

export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Optimiza un archivo de imagen en cliente.
 * @param {File|Blob} file - Archivo de imagen a procesar
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxWidth - Ancho máximo (default 800)
 * @param {number} options.maxHeight - Alto máximo (default 800)
 * @param {number} options.quality - Calidad WebP 0-1 (default 0.82)
 * @returns {Promise<{ dataUrl: string, width: number, height: number, originalSize: number, optimizedSize: number, format: string }>}
 */
export async function optimizeImage(file, options = {}) {
  const { maxWidth = 800, maxHeight = 800, quality = 0.82 } = options

  if (!file || !(file instanceof Blob)) {
    throw new Error('Archivo inválido proporcionado para optimización.')
  }

  const originalSize = file.size

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo de imagen.'))
    }

    reader.onload = () => {
      const img = new Image()

      img.onerror = () => {
        reject(new Error('El archivo seleccionado no es una imagen válida o está dañado.'))
      }

      img.onload = () => {
        try {
          let { width, height } = img

          // Cálculo proporcional manteniendo relación de aspecto
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d', { alpha: true })
          if (!ctx) {
            throw new Error('No se pudo inicializar el contexto 2D de Canvas.')
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Exportar prioritariamente a WebP
          let format = 'image/webp'
          let dataUrl = canvas.toDataURL(format, quality)

          // Fallback a JPEG si el navegador no soporta exportación WebP
          if (!dataUrl.startsWith('data:image/webp')) {
            format = 'image/jpeg'
            dataUrl = canvas.toDataURL(format, quality)
          }

          // Calcular tamaño aproximado del DataURL base64 en bytes
          const head = dataUrl.indexOf(',') + 1
          const base64Length = dataUrl.length - head
          const optimizedSize = Math.round((base64Length * 3) / 4)

          resolve({
            dataUrl,
            width,
            height,
            originalSize,
            optimizedSize,
            format: format === 'image/webp' ? 'WebP' : 'JPEG',
          })
        } catch (err) {
          reject(err)
        }
      }

      img.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}

export default optimizeImage
