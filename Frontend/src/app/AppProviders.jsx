import { ToastProvider } from '@/shared/toast'
import { ConfirmProvider } from '@/shared/components/ui'
import { AuthProvider } from '@/features/auth'
import { FavoritesProvider } from '@/features/favorites'
import { CartProvider } from '@/features/cart'

/**
 * Orquestador central de proveedores de contexto de Glowe Beauty.
 *
 * Jerarquía estricta de anidamiento:
 * 1. ToastProvider: Capa más externa. Permite emitir notificaciones toast en cualquier contexto o callback hijo.
 * 2. ConfirmProvider: Permite abrir diálogos y confirmaciones modales asíncronas desde cualquier vista o flujo.
 * 3. AuthProvider: Estado de autenticación, sesión y roles. Puede emitir toasts al expirar sesión (401) o iniciar/cerrar sesión.
 * 4. FavoritesProvider: Lista de deseos. Requiere acceso a toasts para feedback de guardado/eliminado.
 * 5. CartProvider: Carrito de compras. Depende de notificaciones para agregar/quitar ítems y del estado de sesión.
 */
export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  )
}
