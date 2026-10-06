# UX_FLOWS.md — GLOWE BEAUTY

> **Estado:** FASE 0 (Auditoría) — 18/09/2026.
> Flujos **ACTUALES** (lo que existe y funciona hoy) vs **OBJETIVO** (lo que se construirá en Fases 3–6). Marcas: IMPLEMENTADO / PARCIAL / MOCK / NO IMPLEMENTADO.

---

## 1. Navegación principal

### ACTUAL — IMPLEMENTADO
- **Escritorio (`md+`)**: `Header.jsx` fijo arriba (`sticky`) con: barra anuncio ("Envíos gratis > $120.000"), logo, nav de 6 accesos (Inicio, Maquillaje, Cabello, Ofertas, Combos, Descubrir) + acciones (buscar, favoritos con badge, carrito con contador).
- **Móvil**: `MobileBottomNav.jsx` flotante inferior con 5 accesos (Maquillaje, Cabello, Ofertas, Combos, Descubrir) — no incluye "Inicio" ni "Carrito".
- `NotFound` para rutas inexistentes con CTA a `/`.
- El logo siempre navega a `/`.

### OBJETIVO
- Mantener la navegación actual; valorar agregar acceso a carrito/favoritos explícito en móvil (hoy el carrito solo se abre desde Header, oculto en móvil → **brecha**).
- Header/Footer con links de ayuda funcionales (hoy "Preguntas Frecuentes", "Políticas" etc. son `href="#"` semilla — ver §10).

---

## 2. Descubrimiento de productos

### ACTUAL — PARCIAL/MOCK
- **Home**: `HeroSection` (CTAs a `/descubrir`), `CategoryPlayground` (4 categorías → rutas), `TrustBadges`, `SocialProof` (feed social + newsletter).
- **Páginas de categoría**: `/maquillaje` y `/cabello` con sección editorial + grilla con `categoryLock`.
- **Ofertas** `/ofertas`: `GlowDeals` (3 deals con countdown + añadir al carrito).
- **Combos** `/combos`: `BundlesSection` (4 kits con precio y "Comprar Kit").
- **Descubrir** `/descubrir`: quiz "Encuentra tu Glow" por 6 tags (`?tag=` en URL) + grilla filtrable por categoría (pills).
- **Datos**: 16 productos estáticos en `src/data/products.js` (imágenes Unsplash). Sin paginación, sin búsqueda por servidor, sin ordenamiento.

### OBJETIVO (FASE 3)
- Filtros combinados robustos sobre catálogo real, búsqueda con estado URL (`?q=`), posible avez paginación/carga infinita, y rating/stock reales. Mantener quiz por tags como diferenciador de marca.

---

## 3. Búsqueda

### ACTUAL — IMPLEMENTADO (local, por productos cargados)
- `SearchModal.jsx`: se abre desde Header (lupa), busca en `products` por `name`/`category`/`tags` (case-insensitive), muestra resultados con precio, y **al hacer clic agrega el producto directo al carrito** y navega a `/descubrir`. Tiene empty state ("No encontramos productos…").
- Limitaciones: no muestra stock, no navega a ficha de producto (no existe), el agregado directo al carrito desde búsqueda es un atajo que puede confundir (sin confirmación de cantidad).

### OBJETIVO (FASE 3)
- Búsqueda que navegue al detalle del producto; resultados tipados (producto/categoría/tag); soporte para búsqueda de texto desde URL y desde servidor cuando exista la API.

---

## 4. Ficha / Detalle de producto

### ACTUAL — **NO IMPLEMENTADO**
- No existe ruta `/producto/:id` ni componente de detalle.
- Las `ProductCard` no son clicables hacia una ficha (el único "carrito rápido" es el botón +).
- `getProductById(id)` sí existe en `services/api.js` como mock (lo usan Deals y Bundles para añadir al carrito), pero **no hay página de detalle**.

### OBJETIVO (FASE 3)
- Ruta de detalle con: galería, descripción, precios/descuento, rating, favorito, selector de cantidad, estado de stock, "agregar al carrito", badges (tipo best seller), productos relacionados, SEO por producto.

---

## 5. Favoritos

### ACTUAL — PARCIAL
- `FavoritesContext.jsx`: guarda ids en memoria; `ProductCard` tiene corazón (toggle + toast); el contador se muestra en el Header.
- **No hay página de favoritos**: el corazón del Header navega a `/descubrir` (todo), no a una lista de favoritos.
- Favoritos **no persisten** (se pierden al recargar).

### OBJETIVO (FASE 3/5)
- Página/lista de favoritos consultable, persistencia (localStorage primero, cuenta después), y sincronización con cuenta al tener auth.

---

## 6. Carrito

### ACTUAL — IMPLEMENTADO (en memoria) + CHECKOUT MOCK
- `CartContext.jsx`: `addItem` (suma qty si existe), `removeItem` (decrementa, elimina en 0), `clearCart`, `itemCount`, `total`, y apertura/cierre del drawer.
- `CartDrawer.jsx`: lista ítems (imagen, nombre, precio, qty con +/−), total estimado, empty state con CTA a `/descubrir`, y botón **"Finalizar Compra ✨"**.
- Flujo de checkout hoy: click en "Finalizar Compra" → `createOrder({items,total})` (mock con `orderId: GLOWE-<timestamp>`) → toast "¡Pedido en camino!" → `clearCart()` + cierra drawer. **No recoge datos del cliente, no hay confirmación de datos, no hay WhatsApp.**
- Línea de ayuda: Envíos gratis > $120.000 solo en la barra anuncio (no es un validador en el carrito).
- **Persistencia: NO IMPLEMENTADA** (carrito en memoria).

### OBJETIVO (FASE 4)
- Carrito persistente (localStorage versionado), drawer/checkout con resumen claro, validación de envíos, captura de datos del comprador (nombre/teléfono/ciudad/dirección), mensajes de envío, agregar/quitar cantidades eficientes y CTA claro a WhatsApp (FASE 6).

---

## 7. Usuario invitado

### ACTUAL — IMPLEMENTADO (de facto)
- Toda la compra es de invitado: no hay login ni datos de usuario. El único dato personal recogido es el email de newsletter (mock).

### OBJETIVO (FASE 5+)
- Compra invitado / guest checkout explícito, opcional cuenta para historial y favoritos en la nube.

---

## 8. Usuario autenticado

### ACTUAL — **NO IMPLEMENTADO**
- No hay autenticación, cuentas, sesiones ni historial.

### OBJETIVO (FASE 5)
- Registro/login (email/contraseña o social), recuperación, perfil, historial de pedidos, favoritos sincronizados.

---

## 9. Pedido + WhatsApp (flujo objetivo)

### ACTUAL — **NO IMPLEMENTADO / MOCK**
- El "checkout" actual solo simula un pedido y muestra un toast; **no genera un pedido estructurado, no abre WhatsApp, no registra nada**.
- Piezas mock existentes: `createOrder()` en `services/api.js` (400ms fake).
- No hay: número de WhatsApp configurado, plantilla de mensaje, payload de pedido, validación de teléfono, historial.

### OBJETIVO (FASE 6)
```
Cliente → selecciona productos → carrito → datos de entrega/contacto
→ se genera pedido estructurado (items, total, cliente, método de pago, envío)
→ se prepara/valida el resumen
→ se abre WhatsApp (deep link wa.me/<negocio>) con mensaje formateado del pedido
→ el negocio confirma por WhatsApp y gestiona la conversación
```
- Piezas necesarias a futuro: `services/order` (builder + validación), utilidades de formato de mensaje (COP, items, total), config del número de negocio (env con prefijo obligatorio `57…`), soporte para método de pago (efectivo/transferencia/PSE se muestra hoy solo como texto en Footer).

---

## 10. Newsletter

### ACTUAL — IMPLEMENTADO (mock) + DUPLICADO
- Formulario idéntico en `Footer.jsx` y `SocialProof.jsx` con `subscribeNewsletter()` (mock éxito, sin validación de email). Toast de bienvenida en ambos.
- Estado de éxito local (`subscribed`) en cada componente.

### OBJETIVO (FASE 6/7)
- Un solo componente reutilizable y validación/feedback real; suscripción registrada en backend (FASE 7).

---

## 11. Contacto / Soporte

### ACTUAL — PARCIAL (placeholders)
- Footer "Ayuda & Soporte": enlaces `href="#"` sin destino real ("Preguntas Frecuentes", "Políticas de Envío", "Cambios y Devoluciones", "Contacto directo WhatsApp").
- Redes sociales (`Instagram`, `TikTok`, `WhatsApp`) también `href="#"`.
- TrustBadges prometen "Atención Cercana | Te asesoramos por WhatsApp" pero **no hay ningún enlace WhatsApp funcional** en la app.

### OBJETIVO (FASE 6)
- Enlaces reales (URLs de marca, `wa.me` con número de negocio), FAQs/Políticas, y canal WhatsApp funcional.

---

## 12. Resumen flujo horizontal (de punta a punta)

| Paso | ACTUAL | OBJETIVO |
|---|---|---|
| VISITANTE → HOME | IMPLEMENTADO (`Inicio`) | sin cambios mayores |
| CATEGORÍAS | IMPLEMENTADO (playground + editorial) | + filtros avanzados |
| PRODUCTOS | PARCIAL (solo grilla, sin detalle) | + ficha/tag/stock/SEO |
| PRODUCT DETAIL | **NO IMPLEMENTADO** | FASE 3 |
| CARRITO | IMPLEMENTADO (memoria) | persistente (FASE 4) |
| CHECKOUT/PEDIDO | **MOCK** (toast) | estructurado + WhatsApp (FASE 6) |
| AUTENTICACIÓN | NO IMPLEMENTADO | FASE 5 |
| HISTORIAL PEDIDOS | NO IMPLEMENTADO | FASE 5/6 + backend FASE 7 |
| BACKEND/DB | NO IMPLEMENTADO | FASE 7 |