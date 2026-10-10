# ROADMAP.md — GLOWE BEAUTY

> **Estado:** FASE 0 cerrada (Auditoría) y FASE 1 cerrada (Design System, ambas 18/09/2026). Las fases 2–9 son **plan**, no trabajo iniciado.
> Estrategia validada por el dueño del proyecto. No avanzar a una fase sin autorización explícita.

---

## Principios transversales

- PNPM como único package manager.
- Frontend primero: velocidad, responsive, claridad visual, compra simple.
- No añadir dependencias sin autorización.
- Cada fase termina con validación (`pnpm build` + revisión de alcance) y actualización de `docs/`.

---

## FASE 0 — Auditoría y estabilización ✅ (cerrada)

**Objetivo:** entender el estado real y dejar el repo documentado y verificable.

**Entregables:** `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/UX_FLOWS.md`, `docs/ROADMAP.md`.

**Hallazgos relevantes para fases futuras:**
- ~~`node_modules` roto~~ → **REPARADO en FASE 0 (18/09/2026)** con `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` (recreó `node_modules` con las versiones del lockfile). Si el error `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` reaparece, repetir ese mismo comando.
- Sin backend, sin tests, sin lint, sin persistencia, sin detalle de producto, sin WhatsApp.
- Deuda detectada: `ui/Button.jsx` y `ui/Badge.jsx` sin uso, hook `useDisclosure` sin uso, export `getBundles` sin uso, newsletter duplicado en Footer y SocialProof.

**Criterio de terminación:** documento de auditoría aceptado por el dueño con el resumen de estado, funcionalidades y problemas.

---

## FASE 1 — Design System y base visual ✅ (COMPLETADA 18/09/2026)

**Objetivo:** definir e implementar el sistema de diseño único de marca (Glowe) y aplicarlo a los componentes atómicos antes de construir más UI.

**Entregables (estado real 18/09/2026):**
- ✅ Atómicos implementados y en uso: `Button` (variants/sizes/loading/disabled/focus-visible), `Badge` (tones), `Input` (+ `.glass-input`), `Card` (variants/radios), `NewsletterForm` (unifica Footer + SocialProof).
- ✅ Aplicados en: Header, HeroSection, ProductCard, GlowDeals, BundlesSection, CartDrawer, Footer, SocialProof, HairCareSection.
- ✅ Dead code eliminado (`useDisclosure`, `getBundles`, import muerto en HairCareSection).
- ✅ `pnpm build` en verde (75 módulos).
- ✅ **Decisiones de marca tomadas por el dueño:** tipografía → **Inter**; dark → **#2D2A2E**. Registradas en `DESIGN_SYSTEM.md`.

**Criterio de terminación:** atómicos en uso, build verde, documentado en `DESIGN_SYSTEM.md`, decisiones de marca cerradas — **acumplido**.

**Deuda traspasada a FASE 2:** estandarización de componentes interactivos bespoke (nav pills, chips quiz, steppers, CategoryPlayground, MobileBottomNav), revisión de SearchModal y toggleFavorite.

---

## FASE 2 — Landing / Home completa 🚧 EN CURSO

**Objetivo:** Home íntegra y potente que convierta a explorar el catálogo, con interacciones estandarizadas sobre el sistema de FASE 1.

**Funcionalidades:**
- Estandarizar componentes interactivos bespoke sobre los atómicos: nav pills del Header, chips del quiz (`FindYourGlow`), stepper +/− del carrito, `CategoryPlayground`, `MobileBottomNav` (y `EditorialMakeup`).
- Revisar lógica de `SearchModal` (agregar al carrito al seleccionar) y patrón `toggleFavorite` (return value no fiable en StrictMode) para interacción fluida y predecible.
- Consistencia visual y de estados (hover/focus/active/loading/empty) en todas las secciones de la landing.
- Composición final de Home (Hero, categorías, trust, social proof, promos) sobre el design system de FASE 1; SEO on-page básico (title/description, meta OG, semantic HTML).

**Dependencias:** FASE 1.

**Riesgos:** contenido estático duplicado; sobrecarga de secciones.

**Criterio de finalización:** Home responsive sin errores de consola, métricas de carga controladas, `pnpm build` OK.

---

## FASE 3 — Catálogo y Product Detail

**Estado: COMPLETADA (18/09/2026).** Catalogo con cache compartido (`services/api.js` memoizado via `productsCachePromise`), ruta `/producto/:id` con ficha completa (galeria, precio, descuento, rating, stock si existe, favorito, cantidad, relacionados), búsqueda que navega al detalle con `?q=` en URL, y filtros por categoria + tags. Pendiente honesto -> FASE 4: filtro de rango de precio combinado con categoria/tags en `ProductGrid`.

**Objetivo:** catálogo completo, filtros, búsqueda y ficha de producto.

**Funcionalidades:**
- Estado/cache de catálogo compartido (eliminar re-fetch por página); loading/empty/error reales.
- Ruta `/producto/:id` con ficha (galería, precio, descuento, rating, stock, favorito, cantidad, relacionados).
- Búsqueda que navega al detalle (y a `?q=` en URL).
- Filtros combinados (categoría + tags + precio) consistentes con el quiz.

**Dependencias:** FASE 1 (design system), eventual reemplazo del mock por API (FASE 7) sin romper la UI.

**Riesgos:** acoplar la UI a datos mock (`getProductById`); deriva en rendimiento (imágenes). Mitigación: mantener capa `services/` detrás de contratos estables.

**Criterio de finalización:** flujo catálogo→producto→carrito intacto; `pnpm build` OK; rutas y componentes documentados.

---

## FASE 4 — Carrito profesional y persistente

**Objetivo:** carrito robusto que sobreviva recargas y soporte el flujo de compra.

**Funcionalidades:**
- Persistencia en `localStorage` versionado (clave tipo `glowe:cart:v1`), con manejo de errores/incógnito.
- Drawer/página de carrito: cantidades, subtotal provisional, alerta de envío gratis (> $120.000), CTA claro.
- Refactor de lógica de negocio del carrito fuera de `CartDrawer` (hooks `useCart` con interfaz estable).
- Toast de confirmación accesible (no solo emoji).

**Dependencias:** FASE 1 (UI), FASE 3 (ficha para agregar qty).

**Riesgos:** corrupción de datos antiguos de storage (versionar y migrar); estados parciales.

**Criterio de finalización:** recargar página conserva carrito; casos vacío/incógnito contemplados; `pnpm build` OK.

---

## FASE 5 — Autenticación y cuentas

**Objetivo:** login/registro/recuperación y perfil para historial y favoritos en la nube.

**Funcionalidades:**
- Registro/inicio de sesión (email+contraseña; o social), recuperación de contraseña, sesión persistente.
- Perfil de usuario y gestión de datos de envío.
- Favoritos sincronizados y guardados.
- Compra invitado aún soportada (guest checkout).

**Dependencias:** FASE 4 (carrito por usuario), decisiones de FASE 7 (backend de auth) — puede anticiparse con autenticación mock si la FASE 7 no existe aún, marcándolo como MOCK.

**Riesgos:** seguridad de sesión/tokens; complejidad de sincronizar carrito anónimo ↔ cuenta.

**Criterio de finalización:** flujo auth completo, sesión recuperable, `pnpm build` OK.

---

## FASE 6 — Pedidos + WhatsApp

**Objetivo:** pedido estructurado → WhatsApp del negocio (objetivo de negocio prioritario).

**Funcionalidades:**
- Convertir checkout en flujo real: captura de contacto/entrega, validación, resumen, método de pago (efectivo/transferencia/PSE), confirmación.
- Generación de pedido estructurado (items, cantidades, total COP, cliente, envío).
- Deep link WhatsApp (`https://wa.me/<57…>?text=<mensaje codificado>`) con plantilla formateada del pedido.
- Número de negocio en configuración (env), nunca en el código o el frontend como secreto.
- Reemplazar `createOrder()` mock por handler real (aún local o contra API si FASE 7 ya existe).

**Dependencias:** FASE 4 (carrito), FASE 5 (datos de cliente si existe cuenta).

**Riesgos:** mensajes malformados (escapar texto), teléfonos inválidos, pérdida de estado al abrir WhatsApp (decisión: limpiar carrito tras generar el enlace o tras confirmación).

**Criterio de finalización:** generar pedido y abrir WhatsApp con mensaje correcto; pedido queda registrado (local o API); `pnpm build` OK.

---

## FASE 7 — Backend + base de datos

**Objetivo:** API y persistencia reales (productos, pedidos, usuarios, newsletter, deals).

**Funcionalidades:**
- Backend (Node — skills `nodejs-backend-patterns`/`nodejs-best-practices` disponibles; alternativa a evaluar): endpoints `/products`, `/products/:id`, `/deals`, `/bundles`, `/orders`, `/newsletter`, `/auth`.
- Base de datos con esquema (productos, categorías/tags, pedidos, usuarios, suscripciones).
- Secretos del backend (token WhatsApp, pagos, DB) SOLO en el servidor.
- Migración de `services/api.js` de mock a real sin tocar contrato de UI.

**Dependencias:** FASE 6 (contrato de pedido), FASE 3 (shape de producto).

**Riesgos:** seguridad (validación de entrada, auth, rate limiting), consistencia de datos, secretos expuestos en el frontend.

**Criterio de finalización:** API funcional y documentada; app consumiendo API real (mock marcado como legacy); `pnpm build` OK.

---

## FASE 8 — Panel administrativo

**Objetivo:** gestión del catálogo, pedidos y contenido por el negocio.

**Funcionalidades:**
- CRUD de productos/categorías/deals/bundles.
- Gestión de pedidos y estados (nuevo → confirmado → despachado → entregado).
- Dashboard básico (métricas: pedidos, ventas, top productos).
- Acceso restringido por roles (admin).

**Dependencias:** FASE 7 (API y auth).

**Riesgos:** permiso de acceso, validación de stock, complejidad del dashboard.

**Criterio de finalización:** operaciones CRUD y de pedidos operando contra API; `pnpm build` OK.

---

## FASE 9 — QA + seguridad + producción

**Objetivo:** robustez, rendimiento y lanzamiento a producción.

**Funcionalidades:**
- Suite de tests (unit/integration/E2E) y `pnpm lint` + `pnpm test` habilitados y ejecutados.
- Auditoría de accesibilidad (skill `accessibility`), SEO final (skill `seo`), performance (LCP/CLS, lazy routes, imágenes optimizadas).
- Seguridad: sanitización, secretos, rate limits, HTTPS, headers.
- Deploy a Vercel (`vercel.json` ya existe; revisar scripts de deploy de la skill antes de ejecutarlos).
- Actualización final de `docs/`.

**Dependencias:** FASE 7/8 (entorno real).

**Riesgos:** deudas pospuestas (mock, visual, deuda técnica) arrastradas; probar contra datos reales.

**Criterio de finalización:** `pnpm lint`, `pnpm test`, `pnpm build` en verde; site en producción con HTTPS, métricas y accesibilidad verificadas.

---

## Notas de trazabilidad

- Cada fase comienza leyendo `AGENTS.md` y actualiza `docs/` afectados al cerrar.
- Ningún mock debe tratarse como funcionalidad real; usar siempre la marca MOCK/NO IMPLEMENTADO en documentación.
- No instalar dependencias sin autorización, aunque una fase "lo pida".