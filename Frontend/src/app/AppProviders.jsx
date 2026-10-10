import { ToastProvider } from '@/shared/toast'
import { AuthProvider } from '@/features/auth'
import { FavoritesProvider } from '@/features/favorites'
import { CartProvider } from '@/features/cart'

/**
 * Orquestador central de proveedores de contexto de Glowe Beauty.
 *
 * Jerarquía estricta de anidamiento:
 * 1. ToastProvider: Capa más externa. Permite emitir notificaciones toast en cualquier contexto o callback hijo.
 * 2. AuthProvider: Estado de autenticación, sesión y roles. Puede emitir toasts al expirar sesión (401) o iniciar/cerrar sesión.
 * 3. FavoritesProvider: Lista de deseos. Requiere acceso a toasts para feedback de guardado/eliminado.
 * 4. CartProvider: Carrito de compras. Depende de notificaciones para agregar/quitar ítems y del estado de sesión.
 */
export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
