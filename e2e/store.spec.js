import { test, expect } from '@playwright/test'

test.describe('Flujos de Tienda, Checkout y Perfil de Usuario', () => {
  test('1. Flujo completo de compra en Checkout con usuario autenticado', async ({ page }) => {
    // 1. Iniciar sesión como cliente
    await page.goto('/login')
    await page.fill('#auth-email', 'cliente@glowe.com')
    await page.fill('#auth-password', 'cliente123')
    await page.click('button:has-text("Entrar a mi cuenta")')
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 })

    // 2. Visitar el catálogo
    await page.goto('/descubrir')

    // 3. Agregar el primer producto disponible al carrito
    const addToCartBtn = page.locator('button[aria-label="Agregar al Carrito"]').first()
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 })
    await addToCartBtn.click()

    // 4. Ir a la página de checkout
    await page.goto('/checkout')

    // 5. Completar el formulario de contacto y entrega
    await expect(page.locator('#fullName')).toBeVisible({ timeout: 10000 })
    await page.fill('#fullName', 'Camila Morales')
    await page.fill('#cedula', '1098765432')
    await page.fill('#email', 'cliente@glowe.com')
    await page.fill('#phone', '3009876543')
    await page.fill('#address', 'Calle 127 # 14 - 30, Torre 2 Apto 804')
    await page.fill('#city', 'Bogotá')
    await page.fill('#department', 'Cundinamarca')
    await page.fill('#notes', 'Entregar en horario de oficina')

    // 6. Confirmar pedido
    const submitBtn = page.getByRole('button', { name: /confirmar pedido/i })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // 7. Verificar pantalla de confirmación
    await expect(page.locator('text=¡Pedido Recibido! ✨')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Camila Morales')).toBeVisible()
  })

  test('2. Aislamiento estricto en Perfil y visualización de Dirección y Método de Pago', async ({ page }) => {
    // Iniciar sesión como cliente
    await page.goto('/login')
    await page.fill('#auth-email', 'cliente@glowe.com')
    await page.fill('#auth-password', 'cliente123')
    await page.click('button:has-text("Entrar a mi cuenta")')
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 })

    // Navegar a Perfil
    await page.goto('/perfil')

    // Verificar que ve su pedido FAC-2026-002
    await expect(page.locator('text=FAC-2026-002')).toBeVisible({ timeout: 10000 })

    // Verificar que se muestre la dirección de entrega completa
    await expect(page.locator('text=Calle 127 # 14 - 30, Torre 2 Apto 804').first()).toBeVisible()

    // Verificar que se muestre el método de pago visible
    await expect(page.locator('text=Abono / Crédito').first()).toBeVisible()

    // Aislamiento estricto: NO debe ver pedidos de otros usuarios
    await expect(page.locator('text=Valentina Restrepo')).not.toBeVisible()
    await expect(page.locator('text=Laura Sofía Gómez')).not.toBeVisible()
  })

  test('3. Redirección automática de Admin fuera de /perfil hacia /admin', async ({ page }) => {
    // Iniciar sesión como admin
    await page.goto('/login')
    await page.fill('#auth-email', 'admin@glowe.com')
    await page.fill('#auth-password', 'admin123')
    await page.click('button:has-text("Entrar a mi cuenta")')
    await page.waitForURL('**/admin', { timeout: 10000 })

    // Intentar acceder explícitamente a /perfil
    await page.goto('/perfil')

    // Debe ser redirigido de inmediato a /admin
    await page.waitForURL('**/admin', { timeout: 10000 })
    expect(page.url()).toContain('/admin')
  })
})
