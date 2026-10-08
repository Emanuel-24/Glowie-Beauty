# 🧠 PROJECT_STATE.md — Memoria Activa del Proyecto

> Memoria persistente del agente. Se actualiza al cerrar cada tarea/fase. Reglas en `AGENTS.md`; tablero de fases en `ROADMAP.md`.
> Última actualización: 05/10/2026 — FASE 3 (Optimización del Rendimiento del Agente y Scripts Autónomos).

---

## 1. Resumen Ejecutivo

**Glowe Beauty** es una tienda e-commerce comercializadora y distribuidora multimarca (retailer) de productos de belleza, maquillaje y cuidado capilar para Colombia (moneda COP), con panel administrativo.

```
Glowe Beauty/
├── Frontend/   SPA React 18 + Vite 5 + React Router 7 + Tailwind 3 (pnpm)
├── Backend/    API REST Express 4 + Mongoose 9 sobre MongoDB Atlas (ESM, pnpm)
├── Recursos/   Documentación y material de apoyo
└── Proyecto/   Material auxiliar
```

**Flujo de datos:** `Pages/Sections → Context/Hooks → services/ (api.js) → HTTP /api/* → routes → controllers (delgados) → services (negocio/BD) → models → MongoDB`.

- **Frontend:** capas `pages/`, `components/{layout,sections,ui}/`, `context/` (Auth, Cart, Favorites, Toast), `hooks/`, `services/`, `data/` (catálogo estático/mock), `styles/`. Soporte completo de alias `@/` en Vite y `jsconfig.json`. Scripts unificados `check`, `lint` y `test:unit`.
- **Backend:** `routes/` → `controllers/` → `services/` (capa implementada en FASE 2) → `models/` (User, Product, Category, Order, Payment). Middleware JWT en `middleware/auth.js`. Respuestas `{ success, data, message }`. Scripts unificados `check`, `lint` y `test:unit`.
- **Auth:** JWT + bcryptjs; token guardado en `localStorage` (`glowe:token:v1`) por `services/api.js`; rutas protegidas con `ProtectedRoute`.
- **Despliegue:** Vercel (ambos proyectos tienen `vercel.json`).
- **Pedido de cliente:** catálogo → carrito → checkout obligatorio autenticado → creación en BD (Pendiente / Sin pagos) → cierre asistido por WhatsApp.

### Estado de Brechas Técnicas
| Brecha | Detalle | Estado |
|--------|---------|--------|
| Capa `services/` en Backend | Controladores desacoplados de modelos delegando a servicios | ✅ Resuelto en FASE 2 |
| Alias `@/` en Frontend | Configurado en `vite.config.js` y `jsconfig.json` | ✅ Resuelto en FASE 2 |
| `.gitignore` estricto en raíz | Creado para excluir dependencias, builds, logs y temporales | ✅ Resuelto en FASE 2 |
| Ruido contextual de assets | Excluidos `Proyecto/`, diagramas pesados e imágenes/HTMLs de `Recursos/` | ✅ Resuelto en FASE 3 |
| Scripts de validación autónoma | Configurados `check`, `lint` y `test:unit` en Frontend y Backend | ✅ Resuelto en FASE 3 |
| SEO y optimización de carga | Metadatos dinámicos, Open Graph, Twitter, robots.txt, sitemap.xml, lazy loading y semántica | ✅ Resuelto en FASE 4 |
| Pruebas de integración y skill de mantenimiento | Suite de pruebas automatizadas con Node test runner y skill de verificación continua | ✅ Resuelto en FASE 5 |

---

## 2. Registro de Decisiones Técnicas y de Negocio (ADR)

> Formato: una entrada por decisión. No revertir una decisión `Aceptada` sin crear un ADR nuevo que la reemplace (`Reemplaza ADR-XXX`).

### ADR-001: PNPM como único package manager
- **Fecha:** 18/09/2026 · **Estado:** Aceptada
- **Contexto:** Existen `pnpm-lock.yaml` en Frontend y Backend; mezclar managers corrompe `node_modules` y locks.
- **Decisión:** Solo `pnpm`. Cualquier otro lockfile se reporta, no se borra sin aprobación.

### ADR-002: Frontend y Backend como proyectos independientes
- **Fecha:** 05/10/2026 · **Estado:** Aceptada
- **Contexto:** `Frontend/` y `Backend/` tienen su propio `package.json`, lockfile, `.env` y `vercel.json`.
- **Decisión:** Mantener dos aplicaciones desplegables por separado; comunicación exclusivamente por HTTP (`VITE_API_URL`).

### ADR-003: JavaScript (ESM) sin TypeScript
- **Fecha:** 05/10/2026 · **Estado:** Aceptada
- **Contexto:** Ambos proyectos usan `"type": "module"` y `.js/.jsx`; no hay `tsconfig`.
- **Decisión:** Mantener JavaScript. Alias de rutas resueltos con `jsconfig.json` y `vite.config.js`.

### ADR-004: Backend desacoplado por capa de servicios
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada (FASE 2)
- **Contexto:** Los controladores mezclaban lógica de negocio, validaciones y acceso directo a Mongoose.
- **Decisión:** `routes → controllers (delgados) → services (lógica y datos) → models`.
- **Consecuencias:** Implementados `authService`, `userService`, `categoryService`, `productService`, `orderService` y `paymentService`. Controladores actúan exclusivamente como adaptadores HTTP (`req`/`res`).

### ADR-005: Respuesta de API estandarizada
- **Fecha:** 05/10/2026 · **Estado:** Aceptada
- **Decisión:** Toda respuesta usa `{ success: boolean, data, message }`; errores devuelven `success: false, data: null`.

### ADR-006: Rol de la memoria del agente
- **Fecha:** 05/10/2026 · **Estado:** Aceptada
- **Decisión:** `AGENTS.md` (reglas) + `ROADMAP.md` (tablero) + `PROJECT_STATE.md` (estado/ADRs) forman la memoria activa del agente.

### ADR-007: Regla de Negocio - Autenticación Obligatoria y Sincronización de Carrito (Merge Strategy)
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** Los visitantes deben poder explorar y llenar carrito sin fricción, pero el checkout exige trazabilidad.
- **Decisión:**
  1. Exploración y adición de productos permitida para visitantes, almacenando el carrito localmente en `localStorage`.
  2. Al presionar finalizar compra, el login/registro es estrictamente obligatorio.
  3. Al iniciar sesión o registrarse, el frontend ejecuta una sincronización (*Merge Strategy*) combinando los productos del `localStorage` con el carrito persistido del usuario.
  4. Rol único de administración (`admin`) con control total sobre catálogo, pedidos y pagos.

### ADR-008: Regla de Negocio - Creación de Orden y Cierre Asistido por WhatsApp
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** Flujo de compra simple y adaptado al comercio en Colombia.
- **Decisión:**
  1. Al presionar "Comprar", el sistema genera inmediatamente el documento `Order` en la BD con `status: "Pendiente"`, `paymentStatus: "Sin pagos"` y código único de orden/factura.
  2. La plataforma redirige inmediatamente al cliente a WhatsApp con un mensaje pre-formateado con: ID de orden, desglose de productos/cantidades/total y método de pago seleccionado.
  3. Los cambios de estado de orden (*Procesando, Enviado, Entregado, Cancelado*) y estado de pago (*Sin pagos, Parcial, Pagado*) son operados manualmente por el Administrador.

### ADR-009: Regla de Negocio - Modelo de Inventario On-Demand (Bajo Pedido)
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** La operación no maneja almacenamiento previo de mercancía fija.
- **Decisión:** No existe bloqueo por stock en la tienda pública. Los productos permanecen disponibles para compra (`isAvailable: true` / sin restricciones de saldo cero) y se ocultan los contadores de inventario numérico de cara al cliente final.

### ADR-010: Regla de Negocio - Validación Estricta de Imágenes en Catálogo (Mínimo 2)
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** Garantizar calidad visual y confianza del comprador.
- **Decisión:** Es estrictamente obligatorio adjuntar un mínimo de 2 imágenes por producto (`images.length >= 2`). No se permiten *placeholders* automáticos ni publicaciones con una sola foto; la validación aplica tanto en UI como en backend.

### ADR-011: Regla de Negocio - Métodos de Pago y Soporte de Abonos
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** El cliente selecciona su método de pago previsto para coordinar la entrega.
- **Decisión:**
  1. Métodos habilitados en la orden: `CONTRA_ENTREGA`, `TRANSFERENCIA`, `EFECTIVO`, `ABONOS`.
  2. El método seleccionado se registra en la orden y se adjunta al mensaje de WhatsApp.
  3. La validación de comprobantes y el registro de abonos parciales o saldos es gestionada manualmente por el Admin en el panel.

### ADR-012: Regla de Negocio - Estructura de Combos (Bundles) y Ofertas Destacadas
- **Fecha:** 05/10/2026 · **Estado:** Aceptada (confirmada por negocio)
- **Contexto:** Manejo consistente de promociones, combos y destacados.
- **Decisión:**
  1. **Combos:** Se modelan con `type: "COMBO"` vinculando los IDs de los productos integrantes. La tarjeta muestra una imagen grupal única; el detalle exhibe la imagen grupal destacada más la galería de imágenes individuales de los productos del combo.
  2. **Ofertas:** El Admin puede asignar porcentajes de descuento (`discountPercentage` / `onSale`) y seleccionar exactamente qué 3 productos se muestran en el carrusel de ofertas destacadas (`isFeaturedOffer: true`).

### ADR-013: Optimización del Rendimiento del Agente y Scripts de Validación Autónoma
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada (FASE 3)
- **Contexto:** Las lecturas contextuales recursivas consumían tokens en archivos duplicados y binarios no ejecutables, y no existían scripts estandarizados para validación rápida.
- **Decisión:**
  1. Aislar del contexto del agente `Proyecto/` (duplicados legacy), `interactive_visual_im_*.html` y binarios/HTMLs de `Recursos/` vía `.gitignore`.
  2. Estandarizar scripts en `package.json` de Frontend y Backend: `pnpm check` (build/syntax check), `pnpm lint` (validación de código) y `pnpm test:unit` (ejecutor de pruebas nativo Node.js).
- **Consecuencias:** Validación rápida y ejecución de pruebas sin requerir dependencias externas adicionales.

### ADR-014: Configuración Dinámica de Tienda (SiteConfig), Tags y Analítica de Producto Más Vendido
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada (FASE 1 & 2 CMS)
- **Contexto:** La cabecera Hero, la sección de Comunidad Glowe y las etiquetas descriptivas eran estáticas en frontend. Se requería dinamismo configurable desde el Admin y analítica de ventas del producto top-seller.
- **Decisión:**
  1. **Modelo `SiteConfig`:** Documento único con `heroConfig` (`featuredProductId`, `floatingBadgeText`, `tagline`, `title`) y `communityConfig` (`imageUrl`, `title`, `link`). Endpoint público `GET /api/site-config` y protegido `PUT /api/site-config`.
  2. **Etiquetas (`tags`):** Modelo `Tag` y campo `tags` en `Product`. Endpoints CRUD en `/api/tags` y selector dinámico en el formulario del producto en `Admin.jsx`. Módulo dedicado en el panel administrativo.
  3. **Analítica Top-Seller:** Endpoint `GET /api/products/top-seller` que agrega ventas en órdenes con `status: "Completada"`. Fallback a `heroConfig.featuredProductId` o primer producto del catálogo.
  4. **Frontend dinámico:** `HeroSection.jsx` y `SocialProof.jsx` consumen la configuración en tiempo real con fallback resiliente.

---

## 3. Estado de Módulos Clave

| Módulo | Frontend | Backend | Estado | Pendientes inmediatos |
|--------|----------|---------|--------|-----------------------|
| Autenticación (login/registro/roles) | `Auth.jsx`, `AuthContext`, `ProtectedRoute`, `authService` | `authRoutes`, `authController` → `authService`, `User` | ✅ Backend listo / 🟡 Frontend | Implementar Merge Strategy del carrito tras login (ADR-007) |
| Usuarios / Perfil | `Perfil.jsx`, `userService` | `userRoutes`, `userController` → `userService` | ✅ | Servicios desacoplados y listos |
| Productos / Catálogo | `ProductGrid`, `ProductCard`, `Producto.jsx`, `productService` | `productRoutes`, `productController` → `productService`, `Product` | ✅ | Tags dinámicas y top-seller implementados |
| Categorías y Etiquetas | `categoryService`, `tagService`, `Admin.jsx` | `categoryRoutes`, `tagRoutes`, `Category`, `Tag` | ✅ | CRUD global de categorías y etiquetas en BD |
| Configuración Tienda (CMS) | `siteConfigService`, `HeroSection`, `SocialProof`, `Admin.jsx` | `siteConfigRoutes`, `SiteConfig` | ✅ | Hero y Comunidad administrables en panel |
| Carrito | `CartContext`, `CartDrawer`, `QuantityStepper` | — | 🟡 | Integrar Merge Strategy con localStorage al autenticar |
| Favoritos | `FavoritesContext`, `FavoritesDrawer`, `Favoritos.jsx` | — | ✅ | Persistencia local activa |
| Checkout / Pedidos | `Checkout.jsx`, `orderService` | `orderRoutes`, `orderController` → `orderService`, `Order` | 🟡 | Adaptar pasarela a mensaje formateado de WhatsApp (ADR-008) |
| Pagos | `paymentService` | `paymentRoutes`, `paymentController` → `paymentService`, `Payment` | ✅ | Métodos `CONTRA_ENTREGA`, `TRANSFERENCIA`, `EFECTIVO`, `ABONOS` listos |
| Combos y Ofertas | `Combos.jsx`, `Ofertas.jsx`, `BundlesSection` | `Product` (`type: COMBO`, `isFeaturedOffer`) | 🟡 | Conectar vistas frontend con campos del modelo |
| Panel Admin | `Admin.jsx`, `AdminModal`, `DataTable`, `Pagination` | Rutas protegidas y controladores delegados | ✅ | Módulos de configuración web y tags integrados |

---

### ADR-014: Optimización SEO, Accesibilidad y Detalle de Combos
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada (FASE 4)
- **Contexto:** Mejorar visibilidad orgánica en buscadores, semántica HTML5, accesibilidad WCAG y alineación con las reglas de negocio de combos y ofertas (ADRs 010 y 012).
- **Decisión:**
  1. **SEO dinámico:** Hook `usePageMeta` para actualizar `<title>`, `<meta description>`, Open Graph, Twitter Cards, canonical y robots (`noindex` en rutas protegidas/privadas).
  2. **SEO técnico:** `robots.txt` y `sitemap.xml` estáticos en `public/`, metadatos globales en `index.html`.
  3. **Accesibilidad (a11y):** Un único `<main id="contenido-principal">` en `App.jsx`, skip link accesible, jerarquía de encabezados `h1`–`h3` nivelada, imágenes con `alt` descriptivo y `loading="lazy"`.
  4. **Combos y Ofertas (ADR-012):** Ruta `/combos/:id` con `ComboDetalle.jsx` mostrando la imagen grupal principal y la galería de productos incluidos; `GlowDeals` filtrando las 3 ofertas destacadas con su porcentaje de descuento.

---

## 3. Estado de Módulos Clave

| Módulo | Frontend | Backend | Estado | Pendientes inmediatos |
|--------|----------|---------|--------|-----------------------|
| Autenticación (login/registro/roles) | `Auth.jsx`, `AuthContext`, `ProtectedRoute`, `authService` | `authRoutes`, `authController` → `authService`, `User` | ✅ Backend listo / 🟡 Frontend | Implementar Merge Strategy del carrito tras login (ADR-007) |
| Usuarios / Perfil | `Perfil.jsx`, `userService` | `userRoutes`, `userController` → `userService` | ✅ | Servicios desacoplados y listos |
| Productos / Catálogo | `ProductGrid`, `ProductCard`, `Producto.jsx`, `productService` | `productRoutes`, `productController` → `productService`, `Product` | ✅ | SEO, lazy loading y datos validados |
| Categorías | `categoryService`, `Maquillaje/Cabello.jsx` | `categoryRoutes`, `categoryController` → `categoryService`, `Category` | ✅ | Servicios desacoplados y vistas optimizadas |
| Carrito | `CartContext`, `CartDrawer`, `QuantityStepper` | — | 🟡 | Integrar Merge Strategy con localStorage al autenticar |
| Favoritos | `FavoritesContext`, `FavoritesDrawer`, `Favoritos.jsx` | — | ✅ | Persistencia local activa |
| Checkout / Pedidos | `Checkout.jsx`, `orderService` | `orderRoutes`, `orderController` → `orderService`, `Order` | 🟡 | Adaptar pasarela a mensaje formateado de WhatsApp (ADR-008) |
| Pagos | `paymentService` | `paymentRoutes`, `paymentController` → `paymentService`, `Payment` | ✅ | Métodos `CONTRA_ENTREGA`, `TRANSFERENCIA`, `EFECTIVO`, `ABONOS` listos |
| Combos y Ofertas | `Combos.jsx`, `ComboDetalle.jsx`, `Ofertas.jsx`, `BundlesSection`, `GlowDeals` | `Product` (`type: COMBO`, `isFeaturedOffer`) | ✅ | Vistas desacopladas, foto grupal, galería individual y ofertas destacadas |
| Panel Admin | `Admin.jsx`, `AdminModal`, `DataTable`, `Pagination` | Rutas protegidas y controladores delegados | 🟡 | Incluir selector de `isFeaturedOffer` y gestión de combos |

---

### ADR-015: Suite de Pruebas de Integración y Skill de Mantenimiento Continuo
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada (FASE 5)
- **Contexto:** Garantizar estabilidad funcional, verificación libre de regresiones sin dependencias pesadas y transferir el conocimiento operativo a los agentes vía skills.
- **Decisión:**
  1. **Suite de pruebas nativa:** Implementada en `Backend/tests/integration.test.js` utilizando `node:test` y `node:assert/strict` de Node.js v22 (0 dependencias añadidas). Valida sanitización de credenciales y roles (ADR-007), normalización de catálogo y stock on-demand (ADR-009, ADR-010), cálculo de balance en órdenes y métodos de pago (ADR-008, ADR-011) y categorías.
  2. **Skill `glowe-maintenance`:** Creada en `.agents/skills/glowe-maintenance/SKILL.md` y registrada en `skills-lock.json`, encapsulando el gatekeeper de verificación continua (`pnpm check` en Frontend y Backend, `pnpm test:unit`).
  3. **Cierre de Roadmap:** Se alcanza el 100% de objetivos técnicos y de arquitectura previstos.

### ADR-016: Modelo de Negocio Comercializador y Distribuidor Multimarca (Retailer)
- **Fecha:** 05/10/2026 · **Estado:** Aceptada e Implementada
- **Contexto:** Se detectaron conceptos equívocos que asociaban la marca a un fabricante. Glowe Beauty opera como tienda e-commerce comercializadora y distribuidora de marcas aliadas reconocidas de belleza, maquillaje y cuidado capilar.
- **Decisión:**
  1. **Posicionamiento comercial:** Retailer multimarca de cosméticos 100% originales (Trendy, Montoc, Ame, Olaplex, L'Oréal, Maybelline, etc.).
  2. **Modelado de datos:** Inclusión del campo `brand` (String, default: 'Glowe Select', trim: true) en esquema `Product.js`, normalizadores de backend y seeds.
  3. **Frontend y UX:** Soporte de `brand` en `ProductCard.jsx`, `Producto.jsx` (con badge de autenticidad y distribución autorizada), `productService.js` y panel administrativo `Admin.jsx`.
  4. **Propuesta de valor:** Copy optimizado para resaltar curaduría de marcas, garantía de originalidad, cobertura de envíos en Colombia y asesoría por WhatsApp.

---

## 3. Estado de Módulos Clave

| Módulo | Frontend | Backend | Estado | Pendientes inmediatos |
|--------|----------|---------|--------|-----------------------|
| Autenticación (login/registro/roles) | `Auth.jsx`, `AuthContext`, `ProtectedRoute`, `authService` | `authRoutes`, `authController` → `authService`, `User` | ✅ 100% | Pruebas de sanitización y roles pasando |
| Usuarios / Perfil | `Perfil.jsx`, `userService` | `userRoutes`, `userController` → `userService` | ✅ 100% | Servicios desacoplados y listos |
| Productos / Catálogo | `ProductGrid`, `ProductCard`, `Producto.jsx`, `productService` | `productRoutes`, `productController` → `productService`, `Product` | ✅ 100% | SEO, lazy loading, hover crossfade y tags dinámicos |
| Configuración del Sitio (Hero & Comunidad) | `Admin.jsx`, `siteConfigService`, `HeroSection` | `siteConfigRoutes`, `siteConfigService`, `SiteConfig` | ✅ 100% | CMS dinámico de Hero, producto destacado y comunidad |
| Etiquetas y Búsqueda Global | `Descubrir.jsx`, `ProductGrid`, `EditorialMakeup`, `HairCareSection`, `tagService` | `tagRoutes`, `tagService`, `Tag`, `Product.tags` | ✅ 100% | Búsqueda integrada, chips activos [X], tags clickeables |
| Categorías | `categoryService`, `Maquillaje/Cabello.jsx` | `categoryRoutes`, `categoryController` → `categoryService`, `Category` | ✅ 100% | Servicios desacoplados y validados |
| Carrito | `CartContext`, `CartDrawer`, `QuantityStepper` | — | ✅ 100% | Persistencia local activa, sincronización lista |
| Favoritos | `FavoritesContext`, `FavoritesDrawer`, `Favoritos.jsx` | — | ✅ 100% | Persistencia local activa, lazy loading implementado |
| Checkout / Pedidos | `Checkout.jsx`, `orderService` | `orderRoutes`, `orderController` → `orderService`, `Order` | ✅ 100% | Flujo desacoplado en servicios y validado en tests |
| Pagos | `paymentService` | `paymentRoutes`, `paymentController` → `paymentService`, `Payment` | ✅ 100% | Métodos `CONTRA_ENTREGA`, `TRANSFERENCIA`, `EFECTIVO`, `ABONOS` validados |
| Combos y Ofertas | `Combos.jsx`, `ComboDetalle.jsx`, `Ofertas.jsx`, `BundlesSection`, `GlowDeals` | `Product` (`type: COMBO`, `isFeaturedOffer`) | ✅ 100% | Vistas desacopladas, foto grupal, galería individual y ofertas destacadas |
| Panel Admin | `Admin.jsx`, `AdminModal`, `DataTable`, `Pagination` | Rutas protegidas y controladores delegados | ✅ 100% | Gestión de Hero, Comunidad, Tags globales y asignación |

---

## 4. Bitácora de Fases

| Fase | Estado | Fecha | Notas |
|------|--------|-------|-------|
| 0 | ✅ Completada | 18/09/2026 | Auditoría inicial y reparación de `node_modules` |
| 1 | ✅ Completada | 05/10/2026 | Context Layer (`AGENTS.md` y `PROJECT_STATE.md`) |
| 2 | ✅ Completada | 05/10/2026 | Reglas de Negocio (ADR-007 a 012), Capa `services/` backend, alias `@/` y `.gitignore` |
| 3 | ✅ Completada | 05/10/2026 | Reducción de ruido contextual (ADR-013), scripts `check`, `lint` y `test:unit` |
| 4 | ✅ Completada | 05/10/2026 | SEO, accesibilidad a11y, detalle de combos y ofertas (ADR-014) |
| 5 | ✅ Completada | 05/10/2026 | Suite de pruebas de integración, skill de mantenimiento y cierre de Roadmap al 100% (ADR-015) |
| 1 & 2 (CMS) | ✅ Completada | 05/10/2026 | Modelos `SiteConfig`, `Tag`, `Product.tags`, endpoint `/top-seller`, CMS Admin para Hero, Comunidad y Tags |
| 3 (Hero & UI) | ✅ Completada | 05/10/2026 | Hero `#1 más vendido`, Showcase dinámico con microcard de precio COP, WhatsApp y crossfade en tarjetas |
| 4 (Footer & Social) | ✅ Completada | 05/10/2026 | Métodos de pago estilizados (Bancolombia, Nequi, Efectivo), hover gradients de redes, limpieza de newsletter duplicado |
| 5 (Búsqueda & Tags) | ✅ Completada | 05/10/2026 | Buscador integrado en `/descubrir`, chips de filtros activos con botón `[X]`, redirección por etiquetas desde editoriales |
| UX/UI Polish & Mobile | ✅ Completada | 08/10/2026 | Validaciones Auth tiempo real (nombre solo letras, password 8+ chars), Hero con microcard #1 fija, badge flotante editable en Admin, cargador Orbit sin parpadeos, Footer con logo ilustrado ampliado, tipografía armonizada, logos oficiales Bancolombia/Nequi sobre fondo neutro, transiciones suaves (500ms ease-in-out) en redes sociales, Navbar mobile con brand visible y bottom nav flotante con Lucide-react |
