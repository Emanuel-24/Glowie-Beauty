# 🗺️ Hoja de Ruta del Proyecto - Glowe Beauty

> Este documento sirve como memoria persistente y tablero de control para la IA y el equipo de desarrollo. Marcar con `[x]` a medida que se completen las tareas.

## 📊 Estado del Proyecto
- **Fase Actual:** Plan Integral de Mejoras Finalizado con Éxito (100%)
- **Última fase completada:** Fase 6 (Usuarios, Seguridad, Sesiones y Consistencia) — 11/10/2026
- **Progreso General:** 100% (6 de 6 fases de mejoras completadas)

`[██████████] 100%`

| Fase de Mejoras | Estado |
|---|---|
| 1. Componentes UI de Control y Experiencia Global | ✅ Completada |
| 2. Dashboard y Exportación Temporal | ✅ Completada |
| 3. Catálogo, Productos, Categorías y Etiquetas | ✅ Completada |
| 4. Ofertas Flash y Lógica Glow Deals | ✅ Completada |
| 5. Pedidos, Ventas y Checkout Web | ✅ Completada |
| 6. Usuarios, Seguridad, Sesiones y Consistencia | ✅ Completada |

---

### FASE 1: Preparación de la Memoria y Reglas de la IA (Context Layer)
- [x] Crear el archivo de reglas de desarrollo para la IA (`AGENTS.md` o `.agrules` en la raíz)
  - [x] Definir el stack tecnológico exacto y versiones clave (React, Node/Express, MongoDB/Mongoose, Tailwind, etc.)
  - [x] Declarar convenciones de código (camelCase/pascalCase, componentes funcionales, imports absolutos `@/`)
  - [x] Especificar reglas estrictas de arquitectura (frontend aislado de BD, controladores delgados delegando a servicios)
  - [x] Configurar restricción de seguridad: prohibido modificar variables sensibles o `.env` sin confirmación explícita
- [x] Crear el archivo `PROJECT_STATE.md` (Memoria activa del proyecto)
  - [x] Redactar un resumen ejecutivo de la arquitectura general
  - [x] Registrar decisiones técnicas clave (ADRs cortas) para prevenir refactorizaciones redundantes

---

### FASE 2: Auditoría y Reestructuración de Encarpetado (Clean Architecture / Feature-based)
- [x] Exportar e inspeccionar el árbol actual de carpetas
  - [x] Desacoplar módulos frontend (separar UI pura de vistas de negocio)
  - [x] Organizar backend por capas explícitas (`routes`, `controllers`, `services`, `models`, `middlewares`, `utils`)
- [x] Estandarizar nombres de archivos y rutas de importación
  - [x] Configurar alias de rutas en `tsconfig.json` / `jsconfig.json` (ej: `@components/*`, `@services/*`, `@models/*`)
- [x] Crear / optimizar el archivo `.gitignore` estricto
  - [x] Excluir assets pesados, entornos locales, `node_modules` y carpetas de build para acelerar el contexto del agente

---

### FASE 3: Optimización del Rendimiento del Agente (Velocidad de Contexto)
- [x] Reducir el ruido contextual
  - [x] Mover documentación pesada, assets visuales y archivos de diseño a una carpeta ignorada por el agente
- [x] Definir scripts de validación autónoma en `package.json`
  - [x] Crear script de verificación rápida de tipos y sintaxis (`npm run check` o `npm run lint`)
  - [x] Crear script de ejecución de pruebas filtradas (`npm run test:unit`)

---

### FASE 4: SEO, Accesibilidad y Buenas Prácticas Frontend
- [x] Auditoría y configuración SEO Base
  - [x] Configurar metadatos globales (`<title>`, `<meta description>`, OpenGraph, Twitter Cards)
  - [x] Validar estructura semántica HTML (`<header>`, `<main>`, `<nav>`, `<footer>`, único `<h1>` por vista)
  - [x] Generar `sitemap.xml` y `robots.txt`
- [x] Optimización de Frontend e UI
  - [x] Implementar carga diferida (*lazy loading*) para componentes pesados e imágenes
  - [x] Garantizar atributos `alt` descriptivos en todas las imágenes del catálogo

---

### FASE 5: Automatización de Pruebas y Validación (Tooling / Skills)
- [x] Configurar flujo de verificación continua
  - [x] Establecer la regla de ejecutar `npm run lint` y `npm run test` antes de dar cualquier tarea por completada
- [x] Crear pruebas de integración críticas
  - [x] Implementar test para el flujo de autenticación (Login / Logout / Control de Roles)
  - [x] Implementar test para la consulta e importación de productos

---

### PLAN DE REESTRUCTURACIÓN FRONTEND Y DESACOPLAMIENTO (Fases 0 a 10)
- [x] **Fase 0: Red de Seguridad:** Baseline metrics (`docs/baseline-build.txt`), tag `pre-refactor`, CI base.
- [x] **Fase 1: Higiene del Monorepo:** Workspace PNPM unificado, único `pnpm-lock.yaml`, scripts en raíz.
- [x] **Fase 2: Alias y Normalización:** Configuración de alias `@/`, eliminación de imports ascendentes `../`.
- [x] **Fase 3: Código Muerto:** Purgado de componentes huérfanos (`Navbar.jsx`, `FavoritesDrawer.jsx`).
- [x] **Fase 4: Capa HTTP y Fin del Ciclo:** `shared/api/httpClient.js`, `tokenStorage.js`, desacoplamiento de 401.
- [x] **Fase 5: Mocks y Datos:** Erradicación de `src/data/`, mocks aislados en fixtures y utilidades puras.
- [x] **Fase 6: Design System y Shared:** Consolidación de UI en `shared/components/ui/`, hooks y toasts agnósticos.
- [x] **Fase 7: Features de Dominio:** Migración a `src/features/` bajo DAG estricto (7A: hoja, 7B: catálogo, 7C: conversión).
- [x] **Fase 8: Descomposición de Admin:** 8 pestañas modulares, exportaciones diferidas en `reportService.js`, eliminación de `Admin.jsx`.
- [x] **Fase 9: App Shell y Router Lazy:** `src/app/` con enrutador code-splitting (`React.lazy`), eliminación de carpetas legacy (`src/pages`, `src/components`, `src/services`).
- [x] **Fase 10: Endurecimiento y Cierre:** Reglas ESLint con límites de capa, CI con Madge (`madge --circular`), pruebas unitarias puras (29 tests) y ADR-0001.

---

### PLAN DE MEJORAS INTEGRALES (ADMIN Y TIENDA WEB - FASES 1 A 6)
- [x] **Fase 1: Componentes UI de Control y Experiencia Global:** `ButtonLoading`, `ConfirmDialog` / `useConfirm`, `PriceInput`, `CustomDatePicker` y normalización de modales sin pérdida de foco.
- [x] **Fase 2: Dashboard y Exportación Temporal:** Filtros analíticos de Año y Mes, gráfica mensual de ventas, modal reutilizable `ExportReportModal` para exportaciones por rango de fechas (Excel/PDF).
- [x] **Fase 3: Catálogo, Productos, Categorías y Etiquetas:** Erradicación del bug de foco en categorías, creación automática de tags, integridad relacional (bloqueo de borrado si hay dependencias), ciclo de vida de productos con trazabilidad de ventas, precio coste y modales de ver detalle para productos y combos.
- [x] **Fase 4: Ofertas Flash y Lógica Glow Deals:** Reestructuración de modal de ofertas con mini-buscador de productos (`OfferProductSelector`), acción directa `Zap` en catálogo con redirección fluida, y filtrado estricto de ofertas destacadas en carrusel Glow Deals.
- [x] **Fase 5: Pedidos, Ventas y Checkout Web:** Diagnóstico y reparación de compras invitadas (middleware `optionalProtect`), unificación a 3 métodos de pago estándar, pantalla de éxito con enlace directo a WhatsApp (`CheckoutSuccess`), bifurcación administrativa entre "Pedidos" entrantes (`IncomingOrdersTab`) y "Ventas" confirmadas (`OrdersTab`).
- [x] **Fase 6: Usuarios, Seguridad, Sesiones y Consistencia:** Consistencia de badges de estado y stock en todas las tablas, modal interactiva `CreateUserModal` con autogeneración reactiva de correo `nombre.apellido@glowe.com`, expiración diferenciada de sesiones JWT (24h admin vs 60d cliente), edición y carga local de imágenes WebP en Comunidad Glowe, notificaciones de pedidos pendientes en `AdminHeader` y prevención de pérdida de datos con `useUnsavedChangesWarning`.

