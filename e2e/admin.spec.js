import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Flujos del Panel Administrativo de Glowe Beauty', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como Root Admin
    await page.goto('/login')
    await page.fill('#auth-email', 'admin@glowe.com')
    await page.fill('#auth-password', 'admin123')
    await page.click('button:has-text("Entrar a mi cuenta")')
    await page.waitForURL('**/admin', { timeout: 15000 })
  })

  test('1. Dashboard: KPI Ganancia Estimada visible', async ({ page }) => {
    // Comprobar que el KPI "Ganancia Estimada" reemplazó al ticket promedio en el Dashboard
    const kpiTitle = page.locator('text=Ganancia Estimada')
    await expect(kpiTitle).toBeVisible({ timeout: 10000 })
  })

  test('2. Productos: Crear producto con archivo de imagen local', async ({ page }) => {
    // Navegar a módulo Productos usando el botón en la barra lateral
    const productsNavBtn = page.getByRole('button', { name: /^Productos\b/ })
    await productsNavBtn.click()

    // Abrir modal de nuevo producto usando el botón "+ Crear producto"
    const newProdBtn = page.getByRole('button', { name: /\+ Crear producto/i })
    await expect(newProdBtn).toBeVisible({ timeout: 10000 })
    await newProdBtn.click()

    // Llenar campos del formulario
    await page.fill('input[name="name"]', 'Fijador de Cejas Brow Styling Soap')
    await page.fill('input[name="brand"]', 'Trendy')
    await page.locator('input[type="number"]').fill('25')

    // Subir archivo de imagen local usando el input file
    const imagePath = path.resolve('docs/imgsProducts/gel mascara brow and lash/images.jpeg')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(imagePath)

    // Esperar a que la imagen se procese y optimice
    await expect(page.locator('text=Imagen lista para el catálogo')).toBeVisible({ timeout: 10000 })

    // Guardar producto con el botón "Crear producto" dentro de la modal
    const saveBtn = page.getByRole('dialog').getByRole('button', { name: 'Crear producto' })
    await saveBtn.click()

    // Verificar que el producto aparezca en el listado
    await expect(page.locator('text=Fijador de Cejas Brow Styling Soap').first()).toBeVisible({ timeout: 10000 })
  })

  test('3. Pedidos Entrantes: Visualización de Envío y Confirmación de Pedido', async ({ page }) => {
    // Navegar a Pedidos entrantes (etiqueta 'Pedidos' en sidebar)
    const incomingNavBtn = page.getByRole('button', { name: /^Pedidos\b/ })
    await incomingNavBtn.click()

    // Verificar encabezado de columna Envío
    await expect(page.locator('th:has-text("Envío")')).toBeVisible({ timeout: 10000 })

    // Verificar que la columna "Confirmar" fue eliminada y reside en la columna de Acciones
    await expect(page.locator('th:has-text("Confirmar")')).not.toBeVisible()

    // Confirmar un pedido si hay pedidos entrantes en la tabla
    const confirmBtn = page.locator('button[title="Confirmar pedido"]').first()
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click()
      const confirmDialogBtn = page.getByRole('button', { name: /sí, confirmar pedido/i })
      await expect(confirmDialogBtn).toBeVisible({ timeout: 5000 })
      await confirmDialogBtn.click()
      await expect(page.locator('text=Pedido confirmado')).toBeVisible({ timeout: 10000 })
    }
  })

  test('4. Ventas: Visualización de Envío, Modal Editar Venta y Tracking', async ({ page }) => {
    // Navegar a Ventas
    const salesNavBtn = page.getByRole('button', { name: /^Ventas\b/ })
    await salesNavBtn.click()

    // Verificar encabezado de columna Envío en Ventas
    await expect(page.locator('th:has-text("Envío")')).toBeVisible({ timeout: 10000 })

    // Abrir modal Editar Venta usando el botón de editar venta
    const editBtn = page.locator('button[title="Editar venta"]').first()
    await expect(editBtn).toBeVisible({ timeout: 10000 })
    await editBtn.click()

    // Verificar que la sección interactiva de tracking esté presente
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('text=Estado de la Venta (Tracking en tienda)')).toBeVisible({ timeout: 10000 })

    // Modificar estado de tracking a "En camino"
    const enCaminoBtn = dialog.getByRole('button', { name: 'En camino' })
    if (await enCaminoBtn.isVisible()) {
      await enCaminoBtn.click()
    }

    // Guardar venta
    const saveSaleBtn = page.getByRole('button', { name: /guardar venta/i })
    await saveSaleBtn.click()

    // Verificar toast de éxito
    await expect(page.locator('text=Venta actualizada')).toBeVisible({ timeout: 10000 })
  })

  test('5. Ventas / Abonos: Registrar Abono desde botón tarjeta con regla de mínimo $1.000', async ({ page }) => {
    // Navegar a Ventas
    const salesNavBtn = page.getByRole('button', { name: /^Ventas\b/ })
    await salesNavBtn.click()

    // Click en botón con icono de tarjeta (Registrar abono) en la tabla de Ventas
    const paymentActionBtn = page.locator('button[title="Registrar abono"]').first()
    await expect(paymentActionBtn).toBeVisible({ timeout: 10000 })
    await paymentActionBtn.click()

    // Modal Registrar Abono abierta
    const paymentDialog = page.getByRole('dialog')
    await expect(paymentDialog.locator('text=Registrar Abono')).toBeVisible({ timeout: 10000 })

    // Probar validación: ingresar $500 COP (menos del mínimo permitido de $1.000)
    const amountInput = paymentDialog.getByPlaceholder('1000')
    await amountInput.fill('500')

    // Debe mostrar advertencia del mínimo permitido de $1.000 COP
    await expect(paymentDialog.locator('text=El abono mínimo es de $1.000 COP')).toBeVisible({ timeout: 10000 })

    // Ingresar monto válido permitido ($10.000 COP)
    await amountInput.fill('10000')
    await paymentDialog.getByPlaceholder('Número de comprobante...').fill('REF-TEST-001')

    // Guardar abono usando "Confirmar abono"
    const submitPaymentBtn = paymentDialog.getByRole('button', { name: /confirmar abono/i })
    await submitPaymentBtn.click()

    // Verificar confirmación de abono exitoso
    await expect(page.locator('text=Abono registrado')).toBeVisible({ timeout: 10000 })
  })
})
