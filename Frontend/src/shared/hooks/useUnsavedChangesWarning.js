import { useEffect } from 'react'

/**
 * useUnsavedChangesWarning — Advertencia ante pérdida de datos no guardados.
 * Activa el listener 'beforeunload' del navegador cuando existen formularios o modales
 * con modificaciones pendientes.
 * @param {boolean} hasChanges - Indicador de si existen cambios sin persistir.
 */
export function useUnsavedChangesWarning(hasChanges = false) {
  useEffect(() => {
    if (!hasChanges) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?'
      return event.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanges])
}

export default useUnsavedChangesWarning
